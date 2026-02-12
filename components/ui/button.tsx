"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";

/* ─────────────────────────────────────────────────────
   BUTTON
   Premium feel: scale-down on press.
   No borders — depth through shadow.
   ───────────────────────────────────────────────────── */

interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost" | "destructive";
    size?: "sm" | "md" | "lg" | "icon";
    loading?: boolean;
}

const variantStyles: Record<string, string> = {
    primary:
        "bg-primary text-primary-foreground shadow-[var(--shadow-sm)] hover:opacity-90",
    secondary:
        "bg-secondary text-secondary-foreground shadow-[var(--shadow-sm)] hover:opacity-80",
    ghost:
        "bg-transparent text-foreground hover:bg-accent",
    destructive:
        "bg-destructive text-destructive-foreground shadow-[var(--shadow-sm)] hover:opacity-90",
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
          disabled:opacity-50 disabled:pointer-events-none
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${className}
        `}
                whileTap={{ scale: 0.96, transition: { duration: 0.08 } }}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <span className="inline-block h-4 w-4 rounded-full bg-current opacity-40 animate-pulse" />
                ) : (
                    children
                )}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
