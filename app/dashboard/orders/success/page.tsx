"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Package, Home } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { Button } from "@/components/ui";
import confetti from "canvas-confetti";

export default function OrderSuccessPage() {
    const router = useRouter();

    useEffect(() => {
        // Celebrate!
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <ScreenShell>
            <div className="flex flex-col items-center justify-center py-12 space-y-8 text-center min-h-[60vh]">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 15, stiffness: 200 }}
                    className="h-24 w-24 rounded-full bg-success/10 flex items-center justify-center"
                >
                    <CheckCircle2 className="h-12 w-12 text-success" />
                </motion.div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black tracking-tight">Order Received!</h1>
                    <p className="text-muted-foreground text-sm max-w-[280px]">
                        The vendor has been notified and is starting to prepare your items.
                    </p>
                </div>

                <div className="w-full max-w-sm grid grid-cols-1 gap-3">
                    <Button
                        size="lg"
                        className="gap-3 py-7 rounded-[var(--radius-lg)] shadow-lg"
                        onClick={() => router.push("/dashboard/orders")}
                    >
                        <Package className="h-5 w-5" />
                        Track Order
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        className="gap-3 py-7 rounded-[var(--radius-lg)]"
                        onClick={() => router.push("/dashboard")}
                    >
                        <Home className="h-4 w-4" />
                        Back to Shop
                    </Button>
                </div>
            </div>
        </ScreenShell>
    );
}
