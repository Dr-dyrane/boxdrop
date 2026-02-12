"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, ArrowRight, Star, Clock } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { Skeleton, SkeletonCard, SkeletonPill, Button } from "@/components/ui";
import { useSearchVendors, useVendors, useAuth } from "@/core/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import type { Vendor } from "@/types/database";
import { calculateDeliveryTime, formatDistance, cn } from "@/core/utils";

/* ─────────────────────────────────────────────────────
   SEARCH PAGE — Discovery Hub
   Modernized Discovery Engine.
   Extends the 'Principal' design language with immersive 
   filters and Spotlight-style result cards.
   ───────────────────────────────────────────────────── */

const CATEGORIES = [
    { label: "All", icon: "🌐" },
    { label: "Restaurant", icon: "🍳" },
    { label: "Groceries", icon: "🍎" },
    { label: "Pharmacy", icon: "💊" },
    { label: "Retail", icon: "🛍️" },
    { label: "Coffee", icon: "☕" },
];

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

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category") || "All";
    const initialFeatured = searchParams.get("featured") === "true";

    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(initialCategory);
    const [isFeaturedOnly, setIsFeaturedOnly] = useState(initialFeatured);

    useEffect(() => {
        const cat = searchParams.get("category");
        const featured = searchParams.get("featured") === "true";
        if (cat) {
            setActiveCategory(cat);
            setIsFeaturedOnly(false);
        }
        if (featured) {
            setIsFeaturedOnly(true);
            setActiveCategory("All");
        }
    }, [searchParams]);

    const { data: searchResults, isLoading: isSearching } = useSearchVendors(query);
    const { data: allVendors, isLoading: isLoadingAll } = useVendors();
    const { loading: authLoading } = useAuth();

    const isLoading = (isLoadingAll && !allVendors) || authLoading;

    const displayedVendors = query.length > 2
        ? searchResults
        : allVendors?.filter(v => {
            const matchesCategory = activeCategory === "All" || v.category === activeCategory;
            const matchesFeatured = !isFeaturedOnly || v.is_featured;
            return matchesCategory && matchesFeatured;
        });

    const DiscoveryContent = (
        <div className="space-y-10">
            {/* ── Search Input ─────────────────────────── */}
            <div className="space-y-4">
                <h3 className="hidden xl:block font-black text-[10px] uppercase tracking-[0.2em] opacity-40 px-1">Search Engine</h3>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className={cn("h-4 w-4 transition-colors", query ? 'text-primary' : 'text-muted-foreground')} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Find anything..."
                        className="
                            w-full h-14 pl-12 pr-4
                            glass-heavy rounded-[1.5rem]
                            text-sm font-bold text-foreground
                            placeholder:text-muted-foreground/30
                            border border-foreground/5
                            focus:ring-2 focus:ring-primary/10 transition-all duration-300
                        "
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* ── Filters ─────────────────────────────── */}
            <div className="space-y-6">
                <p className="font-black text-[10px] uppercase tracking-[0.2em] opacity-40 px-1">Discovery Lens</p>

                <div className="flex xl:flex-col overflow-x-auto xl:overflow-visible gap-3 pb-4 xl:pb-0 scrollbar-none mask-fade-right xl:mask-none">
                    {/* Featured Choice */}
                    <button
                        onClick={() => {
                            setQuery("");
                            setIsFeaturedOnly(!isFeaturedOnly);
                            setActiveCategory("All");
                        }}
                        className={cn(
                            "whitespace-nowrap flex items-center justify-between px-5 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500 shrink-0 border",
                            isFeaturedOnly
                                ? "bg-primary text-primary-foreground border-primary shadow-2xl shadow-primary/20 xl:translate-x-1"
                                : "glass border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/10 xl:hover:translate-x-1"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <Star className={cn("h-3.5 w-3.5", isFeaturedOnly ? "fill-current" : "")} />
                            Featured Only
                        </div>
                    </button>

                    <div className="h-px bg-foreground/5 xl:my-2 hidden xl:block" />

                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.label && !isFeaturedOnly;
                        return (
                            <button
                                key={cat.label}
                                onClick={() => {
                                    setQuery("");
                                    setActiveCategory(cat.label);
                                    setIsFeaturedOnly(false);
                                }}
                                className={cn(
                                    "whitespace-nowrap flex items-center justify-between px-5 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500 shrink-0 border",
                                    isActive
                                        ? "bg-foreground text-background border-foreground xl:translate-x-1"
                                        : "glass border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/10 xl:hover:translate-x-1"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-lg">{cat.icon}</span>
                                    {cat.label}
                                </div>
                                {isActive && <ArrowRight className="hidden xl:block h-3 w-3" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        return (
            <ScreenShell side={<div className="animate-pulse space-y-8"><Skeleton className="h-14 w-full rounded-2xl" /><Skeleton className="h-64 w-full rounded-3xl" /></div>}>
                <div className="space-y-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} className="h-80" />
                        ))}
                    </div>
                </div>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell side={DiscoveryContent}>
            <motion.div
                className="space-y-10 pb-24 lg:pb-0"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <div className="md:hidden h-2" />

                {/* Mobile-only Discovery Module */}
                <div className="xl:hidden glass-heavy p-6 rounded-[2.5rem] mb-6">
                    {DiscoveryContent}
                </div>

                <div className="space-y-8">
                    <motion.div variants={staggerItem} className="flex items-center justify-between px-1">
                        <section>
                            <h2 className="text-4xl font-black tracking-tighter leading-none">
                                {query ? `Showing: ${query}` : isFeaturedOnly ? "Spotlight Selection" : `${activeCategory} Hub.`}
                            </h2>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-4 opacity-40">
                                Global Discovery / {displayedVendors?.length || 0} Entities Found
                            </p>
                        </section>
                    </motion.div>

                    {isSearching ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} className="h-[26rem] rounded-[3rem]" />
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {displayedVendors && displayedVendors.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-8">
                                    {displayedVendors.map((vendor: Vendor) => (
                                        <motion.div
                                            key={vendor.id}
                                            variants={staggerItem}
                                            layout
                                            whileHover={{ y: -8, scale: 1.01 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                            className="relative h-[26rem] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/5"
                                        >
                                            {vendor.cover_url ? (
                                                <Image
                                                    src={vendor.cover_url}
                                                    alt={vendor.name}
                                                    fill
                                                    className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-muted-foreground/20 flex items-center justify-center">
                                                    <MapPin className="h-10 w-10 text-muted-foreground/10" />
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />

                                            <div className="absolute top-6 right-6">
                                                <div className="glass px-3.5 py-1.5 rounded-full flex items-center gap-1.5 border border-white/10">
                                                    <Star className="h-2.5 w-2.5 text-warning fill-warning" />
                                                    <span className="text-[10px] font-black text-white">{vendor.rating}</span>
                                                </div>
                                            </div>

                                            <div className="absolute bottom-8 left-8 right-8 space-y-4">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">{vendor.category}</p>
                                                    <h3 className="text-3xl font-black text-white tracking-tighter leading-tight">{vendor.name}</h3>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-white/70">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{calculateDeliveryTime((vendor as any).dist_meters)}</span>
                                                    </div>
                                                    <div className="h-1 w-1 rounded-full bg-white/20" />
                                                    <div className="flex items-center gap-2 text-white/70">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">{formatDistance((vendor as any).dist_meters)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-center py-32 glass-heavy rounded-[3rem] border border-foreground/5 mx-1"
                                >
                                    <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                                        <Search className="h-8 w-8 text-muted-foreground/20" />
                                    </div>
                                    <h3 className="text-2xl font-black tracking-tighter">No entities found</h3>
                                    <p className="text-sm text-muted-foreground mt-2 font-medium">Try adjusting your Discovery Lens or searching for something else.</p>
                                    <Button
                                        variant="ghost"
                                        className="mt-8 rounded-full font-black text-[10px] uppercase tracking-widest glass"
                                        onClick={() => {
                                            setQuery("");
                                            setActiveCategory("All");
                                            setIsFeaturedOnly(false);
                                        }}
                                    >
                                        Reset Discovery
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </motion.div>
        </ScreenShell>
    );
}
