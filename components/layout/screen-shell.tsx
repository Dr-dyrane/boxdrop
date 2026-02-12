"use client";

import { Footer } from "./footer";

/* ─────────────────────────────────────────────────────
   SCREEN SHELL
   Unified page wrapper. Handles padding,
   max-width, and optional loading skeleton state.
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
        max-w-2xl
        mx-auto
        ${flush ? "" : "px-2 py-6 sm:px-6"}
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
