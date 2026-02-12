"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/core/store";
import { GlassCard, Button } from "@/components/ui";
import { ScreenShell } from "@/components/layout/screen-shell";
import { formatCurrency } from "@/core/utils";
import { useAuth, useCreateOrder } from "@/core/hooks";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function CartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, clearCart, getTotal, vendorId } = useCartStore();
    const { mutateAsync: createOrder } = useCreateOrder();
    const { user } = useAuth();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Initial item count check for redirect/empty state
    const hasItems = items.length > 0;

    // Guarded checkout handler
    const handleCheckout = useCallback(async () => {
        if (isCheckingOut || !user) {
            if (!user) router.push(`/login?redirectTo=/dashboard/cart`);
            return;
        }

        setIsCheckingOut(true);
        try {
            await createOrder({
                vendor_id: vendorId!,
                items: items.map(i => ({
                    product_id: i.product.id,
                    quantity: i.quantity,
                    unit_price: i.product.price
                })),
                delivery_location: "Default Address", // Placeholder for Phase 3
            });

            clearCart();
            router.push("/dashboard/orders");
        } catch (error: any) {
            console.error("Checkout failed:", error);
            const message = error.message || error.details || "Checkout failed. Please check your connection.";
            alert(message);
        } finally {
            setIsCheckingOut(false);
        }
    }, [isCheckingOut, user, vendorId, items, createOrder, clearCart, router]);

    // Listen for FAB checkout trigger from layout
    useEffect(() => {
        window.addEventListener("boxdrop-checkout", handleCheckout);
        return () => window.removeEventListener("boxdrop-checkout", handleCheckout);
    }, [handleCheckout]);

    if (!hasItems) {
        return (
            <ScreenShell>
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center">
                        <ShoppingBag className="h-10 w-10 text-muted-foreground/20" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold">Your cart is empty</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Add some items from your favorite vendors to get started.
                        </p>
                    </div>
                    <Button onClick={() => router.push("/dashboard")} className="mt-4">
                        Browse Vendors
                    </Button>
                </div>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell>
            <div className="space-y-10 pb-24">
                <div className="md:hidden h-2" /> {/* Mobile spacer */}

                <div className="flex items-center justify-between px-1">
                    <h1 className="text-3xl font-black tracking-tight">Your Bag</h1>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{items.length} items</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                    {/* ── Left Column: Items ───────────────────── */}
                    <div className="lg:col-span-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map((item) => (
                                <GlassCard key={item.product.id} className="flex flex-col gap-4 p-5 h-full relative group">
                                    <button
                                        onClick={() => removeItem(item.product.id)}
                                        className="absolute top-3 right-3 h-8 w-8 rounded-full flex items-center justify-center bg-destructive/5 text-destructive opacity-0 group-hover:opacity-100 transition-opacity active:scale-90"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="flex items-center gap-4">
                                        <div className="h-16 w-16 rounded-2xl bg-primary/5 shrink-0 overflow-hidden relative border border-foreground/5">
                                            {item.product.image_url ? (
                                                <Image
                                                    src={item.product.image_url}
                                                    alt={item.product.name}
                                                    width={64}
                                                    height={64}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-110 duration-500"
                                                />
                                            ) : (
                                                <div className="h-full w-full bg-muted/20 flex items-center justify-center">
                                                    <ShoppingBag className="h-6 w-6 text-muted-foreground/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate leading-tight">{item.product.name}</p>
                                            <p className="text-xs text-muted-foreground font-medium mt-1">
                                                {formatCurrency(item.product.price)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-foreground/5">
                                        <p className="text-sm font-black">{formatCurrency(item.product.price * item.quantity)}</p>
                                        <div className="flex items-center gap-3 glass rounded-full px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </div>

                    {/* ── Right Column: Summary ────────────────── */}
                    <div className="space-y-6 lg:sticky lg:top-24">
                        <GlassCard className="p-6 space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Order Summary</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span>{formatCurrency(getTotal())}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span>{formatCurrency(500)}</span>
                                </div>
                                <div className="pt-4 border-t border-foreground/5 flex justify-between items-end">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Total Amount</p>
                                        <p className="text-2xl font-black">{formatCurrency(getTotal() + 500)}</p>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleCheckout}
                                loading={isCheckingOut}
                                className="w-full h-14 text-sm font-black rounded-2xl hidden md:flex"
                            >
                                <CreditCard className="h-4 w-4 mr-2" />
                                Secure Checkout
                            </Button>
                        </GlassCard>

                        {/* Mobile Checkout Instructions */}
                        <div className="md:hidden glass rounded-3xl p-5 text-center">
                            <p className="text-xs text-muted-foreground font-medium">
                                Tap the <span className="text-primary font-bold italic">Pay Icon</span> below to confirm your order
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </ScreenShell>
    );
}
