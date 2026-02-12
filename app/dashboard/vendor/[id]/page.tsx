"use client";

import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Star, Clock, MapPin, Plus, Minus, ShoppingBag, Package, TrendingUp, Info } from "lucide-react";
import { useVendor, useVendorProducts, useAuth } from "@/core/hooks";
import { useCartStore } from "@/core/store";
import { GlassCard, Button, Skeleton, SkeletonCard, SkeletonText, MapView } from "@/components/ui";
import { ScreenShell } from "@/components/layout/screen-shell";
import { formatCurrency, calculateDeliveryTime, cn } from "@/core/utils";
import { useState } from "react";
import Image from "next/image";

/* ─────────────────────────────────────────────────────
   VENDOR DETAIL PAGE
   Principal UX level. Immersive cinema header, 
   dynamic bento info plates, and high-fidelity menu cards.
   ───────────────────────────────────────────────────── */

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05, delayChildren: 0.2 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
} as const;

export default function VendorDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { data: vendor, isLoading: vLoading } = useVendor(id);
    const { data: products, isLoading: pLoading } = useVendorProducts(id);
    const { addItem, updateQuantity, items } = useCartStore();
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

    const { profile, loading: authLoading } = useAuth();
    const isLoading = vLoading || pLoading || authLoading;

    if (isLoading) {
        return (
            <ScreenShell>
                <div className="space-y-12">
                    <Skeleton className="h-[30rem] w-full rounded-[3.5rem]" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} className="h-[28rem] rounded-[3rem]" />
                        ))}
                    </div>
                </div>
            </ScreenShell>
        );
    }

    if (!vendor) return <ScreenShell>Vendor not found.</ScreenShell>;

    return (
        <ScreenShell>
            <motion.div
                className="space-y-12 lg:space-y-20 pb-24"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <div className="md:hidden h-2" />

                {/* ── Immersive Cinema Header ────────────────── */}
                <motion.div variants={staggerItem} className="relative h-[32rem] rounded-[3.5rem] overflow-hidden group shadow-2xl shadow-black/20">
                    {vendor.cover_url ? (
                        <Image
                            src={vendor.cover_url}
                            alt={vendor.name}
                            fill
                            priority
                            className="object-cover transition-transform duration-[3s] group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                            <ShoppingBag className="h-20 w-20 text-muted-foreground/10" />
                        </div>
                    )}

                    {/* Dynamic Scrim Architecture */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-40" />

                    <div className="absolute top-8 left-8">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="h-12 w-12 rounded-full glass hover:bg-white/20 border border-white/10"
                        >
                            <ArrowLeft className="h-5 w-5 text-white" />
                        </Button>
                    </div>

                    <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div className="space-y-3">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass px-4 py-2 rounded-full w-fit flex items-center gap-2 border border-white/10"
                            >
                                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Open for Delivery</p>
                            </motion.div>
                            <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none">
                                {vendor.name}
                            </h1>
                            <p className="text-sm font-medium text-white/60 max-w-lg">
                                {vendor.description || "The finest selection of products delivered in minutes. Experience the future of local commerce."}
                            </p>
                        </div>

                        <div className="flex gap-4">
                            <div className="glass-heavy px-6 py-4 rounded-[1.8rem] text-white border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Star className="h-4 w-4 text-warning fill-warning" />
                                    <span className="text-xl font-black">{vendor.rating}</span>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Market Rating</p>
                            </div>
                            <div className="glass-heavy px-6 py-4 rounded-[1.8rem] text-white border border-white/10">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="text-xl font-black">{calculateDeliveryTime((vendor as any).dist_meters)}</span>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Est. Arrival</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* ── Menu Section (8 Cols) ──────────────────── */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="flex items-center justify-between px-2">
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter">Current Selection</h2>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2 opacity-40">
                                    Inventory / {products?.length || 0} Specialties
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {products?.map((product) => {
                                const cartItem = items.find((i) => i.product.id === product.id);
                                return (
                                    <motion.div
                                        key={product.id}
                                        variants={staggerItem}
                                        whileHover={{ y: -8, scale: 1.01 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="relative h-[28rem] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/5"
                                        onClick={() => setSelectedProduct(product)}
                                    >
                                        {product.image_url ? (
                                            <Image
                                                src={product.image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-primary/5 flex items-center justify-center">
                                                <Package className="h-12 w-12 text-muted-foreground/10" />
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                                        <div className="absolute top-6 right-6">
                                            <div className="glass px-4 py-2 rounded-full border border-white/10 shadow-xl">
                                                <p className="text-sm font-black text-white">{formatCurrency(product.price)}</p>
                                            </div>
                                        </div>

                                        <div className="absolute bottom-6 left-6 right-6 space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">{product.category}</p>
                                                <h3 className="text-2xl font-black text-white tracking-tighter leading-tight">{product.name}</h3>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addItem(product);
                                                }}
                                                className={cn(
                                                    "w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest transition-all duration-500",
                                                    cartItem
                                                        ? "bg-foreground text-background"
                                                        : "glass-heavy text-white hover:bg-primary hover:text-primary-foreground border-white/10"
                                                )}
                                            >
                                                {cartItem ? (
                                                    <><Package className="h-4 w-4" /> {cartItem.quantity} in Bag</>
                                                ) : (
                                                    <><Plus className="h-4 w-4" /> Add to selection</>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── Information Bento (4 Cols) ─────────────── */}
                    <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
                        <motion.div variants={staggerItem} className="glass-heavy p-8 rounded-[2.5rem] space-y-8 border border-white/5 shadow-2xl">
                            <div className="flex items-center justify-between">
                                <h3 className="font-black text-lg tracking-tighter">Entity Intelligence</h3>
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Info className="h-4 w-4 text-primary" />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-50">Reliability Score</p>
                                        <p className="text-sm font-black">98.4% On-time Delivery</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[9px] text-muted-foreground uppercase font-black tracking-widest opacity-50">Operational Base</p>
                                        <p className="text-sm font-black truncate">{vendor.address || "Market Logistics Center"}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Map Intelligence */}
                            <div className="h-64 rounded-[2rem] overflow-hidden glass relative group">
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
                                        className="h-full w-full grayscale contrast-[1.1] transition-all duration-[2s] group-hover:grayscale-0 group-hover:scale-105"
                                        interactive={false}
                                    />
                                )}
                                <div className="absolute inset-x-0 bottom-0 glass-heavy p-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-center">Precise Geo-Targeting Active</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={staggerItem} className="glass p-8 rounded-[2.5rem] border border-white/5 opacity-60">
                            <p className="text-[10px] text-center font-bold uppercase tracking-[0.2em] leading-relaxed">
                                Curated entities are verified by BoxDrop Logistics for quality and speed.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* ── Product Intelligence Detail Glide-up ──── */}
            <AnimatePresence>
                {selectedProduct && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[60]"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 32, stiffness: 240 }}
                            className="fixed bottom-0 left-0 right-0 z-[70] max-w-4xl mx-auto"
                        >
                            <div className="glass-heavy rounded-t-[3.5rem] p-8 pb-[calc(3rem+env(safe-area-inset-bottom))] space-y-10 border-x border-t border-white/10 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.5)]">
                                <div className="h-1.5 w-16 bg-white/10 rounded-full mx-auto" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="relative h-[24rem] rounded-[2.5rem] overflow-hidden shadow-2xl">
                                        {selectedProduct.image_url ? (
                                            <Image
                                                src={selectedProduct.image_url}
                                                alt={selectedProduct.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                                                <Package className="h-20 w-20 text-muted-foreground/10" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col justify-center space-y-8">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h2 className="text-4xl font-black tracking-tighter">{selectedProduct.name}</h2>
                                                <p className="text-3xl font-black text-primary">{formatCurrency(selectedProduct.price)}</p>
                                            </div>
                                            <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                                                {selectedProduct.description || "Designed for excellence. This selection meets the highest standards of quality and utility within our marketplace."}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <Button
                                                size="lg"
                                                className="w-full h-16 text-sm font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-primary/20"
                                                onClick={() => {
                                                    addItem(selectedProduct);
                                                    setSelectedProduct(null);
                                                }}
                                            >
                                                Secure to Bag
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="w-full h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground"
                                                onClick={() => setSelectedProduct(null)}
                                            >
                                                Return to Menu
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </ScreenShell>
    );
}
