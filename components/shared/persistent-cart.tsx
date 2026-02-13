"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/core/store";
import { useRouter, usePathname } from "next/navigation";
import { formatCurrency } from "@/core/utils";

/* ─────────────────────────────────────────────────────
   PERSISTENT CART PILL
   A high-fidelity floating summary that mirrors premium 
   logistics experiences (e.g. DoorDash / Apple Pay).
   ───────────────────────────────────────────────────── */

export function PersistentCart() {
    const router = useRouter();
    const pathname = usePathname();
    const { items, getItemCount, getTotal } = useCartStore();

    const cartCount = getItemCount();
    const cartTotal = getTotal();

    // Don't show on the cart page itself or if empty
    const isCartPage = pathname === "/dashboard/cart";
    const isVisible = cartCount > 0 && !isCartPage;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 100, opacity: 0, scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-50 md:left-auto md:right-8 md:bottom-8 md:w-80 pointer-events-none"
                >
                    <button
                        onClick={() => router.push("/dashboard/cart")}
                        className="
                            w-full h-16 glass-heavy rounded-full 
                            flex items-center justify-between px-6
                            shadow-[0_20px_50px_rgba(0,0,0,0.3)] 
                            border border-white/10
                            group active:scale-95 transition-all duration-300
                            pointer-events-auto
                        "
                    >
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground relative">
                                <ShoppingBag className="h-4 w-4" />
                                <span className="absolute -top-1 -right-1 h-5 w-5 bg-foreground text-background text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-background">
                                    {cartCount}
                                </span>
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">View Bag</p>
                                <p className="text-sm font-black tracking-tight leading-none mt-0.5">
                                    {formatCurrency(cartTotal)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80 group-hover:translate-x-[-4px] transition-transform">Checkout</span>
                            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <ArrowRight className="h-4 w-4" />
                            </div>
                        </div>
                    </button>
                </motion.div>
            )
            }
        </AnimatePresence >
    );
}
