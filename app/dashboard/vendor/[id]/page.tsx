"use client";

import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingBag } from "lucide-react";
import { useVendor, useVendorProducts } from "@/core/hooks";
import { useCartStore } from "@/core/store";
import { GlassCard, Button, SkeletonCard, SkeletonText } from "@/components/ui";
import { ScreenShell } from "@/components/layout/screen-shell";
import { formatCurrency } from "@/core/utils";

/* ─────────────────────────────────────────────────────
   VENDOR DETAIL PAGE
   Shows vendor info and products.
   Handles adding to cart.
   ───────────────────────────────────────────────────── */

export default function VendorDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { data: vendor, isLoading: vLoading } = useVendor(id);
    const { data: products, isLoading: pLoading } = useVendorProducts(id);
    const { addItem, items, getItemCount, getTotal } = useCartStore();

    const isLoading = vLoading || pLoading;

    if (isLoading) {
        return (
            <ScreenShell loading>
                <div className="space-y-6">
                    <div className="h-48 skeleton rounded-[var(--radius-lg)]" />
                    <SkeletonText lines={2} />
                    <div className="grid grid-cols-1 gap-4">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            </ScreenShell>
        );
    }

    if (!vendor) return <ScreenShell>Vendor not found.</ScreenShell>;

    return (
        <ScreenShell>
            <div className="space-y-6 pb-24">
                {/* ── Header ─────────────────────────────────── */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="h-10 w-10 flex items-center justify-center glass rounded-full"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-xl font-bold truncate">{vendor.name}</h1>
                </div>

                {/* ── Cover ──────────────────────────────────── */}
                <div className="relative h-48 rounded-[var(--radius-lg)] overflow-hidden glass shadow-[var(--shadow-md)]">
                    {vendor.cover_url ? (
                        <img
                            src={vendor.cover_url}
                            alt={vendor.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                        <div>
                            <p className="text-sm font-medium flex items-center gap-1.5 glass-subtle px-2 py-1 rounded-full w-fit">
                                <Star className="h-3 w-3 text-warning fill-warning" />
                                {vendor.rating}
                            </p>
                            <h2 className="text-2xl font-bold mt-2">{vendor.name}</h2>
                        </div>
                    </div>
                </div>

                {/* ── Info ───────────────────────────────────── */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>25-35 min</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        <span>{vendor.location}</span>
                    </div>
                </div>

                {/* ── Product List ───────────────────────────── */}
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Menu</h3>
                    <div className="grid grid-cols-1 gap-4">
                        {products?.map((product) => {
                            const cartItem = items.find((i) => i.product.id === product.id);
                            return (
                                <GlassCard
                                    key={product.id}
                                    className="flex items-center gap-4 p-4"
                                    elevation="sm"
                                >
                                    <div className="h-20 w-20 rounded-[var(--radius-md)] bg-primary/5 shrink-0 overflow-hidden">
                                        {product.image_url && (
                                            <img
                                                src={product.image_url}
                                                alt={product.name}
                                                className="h-full w-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold">{product.name}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                            {product.description}
                                        </p>
                                        <p className="font-bold mt-2">
                                            {formatCurrency(product.price)}
                                        </p>
                                    </div>
                                    <div className="shrink-0">
                                        {cartItem ? (
                                            <div className="flex items-center gap-3 glass rounded-full px-2 py-1">
                                                <button
                                                    onClick={() => useCartStore.getState().updateQuantity(product.id, cartItem.quantity - 1)}
                                                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-primary/10"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">
                                                    {cartItem.quantity}
                                                </span>
                                                <button
                                                    onClick={() => addItem(product)}
                                                    className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-primary/10"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="rounded-full h-9 w-9 p-0"
                                                onClick={() => addItem(product)}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </GlassCard>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Cart Bar ───────────────────────────────── */}
            {getItemCount() > 0 && (
                <div className="fixed bottom-[calc(var(--tab-bar-height)+1rem)] left-4 right-4 z-40">
                    <motion.button
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onClick={() => router.push("/dashboard/cart")}
                        className="
              w-full h-14 bg-primary text-primary-foreground 
              rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)]
              flex items-center justify-between px-6 font-bold
            "
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 rounded-full bg-primary-foreground/20 flex items-center justify-center text-xs">
                                {getItemCount()}
                            </div>
                            <span>View Cart</span>
                        </div>
                        <span>
                            {formatCurrency(getTotal())}
                        </span>
                    </motion.button>
                </div>
            )}
        </ScreenShell>
    );
}
