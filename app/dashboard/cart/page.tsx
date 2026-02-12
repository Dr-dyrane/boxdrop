"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Plus, Minus, CreditCard, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/core/store";
import { GlassCard, Button } from "@/components/ui";
import { ScreenShell } from "@/components/layout/screen-shell";
import { formatCurrency } from "@/core/utils";
import { useAuth, useCreateOrder } from "@/core/hooks";
import { useState, useEffect } from "react";

export default function CartPage() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, clearCart, getTotal, vendorId } = useCartStore();
    const { mutateAsync: createOrder } = useCreateOrder();
    const { user } = useAuth();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // Listen for FAB checkout trigger from layout
    useEffect(() => {
        const handler = () => handleCheckout();
        window.addEventListener("boxdrop-checkout", handler);
        return () => window.removeEventListener("boxdrop-checkout", handler);
    }, [items, user, vendorId]); // Re-bind if core dependencies change

    if (items.length === 0) {
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

    const handleCheckout = async () => {
        if (!user) {
            router.push(`/login?redirectTo=/dashboard/cart`);
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
        } catch (error) {
            console.error(error);
            alert("Checkout failed. Please check your connection.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <ScreenShell>
            <div className="space-y-6">
                <div className="md:hidden h-2" /> {/* Mobile spacer */} {/* Mobile spacer */}

                {/* ── Item List ──────────────────────────────── */}
                <div className="space-y-3">
                    {items.map((item) => (
                        <GlassCard key={item.product.id} className="flex items-center gap-4 p-3" elevation="sm">
                            <div className="h-16 w-16 rounded-[var(--radius-md)] bg-primary/5 shrink-0 overflow-hidden">
                                {item.product.image_url && (
                                    <img
                                        src={item.product.image_url}
                                        alt={item.product.name}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{item.product.name}</p>
                                <p className="text-sm font-bold mt-1">
                                    {formatCurrency(item.product.price)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3 glass rounded-full px-2 py-1">
                                <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-primary/10"
                                >
                                    <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-sm font-bold">{item.quantity}</span>
                                <button
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-primary/10"
                                >
                                    <Plus className="h-3 w-3" />
                                </button>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                {/* ── Summary ────────────────────────────────── */}
                <div className="space-y-4 pt-4 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.05)]">
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatCurrency(getTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>{formatCurrency(500)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span>{formatCurrency(getTotal() + 500)}</span>
                    </div>
                </div>
            </div>

            {/* ── Checkout Instructions ─────────────────── */}
            <p className="text-center text-xs text-muted-foreground pt-4 pb-20">
                Tap the pay icon to complete your order
            </p>
        </ScreenShell>
    );
}
