"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, ArrowRight, Star, Clock } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { GlassCard, SkeletonCard } from "@/components/ui";
import { useSearchVendors, useVendors } from "@/core/hooks";
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
    const { data: allVendors } = useVendors();

    const displayedVendors = query.length > 2
        ? searchResults
        : allVendors?.filter(v =>
            activeCategory === "All" || v.category === activeCategory
        );

    return (
        <ScreenShell>
            <div className="space-y-8 pb-24">
                <div className="md:hidden h-2" /> {/* Mobile space below header */}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* ── Left Sidebar: Discovery Controls ────────── */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-heavy p-6 rounded-[var(--radius-xl)] space-y-8 sticky top-24 shadow-sm">
                            <div className="space-y-4">
                                <h3 className="font-bold text-lg">Discovery</h3>

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
                                            outline-none transition-all duration-300
                                            focus:shadow-[var(--shadow-md)]
                                        "
                                    />
                                    {query && (
                                        <button
                                            onClick={() => setQuery("")}
                                            className="absolute inset-y-0 right-3 flex items-center"
                                        >
                                            <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest px-1">Categories</p>
                                <div className="flex flex-col gap-2">
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
                                                    flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold
                                                    transition-all duration-300
                                                    ${isActive
                                                        ? "bg-foreground text-background shadow-md translate-x-1"
                                                        : "glass text-muted-foreground hover:text-foreground hover:translate-x-1"
                                                    }
                                                `}
                                            >
                                                {cat}
                                                {isActive && <ArrowRight className="h-3 w-3" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── Right Column: Results Grid ─────────────── */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-2xl font-black tracking-tight">
                                {query ? `Showing results for "${query}"` : `${activeCategory} Vendors`}
                            </h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                {displayedVendors?.length || 0} Found
                            </p>
                        </div>

                        {isSearching ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <SkeletonCard key={i} className="h-64" />
                                ))}
                            </div>
                        ) : (
                            <AnimatePresence mode="popLayout">
                                {displayedVendors && displayedVendors.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {displayedVendors.map((vendor: Vendor) => (
                                            <motion.div
                                                key={vendor.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                                className="cursor-pointer"
                                            >
                                                <GlassCard interactive elevation="sm" className="group h-full flex flex-col gap-4 p-4">
                                                    <div className="h-40 w-full rounded-2xl overflow-hidden glass relative">
                                                        {vendor.cover_url ? (
                                                            <img
                                                                src={vendor.cover_url}
                                                                alt={vendor.name}
                                                                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            />
                                                        ) : (
                                                            <div className="h-full w-full bg-primary/5 p-8 flex items-center justify-center">
                                                                <div className="h-12 w-12 rounded-full glass flex items-center justify-center">
                                                                    <Search className="h-6 w-6 text-muted-foreground/40" />
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="absolute top-3 right-3 glass-subtle px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                            <Star className="h-3 w-3 text-warning fill-warning" />
                                                            <span className="text-[10px] font-bold">{vendor.rating}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <h3 className="font-bold truncate text-lg">{vendor.name}</h3>
                                                            <span className="text-[10px] font-black uppercase tracking-widest glass px-2 py-1 rounded-full shrink-0">
                                                                {vendor.category}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                                            {vendor.description}
                                                        </p>

                                                        <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <Clock className="h-3 w-3" />
                                                                <span className="text-[10px] font-bold">{calculateDeliveryTime((vendor as any).dist_meters)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                                <MapPin className="h-3 w-3" />
                                                                <span className="text-[10px] font-bold">{formatDistance((vendor as any).dist_meters)}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 pt-2 border-t border-foreground/5">
                                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                                        <span className="text-[10px] font-bold text-muted-foreground truncate italic">
                                                            {vendor.address || "Hemet, CA"}
                                                        </span>
                                                    </div>
                                                </GlassCard>
                                            </motion.div>
                                        ))}
                                    </div>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="py-32 text-center glass-heavy rounded-[var(--radius-xl)]"
                                    >
                                        <div className="h-16 w-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="h-8 w-8 text-muted-foreground/20" />
                                        </div>
                                        <h3 className="font-bold text-lg">No Results Found</h3>
                                        <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
                                            Try searching for a street, store name, or refining your category.
                                        </p>
                                        <button
                                            onClick={() => { setQuery(""); setActiveCategory("All"); }}
                                            className="text-xs text-primary font-black uppercase tracking-widest mt-6 hover:opacity-80 transition-opacity"
                                        >
                                            Clear Filters
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </div>
        </ScreenShell>
    );
}
