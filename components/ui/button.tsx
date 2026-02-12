"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/* ─────────────────────────────────────────────────────
   BUTTON
   Premium micro-interactions:
   - Scale-down on press (0.96)
   - Shimmer loading state (no spinners, ever)
   - Depth through shadow, never borders
   ───────────────────────────────────────────────────── */

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg" | "icon";
    loading?: boolean;
}

const variantStyles: Record<string, string> = {
    primary:
        "bg-primary text-primary-foreground hover:opacity-90",
    secondary:
        "bg-secondary text-secondary-foreground hover:opacity-80",
    ghost:
        "bg-transparent text-foreground hover:bg-accent",
    destructive:
        "bg-destructive text-destructive-foreground hover:opacity-90",
};

const sizeStyles: Record<string, string> = {
    sm: "h-8 px-4 text-xs rounded-[var(--radius-squircle)]",
    md: "h-11 px-6 text-sm rounded-[var(--radius-squircle)]",
    lg: "h-14 px-8 text-base rounded-[var(--radius-squircle)]",
    icon: "h-11 w-11 rounded-[var(--radius-squircle)] flex items-center justify-center",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = "primary",
            size = "md",
            loading = false,
            className = "",
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        return (
            <motion.button
                ref={ref}
                className={`
                    inline-flex items-center justify-center gap-2
                    font-medium
                    transition-colors
                    cursor-pointer
                    select-none
                    relative overflow-hidden
                    disabled:opacity-50 disabled:pointer-events-none
                    ${variantStyles[variant]}
                    ${sizeStyles[size]}
                    ${className}
                `}
                whileTap={{ scale: 0.96, transition: { duration: 0.08 } }}
                disabled={disabled || loading}
                {...props}
            >
                {/* ── Children (visible or invisible when loading) ── */}
                <span
                    className={`inline-flex items-center gap-2 transition-opacity duration-200 ${loading ? "opacity-0" : "opacity-100"
                        }`}
                >
                    {children as React.ReactNode}
                </span>

                {/* ── Loading overlay: shimmer bar ────────────── */}
                {loading && (
                    <motion.span
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                    >
                        <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:0ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
                            <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
                        </span>
                    </motion.span>
                )}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
