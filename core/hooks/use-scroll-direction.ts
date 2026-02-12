"use client";

import { useState, useEffect, useCallback, useRef } from "react";

/* ─────────────────────────────────────────────────────
   USE SCROLL DIRECTION
   Tracks scroll direction and distance for adaptive UI.
   Returns "up" | "down" and whether user has scrolled
   past a threshold (for collapsing nav).
   ───────────────────────────────────────────────────── */

interface ScrollState {
    /** Current scroll direction */
    direction: "up" | "down" | "idle";
    /** Whether the user has scrolled past the collapse threshold */
    isScrolled: boolean;
    /** Absolute scroll position */
    scrollY: number;
}

export function useScrollDirection(threshold = 64): ScrollState {
    const [state, setState] = useState<ScrollState>({
        direction: "idle",
        isScrolled: false,
        scrollY: 0,
    });
    const lastY = useRef(0);
    const ticking = useRef(false);

    const update = useCallback(() => {
        const y = window.scrollY;
        const diff = y - lastY.current;

        setState({
            direction: diff > 0 ? "down" : diff < 0 ? "up" : "idle",
            isScrolled: y > threshold,
            scrollY: y,
        });

        lastY.current = y;
        ticking.current = false;
    }, [threshold]);

    useEffect(() => {
        const onScroll = () => {
            if (!ticking.current) {
                requestAnimationFrame(update);
                ticking.current = true;
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, [update]);

    return state;
}
