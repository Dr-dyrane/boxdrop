"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingBag } from "lucide-react";
import { useVendor, useVendorProducts, useAuth } from "@/core/hooks";
import { useCartStore } from "@/core/store";
import { GlassCard, Button, Skeleton, SkeletonCard, SkeletonText, MapView } from "@/components/ui";
import { ScreenShell } from "@/components/layout/screen-shell";
import { formatCurrency, calculateDeliveryTime } from "@/core/utils";
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

    const { profile, loading: authLoading } = useAuth();
    const isLoading = vLoading || pLoading || authLoading;

    if (isLoading) {
        const loadingSidebar = (
            <div className="space-y-6">
                <div className="glass-heavy p-6 rounded-[var(--radius-xl)] space-y-6">
                    <Skeleton className="h-6 w-1/3" />
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-2 w-1/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );

        return (
            <ScreenShell side={loadingSidebar}>
                <div className="space-y-8">
                    {/* Header Placeholder */}
                    <div className="relative h-64 rounded-[var(--radius-xl)] overflow-hidden glass-heavy p-6 flex flex-col justify-end gap-3">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-10 w-64" />
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-[420px] glass-heavy rounded-[2.5rem] p-4 flex flex-col justify-end gap-4">
                                    <Skeleton className="flex-1 rounded-[2rem]" />
                                    <div className="space-y-3 p-1">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </div>
                                        <Skeleton className="h-11 w-full rounded-2xl" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </ScreenShell>
        );
    }

    if (!vendor) return <ScreenShell>Vendor not found.</ScreenShell>;

    return (
        <ScreenShell>
            <div className="space-y-8 pb-24">
                <div className="md:hidden h-2" /> {/* Mobile spacer */}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* ── Left Column: Menu Items ────────────────── */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* ── Cover ──────────────────────────────────── */}
                        <div className="relative h-64 rounded-[var(--radius-xl)] overflow-hidden glass group">
                            {vendor.cover_url ? (
                                <img
                                    src={vendor.cover_url}
                                    alt={vendor.name}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                                    <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-xs font-bold uppercase tracking-widest glass-subtle px-3 py-1.5 rounded-full w-fit mb-3">
                                    {vendor.category || "Vendor"}
                                </p>
                                <h1 className="text-4xl font-black tracking-tight">{vendor.name}</h1>
                            </div>
                        </div>

                        {/* ── Menu Section ───────────────────────────── */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="font-bold text-xl">Menu</h3>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{products?.length || 0} items</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {products?.map((product) => {
                                    const cartItem = items.find((i) => i.product.id === product.id);
                                    return (
                                        <motion.div
                                            key={product.id}
                                            whileHover={{ y: -4 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                            className="relative h-[420px] rounded-[2.5rem] overflow-hidden group cursor-pointer"
                                            onClick={() => setSelectedProduct(product)}
                                        >
                                            {/* Full Width/Height Image */}
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-accent flex items-center justify-center">
                                                    <ShoppingBag className="h-12 w-12 text-muted-foreground/10" />
                                                </div>
                                            )}

                                            {/* Gradient Scrim */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                                            {/* Floating Info Plate (Apple Style) */}
                                            <div className="absolute bottom-4 left-4 right-4 glass-heavy p-5 rounded-[2rem] space-y-3 group-hover:translate-y-[-4px] transition-transform duration-500">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-black text-foreground tracking-tight leading-tight line-clamp-1">{product.name}</p>
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{product.category}</p>
                                                    </div>
                                                    <div className="glass px-3 py-1 rounded-full">
                                                        <p className="text-xs font-black">{formatCurrency(product.price)}</p>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        addItem(product);
                                                    }}
                                                    className={`
                                                        w-full h-11 rounded-2xl flex items-center justify-center gap-2 font-bold text-xs transition-all duration-300
                                                        ${cartItem
                                                            ? "bg-foreground text-background"
                                                            : "bg-primary/10 hover:bg-primary/20 text-foreground"
                                                        }
                                                    `}
                                                >
                                                    {cartItem ? (
                                                        <><Plus className="h-3 w-3" /> {cartItem.quantity} in Bag</>
                                                    ) : (
                                                        <><Plus className="h-3 w-3" /> Add to Bag</>
                                                    )}
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Info Bento ────────────────── */}
                    <div className="space-y-6">
                        <div className="glass-heavy p-6 rounded-[var(--radius-xl)] space-y-6 sticky top-24">
                            <h3 className="font-bold text-lg">Store Info</h3>

                            <div className="space-y-5">
                                <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <Clock className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Delivery Time</p>
                                        <p className="text-sm font-bold">{calculateDeliveryTime((vendor as any).dist_meters)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <Star className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Rating</p>
                                        <p className="text-sm font-bold">{vendor.rating} · High Reliability</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group">
                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Address</p>
                                        <p className="text-sm font-bold truncate">{vendor.address || "Hemet, CA"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Vendor Map ────────────────────────────── */}
                            <div className="h-48 rounded-2xl overflow-hidden glass mt-4">
                                {(vendor.location as any)?.coordinates && (
                                    <MapView
                                        center={{
                                            lat: (vendor.location as any).coordinates[1],
                                            lng: (vendor.location as any).coordinates[0]
                                        }}
                                        markers={[{
                                            id: vendor.id,
                                            lat: (vendor.location as any).coordinates[1],
                                            lng: (vendor.location as any).coordinates[0],
                                            label: vendor.name
                                        }]}
                                        zoom={14}
                                        className="h-full w-full"
                                        interactive={false}
                                    />
                                )}
                            </div>
                        </div>
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
                            <div className="glass-heavy rounded-t-[var(--radius-xl)] p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6">
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
