"use client";

import { cn } from "@/core/utils";
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
    /** Optional right-side panel content for desktop */
    side?: React.ReactNode;
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
    side,
    loading = false,
    skeleton,
    flush = false,
    className = "",
}: ScreenShellProps) {
    return (
        <main className="min-h-[100dvh] w-full flex flex-col overflow-x-hidden">
            <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[2000px] mx-auto relative overflow-x-hidden">
                {/* Main Content Pane */}
                <div className={cn(
                    "flex-1 flex flex-col min-w-0",
                    !flush && "px-4 py-4 sm:px-6 lg:px-10 lg:py-8",
                    className
                )}>
                    {loading && skeleton ? (
                        <div className="flex-1">{skeleton}</div>
                    ) : (
                        <div className="flex-1">
                            {children}
                        </div>
                    )}

                    {!flush && <Footer className="mt-20" />}
                </div>

                {/* Right Discovery/Utility Pane (Desktop Only) */}
                {side && (
                    <aside className="hidden xl:block w-[360px] shrink-0 relative">
                        <div className="sticky top-0 h-[100dvh] overflow-y-auto scrollbar-none px-6 py-8">
                            {side}
                        </div>
                    </aside>
                )}
            </div>
        </main>
    );
}
