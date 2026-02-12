"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingBag } from "lucide-react";
import { useVendor, useVendorProducts } from "@/core/hooks";
import { useCartStore } from "@/core/store";
import { GlassCard, Button, SkeletonCard, SkeletonText } from "@/components/ui";
import { ScreenShell } from "@/components/layout/screen-shell";
import { formatCurrency } from "@/core/utils";
import { useState } from "react";

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
    const { addItem, updateQuantity, items, getItemCount, getTotal } = useCartStore();
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

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
                <div className="md:hidden h-2" /> {/* Mobile space below header */}

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

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Menu</h3>
                        <p className="text-xs text-muted-foreground">{products?.length || 0} items available</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {products?.map((product) => {
                            const cartItem = items.find((i) => i.product.id === product.id);
                            return (
                                <GlassCard
                                    key={product.id}
                                    className="flex items-center gap-4 p-4 cursor-pointer active:scale-[0.99] transition-transform"
                                    elevation="sm"
                                    onClick={() => setSelectedProduct(product)}
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
                                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                                        {cartItem ? (
                                            <div className="flex items-center gap-1.5 glass rounded-full px-1.5 py-1 shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-primary/10 active:scale-90 transition-transform"
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </button>
                                                <span className="text-sm font-bold w-4 text-center">
                                                    {cartItem.quantity}
                                                </span>
                                                <button
                                                    onClick={() => addItem(product)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-primary/10 active:scale-90 transition-transform"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="rounded-full h-10 w-10 p-0 shadow-sm"
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

            {/* ── Product Detail Glide-up ──────────────── */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 z-[70] max-w-2xl mx-auto"
                        >
                            <div className="glass-heavy rounded-t-[var(--radius-xl)] shadow-[0_-20px_50px_rgba(0,0,0,0.3)] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6">
                                <div className="h-1.5 w-12 bg-muted rounded-full mx-auto" />

                                <div className="h-64 sm:h-80 w-full rounded-[var(--radius-lg)] overflow-hidden bg-primary/5">
                                    {selectedProduct.image_url && (
                                        <img
                                            src={selectedProduct.image_url}
                                            alt={selectedProduct.name}
                                            className="h-full w-full object-cover"
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                                        <p className="text-xl font-black">{formatCurrency(selectedProduct.price)}</p>
                                    </div>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {selectedProduct.description}
                                    </p>
                                </div>

                                <Button
                                    size="lg"
                                    className="w-full py-7 text-lg font-bold rounded-[var(--radius-lg)]"
                                    onClick={() => {
                                        addItem(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                >
                                    Add to Bag · {formatCurrency(selectedProduct.price)}
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </ScreenShell>
    );
}
