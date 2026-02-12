"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, Clock, TrendingUp, Search, X } from "lucide-react";
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
        .filter(v => v.location)
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
                <motion.div variants={item} className="flex items-center justify-between">
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

                {/* ── Active Location Banner ─────────────────── */}
                {address && (
                    <motion.div variants={item}>
                        <div className="px-4 py-3 glass rounded-2xl flex items-center gap-3 shadow-sm">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <MapPin className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Current Address</p>
                                <p className="text-sm font-medium truncate">{address}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ── Visual Map Coverage ───────────────────── */}
                <AnimatePresence>
                    {lat && lng && (
                        <motion.div
                            variants={item}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <MapView
                                center={{ lat, lng }}
                                markers={mapMarkers}
                                zoom={14}
                                className="h-64 sm:h-80"
                                interactive={false}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Search Entry (Optional, keeping as secondary if requested, but user said move to FAB) ── */}
                {/* <motion.div variants={item}>
                    <button
                        onClick={() => router.push("/dashboard/search")}
                        className="
                            w-full h-12 px-4
                            glass rounded-[var(--radius-lg)]
                            flex items-center gap-3
                            text-sm text-muted-foreground
                            transition-all duration-300
                            hover:shadow-[var(--shadow-md)]
                            active:scale-[0.98]
                            cursor-pointer
                        "
                    >
                        <Search className="h-4 w-4" />
                        <span>Search vendors, products...</span>
                    </button>
                </motion.div> */}

                <motion.div variants={item} className="flex gap-2.5 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                    {CATEGORIES.map((cat) => (
                        <motion.button
                            key={cat.name}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router.push(`/dashboard/search?category=${cat.name}`)}
                            className="
                                flex items-center gap-3 px-5 py-3 
                                glass rounded-2xl shrink-0 
                                hover:bg-foreground hover:text-background transition-all duration-500
                                shadow-sm
                                group
                            "
                        >
                            <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                            <span className="text-sm font-semibold tracking-tight">{cat.name}</span>
                        </motion.button>
                    ))}
                </motion.div>

                <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="glass-heavy p-4 rounded-3xl space-y-3 shadow-sm group hover:translate-y-[-2px] transition-transform duration-300"
                        >
                            <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                                <stat.icon className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-2xl font-black tracking-tighter leading-none">{stat.value}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* ── Featured Vendors ──────────────────────── */}
                {!lat && featuredVendors.length > 0 && (
                    <motion.div variants={item}>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-semibold">Featured</h2>
                            <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                                View all
                            </button>
                        </div>
                        <div className="space-y-3">
                            {featuredVendors.map((vendor) => (
                                <GlassCard
                                    key={vendor.id}
                                    interactive
                                    elevation="sm"
                                    className="flex items-center gap-4 cursor-pointer"
                                    onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                >
                                    <div className="h-12 w-12 rounded-[var(--radius-md)] bg-primary/5 flex items-center justify-center shrink-0">
                                        <span className="text-lg font-bold text-muted-foreground">
                                            {vendor.name[0]}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{vendor.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <MapPin className="h-3 w-3" />
                                            {vendor.address || "Universal"}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-semibold">{vendor.rating}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            {vendor.category || "Vendor"}
                                        </p>
                                    </div>
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── All / Nearby Vendors ──────────────────── */}
                <motion.div variants={item}>
                    <h2 className="font-semibold mb-3">{lat ? "Available Nearby" : "Explore All"}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {displayVendors.length > 0 ? (
                            displayVendors.map((vendor) => (
                                <GlassCard
                                    key={vendor.id}
                                    interactive
                                    elevation="sm"
                                    className="cursor-pointer space-y-3"
                                    onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                >
                                    <div className="h-28 rounded-[var(--radius-md)] bg-primary/5 flex items-center justify-center">
                                        <Package className="h-8 w-8 text-muted-foreground/40" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm">{vendor.name}</p>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold">{vendor.rating} ★</span>
                                                {(vendor as any).dist_meters && (
                                                    <span className="text-[10px] text-primary font-bold">
                                                        {Math.round((vendor as any).dist_meters / 100) / 10}km
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                            {vendor.address || "Lagos"} · {vendor.category || "Vendor"}
                                        </p>
                                    </div>
                                </GlassCard>
                            ))
                        ) : (
                            <div className="py-20 text-center col-span-full glass-heavy rounded-3xl shadow-sm">
                                <p className="text-sm font-medium text-muted-foreground">No vendors found in this area.</p>
                                <p className="text-xs text-muted-foreground/50 mt-1">Try expanding your search or clearing filters.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </ScreenShell>
    );
}
