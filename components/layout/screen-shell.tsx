"use client";

import { Footer } from "./footer";

/* ─────────────────────────────────────────────────────
   SCREEN SHELL
   Unified page wrapper. Adapts content width per
   breakpoint to complement the adaptive nav:
   
   Mobile  → full width, px-4
   Tablet  → max-w-3xl centered  
   Desktop → max-w-5xl (sidebar already provides structure)
   ───────────────────────────────────────────────────── */

interface ScreenShellProps {
    children: React.ReactNode;
    /** Optional loading state — renders skeleton placeholder */
    loading?: boolean;
    /** Skeleton to render during loading */
    skeleton?: React.ReactNode;
    /** Remove default padding */
    flush?: boolean;
    /** Additional class names */
    className?: string;
}

export function ScreenShell({
    children,
    loading = false,
    skeleton,
    flush = false,
    className = "",
}: ScreenShellProps) {
    return (
        <main
            className={`
                min-h-[100dvh]
                w-full
                max-w-2xl md:max-w-3xl lg:max-w-5xl
                mx-auto
                ${flush ? "" : "px-4 py-6 sm:px-6 md:px-8"}
                ${className}
            `}
        >
            {loading && skeleton ? skeleton : (
                <>
                    {children}
                    {!flush && <Footer />}
                </>
            )}
        </main>
    );
}
