"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/* ─────────────────────────────────────────────────────
   GLASS CARD
   The primary container in BoxDrop.
   No borders. Frosted depth. Glides on hover.
   ───────────────────────────────────────────────────── */

interface GlassCardProps extends HTMLMotionProps<"div"> {
    /** Elevation level controls shadow intensity */
    elevation?: "sm" | "md" | "lg";
    /** Enable hover lift animation */
    interactive?: boolean;
    /** Glass intensity */
    intensity?: "subtle" | "default" | "heavy";
}

const intensityMap = {
    subtle: "glass-subtle",
    default: "glass",
    heavy: "glass-heavy",
};

export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    (
        {
            elevation = "md",
            interactive = false,
            intensity = "default",
            className = "",
            children,
            ...props
        },
        ref
    ) => {
        return (
            <motion.div
                ref={ref}
                className={`
          ${intensityMap[intensity]}
          rounded-[var(--radius-lg)]
          p-4
          ${className}
        `}
                {...(interactive && {
                    whileHover: { scale: 0.995, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } },
                    whileTap: { scale: 0.98, transition: { duration: 0.1 } },
                })}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

GlassCard.displayName = "GlassCard";
