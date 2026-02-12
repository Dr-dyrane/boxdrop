"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, Clock, TrendingUp, Search, X, Star } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { useVendors, useAuth, useNearbyVendors } from "@/core/hooks";
import { getGreeting } from "@/core/utils";
import { GlassCard, SkeletonCard, SkeletonText, MapView, Button } from "@/components/ui";

/* ─────────────────────────────────────────────────────
   DASHBOARD / HOME — Marketplace
   Shows featured vendors & nearby results via PostGIS.
   ───────────────────────────────────────────────────── */

const CATEGORIES = [
    { name: "Restaurant", icon: "🍳" },
    { name: "Groceries", icon: "🍎" },
    { name: "Pharmacy", icon: "💊" },
    { name: "Retail", icon: "🛍️" },
    { name: "Coffee", icon: "☕" },
    { name: "Beauty", icon: "💄" },
    { name: "Pets", icon: "🐾" },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.06 },
    },
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
    },
} as const;

export default function DashboardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // ── Location Context ───────────────────────────────
    const lat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
    const lng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
    const address = searchParams.get("address");

    const { data: allVendors, isLoading: loadingAll } = useVendors();
    const { data: nearbyVendors, isLoading: loadingNearby } = useNearbyVendors(lat, lng);
    const { profile, user } = useAuth();

    const isLoading = loadingAll || (lat !== undefined && loadingNearby);
    const greeting = getGreeting();
    const displayName = profile?.full_name || user?.email?.split('@')[0] || "Friend";

    if (isLoading) {
        return (
            <ScreenShell loading>
                <div className="space-y-6">
                    <SkeletonText lines={2} />
                    <SkeletonCard />
                    <div className="grid grid-cols-2 gap-3">
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </div>
            </ScreenShell>
        );
    }

    const featuredVendors = allVendors?.filter((v) => v.is_featured) ?? [];

    // If we have coordinates, prioritized vendors found via PostGIS RPC
    const displayVendors = lat !== undefined && lng !== undefined
        ? nearbyVendors?.filter(v => !v.is_featured) ?? []
        : allVendors?.filter((v) => !v.is_featured) ?? [];

    const stats = [
        { label: "Active Orders", value: "0", icon: Package },
        { label: "Nearby Vendors", value: displayVendors.length.toString(), icon: MapPin },
        { label: "Avg. Delivery", value: "28m", icon: Clock },
        { label: "This Month", value: "₦0", icon: TrendingUp },
    ];

    const mapMarkers = displayVendors
        .filter(v => (v.location as any)?.coordinates)
        .map(v => ({
            id: v.id,
            lat: (v.location as any).coordinates[1],
            lng: (v.location as any).coordinates[0],
            label: v.name
        }));

    return (
        <ScreenShell>
            <motion.div
                className="space-y-6"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* ── Header ─────────────────────────────────── */}
                <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{greeting}, {displayName}</p>
                        <h1 className="text-2xl font-bold tracking-tight mt-0.5">
                            {lat ? "Stores near you" : "What are you looking for?"}
                        </h1>
                    </div>
                    {lat && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                            className="text-muted-foreground"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Location
                        </Button>
                    )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* ── Left Column: Categories & Vendors ────────── */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* ── Quick Categories ──────────────────────── */}
                        <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                            {CATEGORIES.map((cat) => (
                                <motion.button
                                    key={cat.name}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => router.push(`/dashboard/search?category=${cat.name}`)}
                                    className="
                                        flex items-center gap-2.5 px-4 py-2.5
                                        glass rounded-full shrink-0 
                                        hover:bg-foreground hover:text-background transition-all duration-300
                                        shadow-sm cursor-pointer border border-white/10
                                        group
                                    "
                                >
                                    <span className="text-lg group-hover:scale-110 transition-transform">{cat.icon}</span>
                                    <span className="text-xs font-bold tracking-tight uppercase">{cat.name}</span>
                                </motion.button>
                            ))}
                        </motion.div>

                        {/* ── Featured Vendors ──────────────────────── */}
                        {!lat && featuredVendors.length > 0 && (
                            <motion.div variants={item} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h2 className="font-semibold px-1">Featured</h2>
                                    <button className="text-xs text-muted-foreground hover:text-foreground">View all</button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {featuredVendors.map((vendor) => (
                                        <GlassCard
                                            key={vendor.id}
                                            interactive
                                            elevation="sm"
                                            className="group flex flex-col gap-3 p-4 cursor-pointer min-h-[160px]"
                                            onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                        >
                                            <div className="h-32 w-full rounded-xl overflow-hidden glass relative">
                                                {vendor.cover_url ? (
                                                    <img src={vendor.cover_url} alt={vendor.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                ) : (
                                                    <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-muted-foreground/20" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2 glass-subtle px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                    <Star className="h-3 w-3 text-warning fill-warning" />
                                                    <span className="text-[10px] font-bold">{vendor.rating}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold truncate">{vendor.name}</h3>
                                                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{vendor.description}</p>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ── All / Nearby Vendors ──────────────────── */}
                        <motion.div variants={item} className="space-y-4">
                            <h2 className="font-semibold px-1">{lat ? "Available Nearby" : "Explore More"}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {displayVendors.map((vendor) => (
                                    <GlassCard
                                        key={vendor.id}
                                        interactive
                                        elevation="sm"
                                        className="group flex items-center gap-4 p-4 cursor-pointer"
                                        onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                    >
                                        <div className="h-16 w-16 rounded-xl overflow-hidden glass shrink-0">
                                            {vendor.logo_url ? (
                                                <img src={vendor.logo_url} alt={vendor.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                                                    <Package className="h-5 w-5 text-muted-foreground/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-sm truncate">{vendor.name}</h3>
                                            <p className="text-xs text-muted-foreground truncate">{vendor.address || "Hemet, CA"}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-bold px-2 py-0.5 glass rounded-full">{vendor.category}</span>
                                                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{vendor.rating} ★</span>
                                            </div>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Right Column: Bento Signals & Map ────────── */}
                    <div className="space-y-6">
                        {/* ── Context Signals ───────────────────────── */}
                        <div className="grid grid-cols-2 gap-4">
                            {stats.map((stat) => (
                                <div
                                    key={stat.label}
                                    className="glass-heavy p-5 rounded-3xl space-y-4 shadow-sm group hover:translate-y-[1px] transition-all duration-300 cursor-default"
                                >
                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                        <stat.icon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black tracking-tighter leading-none">{stat.value}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1.5 leading-none">
                                            {stat.label}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ── Active Location Banner ─────────────────── */}
                        {address && (
                            <motion.div variants={item} className="px-4 py-4 glass rounded-[var(--radius-xl)] flex items-center gap-3 shadow-sm">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <MapPin className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Current Address</p>
                                    <p className="text-sm font-medium truncate">{address}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* ── Visual Map Coverage ───────────────────── */}
                        <AnimatePresence>
                            {lat && lng && (
                                <motion.div
                                    variants={item}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="glass rounded-[var(--radius-xl)] overflow-hidden shadow-sm h-64 lg:h-80"
                                >
                                    <MapView
                                        center={{ lat, lng }}
                                        markers={mapMarkers}
                                        zoom={14}
                                        className="h-full w-full"
                                        interactive={false}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Content is now handled in the Bento Grid layout above */}
            </motion.div>
        </ScreenShell>
    );
}
