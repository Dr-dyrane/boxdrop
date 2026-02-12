"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, Clock, TrendingUp, Search, X, Star } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { useVendors, useAuth, useNearbyVendors } from "@/core/hooks";
import { getGreeting, calculateDeliveryTime, formatDistance } from "@/core/utils";
import { Skeleton, SkeletonText, SkeletonCard, SkeletonAvatar, SkeletonPill, SkeletonBento, MapView, Button } from "@/components/ui";

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
    const { profile, user, loading: authLoading } = useAuth();

    const isLoading = loadingAll || (lat !== undefined && loadingNearby) || authLoading;
    const greeting = getGreeting();
    const displayName = profile?.full_name || user?.email?.split('@')[0] || "Friend";

    if (isLoading) {
        const loadingSidebar = (
            <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonBento key={i} />
                    ))}
                </div>
                <div className="h-80 glass-heavy rounded-[2.5rem] p-4">
                    <Skeleton className="h-full w-full rounded-[2.2rem]" />
                </div>
            </div>
        );

        return (
            <ScreenShell side={loadingSidebar}>
                <div className="space-y-12">
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-64" />
                    </div>

                    <div className="space-y-8">
                        {/* Mobile sidebar placeholder */}
                        <div className="xl:hidden">
                            {loadingSidebar}
                        </div>

                        <div className="flex gap-2 overflow-x-auto scrollbar-none mask-fade-right">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <SkeletonPill key={i} className="shrink-0" />
                            ))}
                        </div>

                        <div className="space-y-6">
                            <Skeleton className="h-6 w-32 ml-1" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                                <SkeletonCard className="h-64" />
                                <SkeletonCard className="h-64" />
                                <SkeletonCard className="h-64 hidden 2xl:block" />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <Skeleton className="h-6 w-48 ml-1" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="glass-heavy p-4 rounded-[2rem] flex items-center gap-4">
                                        <Skeleton className="h-20 w-20 rounded-[1.5rem]" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-1/2" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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

    const DashboardSidebar = (
        <div className="space-y-8">
            {/* ── Context Signals ───────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="glass-heavy p-5 rounded-3xl space-y-4 group hover:translate-y-[1px] transition-all duration-300 cursor-default"
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
                <div className="px-4 py-4 glass-heavy rounded-[2rem] flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-black">Current Address</p>
                        <p className="text-sm font-bold truncate">{address}</p>
                    </div>
                </div>
            )}

            {/* ── Visual Map Coverage ───────────────────── */}
            {lat && lng && (
                <div className="glass-heavy rounded-[2.5rem] overflow-hidden h-80">
                    <MapView
                        center={{ lat, lng }}
                        markers={mapMarkers}
                        zoom={14}
                        className="h-full w-full grayscale opacity-80"
                        interactive={false}
                    />
                </div>
            )}
        </div>
    );

    return (
        <ScreenShell side={DashboardSidebar}>
            <motion.div
                className="space-y-12"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* ── Header ─────────────────────────────────── */}
                <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground font-medium uppercase tracking-[0.1em] opacity-60">{greeting}, {displayName}</p>
                        <h1 className="text-4xl font-black tracking-tighter mt-1">
                            {lat ? "Stores near you" : "BoxDrop Hub."}
                        </h1>
                    </div>
                    {lat && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push('/dashboard')}
                            className="glass px-4 rounded-full"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Clear Location
                        </Button>
                    )}
                </motion.div>

                <div className="space-y-12">
                    {/* ── Mobile Context Signals (Visible only on mobile/tablet) ── */}
                    <div className="xl:hidden">
                        {DashboardSidebar}
                    </div>

                    {/* ── Quick Categories ──────────────────────── */}
                    <motion.div variants={item} className="space-y-4">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1 opacity-50">Quick Categories</h2>
                        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none mask-fade-right">
                            {CATEGORIES.map((cat) => (
                                <motion.button
                                    key={cat.name}
                                    whileTap={{ scale: 0.96 }}
                                    onClick={() => router.push(`/dashboard/search?category=${cat.name}`)}
                                    className="
                                        flex items-center gap-2.5 px-6 py-3
                                        glass rounded-full shrink-0 
                                        hover:bg-foreground hover:text-background transition-all duration-300
                                        cursor-pointer
                                        group
                                    "
                                >
                                    <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                                    <span className="text-xs font-black tracking-tight uppercase tracking-[0.05em]">{cat.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── Featured Showcase ──────────────────────── */}
                    {!lat && featuredVendors.length > 0 && (
                        <motion.div variants={item} className="space-y-6">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xl font-black tracking-tight">Featured</h2>
                                <button className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">View all</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                                {featuredVendors.map((vendor) => (
                                    <motion.div
                                        key={vendor.id}
                                        whileHover={{ y: -4 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        className="relative h-64 rounded-[2.5rem] overflow-hidden group cursor-pointer"
                                        onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                    >
                                        {/* Full Photo */}
                                        {vendor.cover_url ? (
                                            <img
                                                src={vendor.cover_url}
                                                alt={vendor.name}
                                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-accent flex items-center justify-center">
                                                <Package className="h-10 w-10 text-muted-foreground/10" />
                                            </div>
                                        )}

                                        {/* Scrim */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                                        {/* Floating Info Plate */}
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
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Exploration Grid ─────────────────── */}
                    <motion.div variants={item} className="space-y-6">
                        <h2 className="text-xl font-black tracking-tight px-1">{lat ? "Available Nearby" : "Explore More"}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                            {displayVendors.map((vendor) => (
                                <motion.div
                                    key={vendor.id}
                                    whileHover={{ y: -2 }}
                                    onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                    className="group glass-heavy p-4 rounded-[2rem] flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-all duration-300"
                                >
                                    <div className="h-20 w-20 rounded-[1.5rem] overflow-hidden glass shrink-0 relative">
                                        {vendor.logo_url ? (
                                            <img src={vendor.logo_url} alt={vendor.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                                                <Package className="h-7 w-7 text-muted-foreground/20" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-black text-sm truncate tracking-tight">{vendor.name}</h3>
                                            <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{vendor.rating} ★</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{calculateDeliveryTime((vendor as any).dist_meters)}</span>
                                            <span className="text-[8px] text-muted-foreground/30">•</span>
                                            <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{formatDistance((vendor as any).dist_meters)}</span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-2 line-clamp-1 font-medium">{vendor.category} • {vendor.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </ScreenShell>
    );
}
