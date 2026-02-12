"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, ShoppingBag, Truck, ShieldCheck, MapPin } from "lucide-react";
import { useCartStore } from "@/core/store";
import { GlassCard, Button } from "@/components/ui";
import { ScreenShell } from "@/components/layout/screen-shell";
import { formatCurrency, cn } from "@/core/utils";
import { useAuth, useCreateOrder, useLocation } from "@/core/hooks";
import { useState, useCallback } from "react";
import { CheckoutModal } from "@/components/shared/checkout-modal";
import Image from "next/image";


/* ─────────────────────────────────────────────────────
   CART PAGE — Your Bag
   High-fidelity transaction management.
   Uses Bento principles to organize order intelligence 
   and checkout actions.
   ───────────────────────────────────────────────────── */

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
    },
} as const;

export default function CartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, clearCart, getTotal, vendorId } = useCartStore();
    const { mutateAsync: createOrder } = useCreateOrder();
    const { user } = useAuth();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const hasItems = items.length > 0;
    const subtotal = getTotal();
    const deliveryFee = 500;
    const total = subtotal + deliveryFee;

    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    const { location: userLocation } = useLocation();

    const handleCheckoutPress = () => {
        if (!user) {
            router.push(`/login?redirectTo=/dashboard/cart`);
            return;
        }
        setIsCheckoutOpen(true);
    };

    const handleCheckoutSuccess = async () => {
        if (isCheckingOut) return;

        setIsCheckingOut(true);
        try {
            await createOrder({
                vendor_id: vendorId!,
                items: items.map(i => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                    unit_price: i.product.price
                })),
                delivery_location: "2235 Corinto Court, Hemet, CA",
                delivery_lat: userLocation?.lat || 33.7431,
                delivery_lng: userLocation?.lng || -116.9478,
            });

            clearCart();
            router.push("/dashboard/orders");
        } catch (error: any) {
            console.error("Checkout failed:", error);
        } finally {
            setIsCheckingOut(false);
            setIsCheckoutOpen(false);
        }
    };


    if (!hasItems) {
        return (
            <ScreenShell>
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-8">
                    <div className="h-32 w-32 rounded-[3rem] bg-primary/5 flex items-center justify-center relative">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground/10" />
                        <motion.div
                            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 rounded-[3rem] border border-primary/20"
                        />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tighter">Your bag is empty</h1>
                        <p className="text-sm text-muted-foreground max-w-xs mx-auto font-medium">
                            Discovery awaits. Find your next favorite selection in the marketplace.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push("/dashboard")}
                        className="h-14 px-8 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20"
                    >
                        Browse Hub
                    </Button>
                </div>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell>
            <motion.div
                className="space-y-12 pb-24"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <div className="md:hidden h-2" />

                <motion.div variants={staggerItem} className="flex items-center justify-between px-1">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter leading-tight hidden md:block">Your Bag.</h1>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-3 opacity-40">
                            Reviewing Selection / {items.length} Items Pending
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-12 w-12 rounded-full glass">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* ── Item Rail (8 Cols) ───────────────────── */}
                    <div className="lg:col-span-12 xl:col-span-8 space-y-6">
                        <AnimatePresence mode="popLayout">
                            {items.map((item) => (
                                <motion.div
                                    key={item.product.id}
                                    layout
                                    variants={staggerItem}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="group glass-heavy p-6 rounded-[2.5rem] flex flex-col sm:flex-row items-center gap-8 relative border border-transparent hover:border-white/5 transition-all duration-500 shadow-2xl shadow-black/5"
                                >
                                    <button
                                        onClick={() => removeItem(item.product.id)}
                                        className="absolute top-4 right-4 h-10 w-10 rounded-full flex items-center justify-center glass border border-destructive/10 text-destructive opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive/10 active:scale-90"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="h-40 w-full sm:w-40 rounded-[2rem] overflow-hidden glass shrink-0 relative border border-white/5 shadow-inner">
                                        {item.product.image_url ? (
                                            <Image
                                                src={item.product.image_url}
                                                alt={item.product.name}
                                                fill
                                                className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-1000"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                                                <ShoppingBag className="h-10 w-10 text-muted-foreground/10" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 w-full">
                                        <div className="text-center sm:text-left space-y-2">
                                            <p className="text-[9px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">{item.product.category}</p>
                                            <h3 className="text-2xl font-black tracking-tighter leading-none">{item.product.name}</h3>
                                            <p className="text-sm font-black text-primary/80">{formatCurrency(item.product.price)} each</p>
                                        </div>

                                        <div className="flex flex-col items-center sm:items-end gap-6 w-full sm:w-auto">
                                            <p className="text-2xl font-black tracking-tighter">{formatCurrency(item.product.price * item.quantity)}</p>
                                            <div className="flex items-center gap-4 glass rounded-full px-2 py-1.5 border border-white/5 shadow-xl">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                                                >
                                                    <Minus className="h-3.5 w-3.5" />
                                                </button>
                                                <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                                                >
                                                    <Plus className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* ── Summary Bento (4 Cols) ────────────────── */}
                    <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                        <motion.div variants={staggerItem} className="glass-heavy p-8 rounded-[3rem] space-y-10 border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
                            <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-muted-foreground opacity-40 px-1">Order Logistics</h3>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-muted-foreground opacity-60">Subtotal</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-muted-foreground opacity-60">BoxDrop Logistic Fee</span>
                                        <span className="text-success">{formatCurrency(deliveryFee)}</span>
                                    </div>
                                </div>

                                <div className="h-px bg-white/5" />

                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1 opacity-40">Total Settlement</p>
                                        <p className="text-4xl font-black tracking-tighter">{formatCurrency(total)}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-2xl bg-success/10 flex items-center justify-center text-success">
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-5 rounded-2xl glass-subtle flex items-start gap-4">
                                    <Truck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Estimated Delivery</p>
                                        <p className="text-xs font-bold leading-relaxed">Arriving in approx. 25-35 minutes from confirmation.</p>
                                    </div>
                                </div>
                                <div className="p-5 rounded-2xl glass-subtle flex items-start gap-4">
                                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">Destination</p>
                                        <p className="text-xs font-bold leading-relaxed">Operational Sector A-1 (Smart Address Mapping Active)</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckoutPress}
                                className="w-full h-20 text-sm font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-2xl shadow-primary/20 active:scale-95 transition-all"
                            >
                                <CreditCard className="h-5 w-5 mr-3" />
                                Finalize Order
                            </Button>
                        </motion.div>

                        <CheckoutModal
                            isOpen={isCheckoutOpen}
                            onClose={() => setIsCheckoutOpen(false)}
                            onSuccess={handleCheckoutSuccess}
                            total={total}
                        />


                        <motion.div variants={staggerItem} className="p-8 rounded-[2.5rem] glass border border-white/5 opacity-40 text-center">
                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] leading-relaxed">
                                Encrypted checkout secured by Dyrane Intelligence Collective.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </ScreenShell>
    );
}
