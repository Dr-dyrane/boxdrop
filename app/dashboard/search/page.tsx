"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, X, ArrowRight, Star } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { GlassCard, SkeletonCard } from "@/components/ui";
import { useSearchVendors, useVendors } from "@/core/hooks";
import { useRouter, useSearchParams } from "next/navigation";
import type { Vendor } from "@/types/database";

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
        <ScreenShell className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
            >
                <h1 className="text-2xl font-bold tracking-tight">Explore</h1>
                <p className="text-sm text-muted-foreground">Nearby vendors & fresh products</p>
            </motion.div>

            {/* ── Search Bar ──────────────────────────────── */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <Search className={`h-4 w-4 transition-colors ${query ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search name, food, or location..."
                    className="
                        w-full h-12 pl-10 pr-4
                        glass rounded-[var(--radius-lg)]
                        text-sm text-foreground
                        outline-none transition-all duration-300
                        focus:shadow-[0_0_0_2px_hsl(var(--primary)/0.15)]
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

            {/* ── Filter Categories ────────────────────────── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat;
                    return (
                        <button
                            key={cat}
                            onClick={() => {
                                setQuery(""); // Clear search when picking a category
                                setActiveCategory(cat);
                            }}
                            className={`
                                whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium
                                transition-all duration-200
                                ${isActive
                                    ? "bg-foreground text-background"
                                    : "glass text-muted-foreground hover:text-foreground"
                                }
                            `}
                        >
                            {cat}
                        </button>
                    );
                })}
            </div>

            {/* ── Results ─────────────────────────────────── */}
            <div className="space-y-4">
                {isSearching ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonCard key={i} className="h-40" />
                    ))
                ) : (
                    <AnimatePresence mode="popLayout">
                        {displayedVendors && displayedVendors.length > 0 ? (
                            displayedVendors.map((vendor: Vendor) => (
                                <motion.div
                                    key={vendor.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                    className="cursor-pointer"
                                >
                                    <GlassCard className="group flex gap-4 p-4 items-center">
                                        <div className="h-20 w-20 rounded-xl overflow-hidden glass shrink-0">
                                            {vendor.logo_url && (
                                                <img
                                                    src={vendor.logo_url}
                                                    alt={vendor.name}
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-1">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold truncate">{vendor.name}</h3>
                                                <div className="flex items-center gap-1 text-xs bg-primary/5 px-2 py-0.5 rounded-full">
                                                    <Star className="h-3 w-3 text-warning fill-warning" />
                                                    <span className="font-medium">{vendor.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                {vendor.description}
                                            </p>
                                            <div className="flex items-center gap-3 mt-3">
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                    <MapPin className="h-3 w-3" />
                                                    {vendor.location}
                                                </div>
                                                <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                                                    {vendor.category}
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                                    </GlassCard>
                                </motion.div>
                            ))
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-20 text-center"
                            >
                                <p className="text-sm text-muted-foreground">No vendors found matching your criteria.</p>
                                <button
                                    onClick={() => { setQuery(""); setActiveCategory("All"); }}
                                    className="text-xs text-primary font-medium mt-2 hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </div>
        </ScreenShell>
    );
}
