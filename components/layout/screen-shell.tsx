"use client";

import { motion, AnimatePresence } from "framer-motion";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import { useLayoutStore } from "@/core/store";
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
    const { isRightSidebarOpen, toggleRightSidebar } = useLayoutStore();

    return (
        <main className="min-h-[100dvh] w-full flex flex-col overflow-x-clip">
            <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[2000px] mx-auto relative overflow-x-clip">
                {/* Main Content Pane */}
                <div className={cn(
                    "flex-1 flex flex-col min-w-0 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
                    !flush && "px-4 py-4 sm:px-6 lg:px-10 lg:py-8",
                    // Add padding right to prevent overlap with fixed sidebar (only when open)
                    (!!side && isRightSidebarOpen) && "xl:pr-[380px]",
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

                {/* Desktop Sidebar Toggle (Only visible if side exists) */}
                {side && (
                    <button
                        onClick={toggleRightSidebar}
                        className={cn(
                            "hidden xl:flex fixed top-4 right-6 z-40 h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105 active:scale-95",
                            isRightSidebarOpen
                                ? "right-[384px] bg-background/80 backdrop-blur text-foreground border border-white/10"
                                : "right-6 bg-primary text-primary-foreground"
                        )}
                        aria-label="Toggle Sidebar"
                    >
                        {isRightSidebarOpen ? (
                            <PanelRightClose className="h-5 w-5" />
                        ) : (
                            <PanelRightOpen className="h-5 w-5" />
                        )}
                    </button>
                )}

                {/* Right Fixed Sidebar (Desktop Only) */}
                <AnimatePresence mode="wait">
                    {side && isRightSidebarOpen && (
                        <motion.aside
                            initial={{ x: "100%", opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: "100%", opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.8 }}
                            className="hidden xl:block fixed top-0 right-0 bottom-0 w-[360px] z-30 bg-background/50 backdrop-blur-2xl border-l border-white/5"
                        >
                            <div className="h-full w-full overflow-y-auto p-6 pt-[calc(3.5rem+env(safe-area-inset-top))] scrollbar-hide">
                                {side}
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
