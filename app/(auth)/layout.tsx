"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

import { Suspense } from "react";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[100dvh] flex flex-col bg-background">
            {/* Header / Back Link */}
            <header className="h-16 px-4 flex items-center">
                <Link
                    href="/"
                    className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <div className="h-8 w-8 rounded-full flex items-center justify-center glass group-hover:shadow-sm transition-all">
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Go back</span>
                </Link>
            </header>

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
