"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

import { Suspense } from "react";
import { useScrollDirection } from "@/core/hooks/use-scroll-direction";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { direction, isScrolled } = useScrollDirection(10);
    const isHidden = direction === "down" && isScrolled;

    return (
        <div className="min-h-[100dvh] flex flex-col bg-background">
            {/* Header / Back Link */}
            <motion.header
                initial={{ y: 0 }}
                animate={{ y: isHidden ? -120 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="sticky top-0 z-50 glass-heavy h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] px-4 flex items-center"
            >
                <Link
                    href="/"
                    className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center glass group-hover:bg-white/5 transition-all">
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Go back</span>
                </Link>
            </motion.header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <Suspense fallback={null}>
                        {children}
                    </Suspense>
                </motion.div>
            </main>
        </div>
    );
}
