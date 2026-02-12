"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, ArrowRight, Star, Clock } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { Skeleton, SkeletonCard, SkeletonPill } from "@/components/ui";
import { useSearchVendors, useVendors, useAuth } from "@/core/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import type { Vendor } from "@/types/database";
import { calculateDeliveryTime, formatDistance } from "@/core/utils";

/* ─────────────────────────────────────────────────────
   SEARCH PAGE — Discovery Hub
   Premium experience with real-time feedback.
   Follows "Pure UI" rule: uses useSearchVendors hook.
   ───────────────────────────────────────────────────── */

const CATEGORIES = ["All", "Restaurant", "Groceries", "Pharmacy", "Retail"];

export default function SearchPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialCategory = searchParams.get("category") || "All";

    const [query, setQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState(initialCategory);

    useEffect(() => {
        const cat = searchParams.get("category");
        if (cat) setActiveCategory(cat);
    }, [searchParams]);

    const { data: searchResults, isLoading: isSearching } = useSearchVendors(query);
    const { data: allVendors, isLoading: isLoadingAll } = useVendors();
    const { loading: authLoading } = useAuth();

    const isLoading = (isLoadingAll && !allVendors) || authLoading;

    const displayedVendors = query.length > 2
        ? searchResults
        : allVendors?.filter(v =>
            activeCategory === "All" || v.category === activeCategory
        );

    const DiscoveryContent = (
        <div className="space-y-8">
            {/* Search Input */}
            <div className="space-y-4">
                <h3 className="hidden xl:block font-bold text-lg tracking-tight">Discovery</h3>
                <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className={`h-4 w-4 transition-colors ${query ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Find anything..."
                        className="
                            w-full h-11 pl-10 pr-4
                            glass rounded-2xl
                            text-sm text-foreground
                            placeholder:text-muted-foreground/50
                            focus:ring-2 focus:ring-primary/5 transition-all
                        "
                    />
                    {query && (
                        <button
                            onClick={() => setQuery("")}
                            className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest px-1">Categories</p>

                {/* Mobile: Horizontal Scroll | Desktop: Vertical Grid */}
                <div className="flex xl:flex-col overflow-x-auto xl:overflow-visible gap-2 pb-2 xl:pb-0 scrollbar-none mask-fade-right xl:mask-none">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => {
                                    setQuery("");
                                    setActiveCategory(cat);
                                }}
                                className={`
                                    whitespace-nowrap flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold
                                    transition-all duration-300 shrink-0
                                    ${isActive
                                        ? "bg-foreground text-background xl:translate-x-1"
                                        : "glass text-muted-foreground hover:text-foreground xl:hover:translate-x-1"
                                    }
                                `}
                            >
                                {cat}
                                {isActive && <ArrowRight className="hidden xl:block h-3 w-3" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    if (isLoading) {
        const loadingSidebar = (
            <div className="space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-6 w-32 hidden xl:block" />
                    <Skeleton className="h-11 w-full rounded-2xl" />
                </div>
                <div className="space-y-3">
                    <Skeleton className="h-3 w-20 uppercase tracking-widest opacity-40 ml-1" />
                    <div className="flex xl:flex-col gap-2 overflow-hidden">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <SkeletonPill key={i} className="xl:w-full h-12 rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );

        return (
            <ScreenShell side={loadingSidebar}>
                <div className="space-y-10 pb-24 lg:pb-0">
                    <div className="md:hidden h-2" />
                    <div className="xl:hidden glass-heavy p-5 rounded-[2.5rem] mb-4">
                        {loadingSidebar}
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3 px-1">
                            <Skeleton className="h-10 w-64" />
                            <Skeleton className="h-3 w-48 opacity-40 transition-shimmer" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} className="h-72" />
                            ))}
                        </div>
                    </div>
                </div>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell side={DiscoveryContent}>
            <div className="space-y-10 pb-24 lg:pb-0">
                <div className="md:hidden h-2" />

                {/* Mobile-only Discovery Module */}
                <div className="xl:hidden glass-heavy p-5 rounded-[2.5rem] mb-4">
                    {DiscoveryContent}
                </div>

                <div className="space-y-8">
                    <div className="flex items-center justify-between px-1">
                        <section>
                            <h2 className="text-3xl font-black tracking-tighter leading-none">
                                {query ? `Results: ${query}` : `${activeCategory} Hub`}
                            </h2>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mt-3 opacity-40">
                                Discovery Engine / {displayedVendors?.length || 0} Matches
                            </p>
                        </section>
                    </div>

                    {isSearching ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <SkeletonCard key={i} className="h-72" />
                            ))}
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {displayedVendors && displayedVendors.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                                    {displayedVendors.map((vendor: Vendor) => (
                                        <motion.div
                                            key={vendor.id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                            className="relative h-72 rounded-[2.5rem] overflow-hidden group cursor-pointer"
                                        >
                                            {/* Full Image */}
                                            {vendor.cover_url ? (
                                                <img
                                                    src={vendor.cover_url}
                                                    alt={vendor.name}
                                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-accent flex items-center justify-center">
                                                    <MapPin className="h-10 w-10 text-muted-foreground/10" />
                                                </div>
                                            )}

                                            {/* Scrim */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                                            {/* Info Plate */}
                                            <div className="absolute bottom-3 left-3 right-3 glass-heavy p-4 rounded-[1.8rem] space-y-2 border border-white/10 group-hover:translate-y-[-2px] transition-transform duration-500">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="text-sm font-black text-foreground truncate tracking-tight">{vendor.name}</h3>
                                                        <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{vendor.category}</p>
                                                    </div>
                                                    <div className="glass px-2.5 py-1 rounded-full flex items-center gap-1">
                                                        <Star className="h-2.5 w-2.5 text-warning fill-warning" />
                                                        <span className="text-[10px] font-black">{vendor.rating}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                                                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{calculateDeliveryTime((vendor as any).dist_meters)}</span>
                                                    </div>
                                                    <span className="text-[8px] text-muted-foreground/30">•</span>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                                                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{formatDistance((vendor as any).dist_meters)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-20 glass rounded-[2.5rem] border border-white/5"
                                >
                                    <Search className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                                    <h3 className="text-xl font-black">No matches found</h3>
                                    <p className="text-sm text-muted-foreground">Try adjusting your search or category filter.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </ScreenShell>
    );
}
