"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package, MapPin, Clock, TrendingUp, X, Star, ArrowRight } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { useVendors, useAuth, useNearbyVendors, useOrders } from "@/core/hooks";
import { getGreeting, calculateDeliveryTime, formatDistance, formatCurrency, cn } from "@/core/utils";
import { Skeleton, SkeletonCard, SkeletonBento, MapView, Button } from "@/components/ui";

/* ─────────────────────────────────────────────────────
   DASHBOARD / HOME — Marketplace
   Modernized Bento Discovery Hub.
   Implements Spotlight featured grid and immersive 
   category tiles following the Alexander UI Canon.
   ───────────────────────────────────────────────────── */

const CATEGORIES = [
    { name: "Restaurant", icon: "🍳", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80" },
    { name: "Groceries", icon: "🍎", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80" },
    { name: "Pharmacy", icon: "💊", image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=400&q=80" },
    { name: "Retail", icon: "🛍️", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80" },
    { name: "Coffee", icon: "☕", image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=80" },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
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
    const { data: orders, isLoading: loadingOrders } = useOrders();

    const isLoading = loadingAll || (lat !== undefined && loadingNearby) || authLoading || loadingOrders;
    const greeting = getGreeting();
    const displayName = profile?.full_name || user?.email?.split('@')[0] || "Friend";

    // Auto-locate on load if no location set
    useEffect(() => {
        if (lat === undefined && lng === undefined && !address) {
            if (navigator.geolocation) {
                // Check if we have permission or just try
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        const { latitude, longitude } = position.coords;
                        try {
                            // Import dynamically or assume geocodingService is available in scope if imported
                            // We will add the import in a separate block or assume it's added. 
                            // Since we can't easily add import with this tool in one go without replacing huge chunk,
                            // we'll use a direct fetch or ensure import is present.
                            // Let's us the geocodingService if we can add the import, otherwise fetch directly to be safe.

                            const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
                            let newAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

                            if (token) {
                                try {
                                    const res = await fetch(
                                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&limit=1`
                                    );
                                    const data = await res.json();
                                    if (data.features?.[0]?.place_name) {
                                        newAddress = data.features[0].place_name;
                                    }
                                } catch (e) {
                                    console.error("Reverse geocode failed", e);
                                }
                            }

                            const params = new URLSearchParams(searchParams.toString());
                            params.set("lat", latitude.toString());
                            params.set("lng", longitude.toString());
                            params.set("address", newAddress);

                            router.replace(`/dashboard?${params.toString()}`, { scroll: false });
                        } catch (error) {
                            console.error("Auto-location failed", error);
                        }
                    },
                    (error) => {
                        console.log("Geolocation ignored", error);
                    },
                    { timeout: 10000, maximumAge: 60000 }
                );
            }
        }
    }, [lat, lng, address, router, searchParams]);

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
                        <div className="xl:hidden">
                            {loadingSidebar}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton className="h-32 rounded-[2rem]" key={i} />
                            ))}
                        </div>

                        <div className="space-y-6">
                            <Skeleton className="h-6 w-32 ml-1" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                                <SkeletonCard className="h-80" />
                                <SkeletonCard className="h-80" />
                            </div>
                        </div>
                    </div>
                </div>
            </ScreenShell>
        );
    }

    const featuredVendors = allVendors?.filter((v) => v.is_featured).slice(0, 6) ?? [];

    const displayVendors = lat !== undefined && lng !== undefined
        ? nearbyVendors?.filter(v => !v.is_featured) ?? []
        : allVendors?.filter((v) => !v.is_featured) ?? [];

    // Calculate Stats
    const activeOrdersCount = orders?.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length || 0;

    const thisMonthSpent = orders?.reduce((total, order) => {
        const orderDate = new Date(order.created_at);
        const now = new Date();
        if (orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()) {
            return total + order.total;
        }
        return total;
    }, 0) || 0;

    const stats = [
        { label: "Active Orders", value: activeOrdersCount.toString(), icon: Package },
        { label: "Nearby Vendors", value: displayVendors.length.toString(), icon: MapPin },
        { label: "Avg. Delivery", value: "28m", icon: Clock },
        { label: "This Month", value: formatCurrency(thisMonthSpent), icon: TrendingUp },
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
            {/* Live Network Status */}
            <div className="glass-heavy p-6 rounded-[2.5rem] space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Network Status</p>
                    <div className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-success">Optimal</span>
                    </div>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        <span>Active Couriers</span>
                        <span className="text-foreground">{Math.max(12, activeOrdersCount * 2 + 5)} Units</span>
                    </div>
                    <div className="h-1 w-full bg-foreground/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "65%" }}
                            className="h-full bg-primary"
                        />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                        <span>Avg. Prep Time</span>
                        <span className="text-foreground">
                            {orders && orders.length > 0
                                ? (orders.reduce((acc, o) => acc + (o.total > 5000 ? 15 : 8), 0) / orders.length).toFixed(1)
                                : "8.4"}m
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">

                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="glass-heavy p-5 rounded-[2rem] space-y-4 group hover:translate-y-[1px] transition-all duration-300 cursor-default"
                    >
                        <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                            <stat.icon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-black tracking-tighter leading-none">{stat.value}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mt-1.5 leading-none opacity-50">
                                {stat.label}
                            </p>
                        </div>
                    </div>
                ))}
            </div>


            {lat && lng && (
                <div className="glass-heavy rounded-[2.5rem] overflow-hidden h-80 relative group">
                    <MapView
                        center={{ lat, lng }}
                        markers={mapMarkers}
                        zoom={14}
                        className="h-full w-full grayscale contrast-[1.1] transition-all duration-1000 group-hover:grayscale-0"
                        interactive={false}
                    />
                </div>
            )}
        </div>
    );

    return (
        <ScreenShell side={DashboardSidebar}>
            <motion.div
                className="space-y-12 lg:space-y-16 pb-20"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* ── Command Header ─────────────────────────── */}
                <motion.div variants={staggerItem} className="flex flex-col gap-4">
                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40 px-1">{greeting}, {displayName}</p>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.dispatchEvent(new CustomEvent("boxdrop-open-location"))}
                            className="text-left group flex-1"
                        >
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-none group-hover:text-primary transition-colors flex items-center gap-3">
                                {address ? address.split(',')[0] : "Set Location"}
                                <MapPin className="h-5 w-5 md:h-8 md:w-8 text-primary/50 group-hover:text-primary transition-colors" />
                            </h1>
                            {address && (
                                <p className="text-sm md:text-base font-bold text-muted-foreground mt-1 truncate max-w-[80vw]">
                                    {address.split(',').slice(1).join(',').trim() || "Tap to select precise location"}
                                </p>
                            )}
                        </button>

                        {lat && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/dashboard')}
                                className="h-10 w-10 rounded-full glass hover:bg-white/10 shrink-0"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* ── Bento Categories (Discovery Grid) ──────── */}
                <motion.div variants={staggerItem} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {CATEGORIES.map((cat, idx) => (
                        <button
                            key={cat.name}
                            onClick={() => router.push(`/dashboard/search?category=${cat.name}`)}
                            className={cn(
                                "group relative h-36 rounded-[2.2rem] overflow-hidden glass hover:scale-[0.98] transition-all duration-500",
                                idx === 0 && "col-span-2 sm:col-span-1 lg:col-span-1"
                            )}
                        >
                            <Image
                                src={cat.image}
                                alt={cat.name}
                                fill
                                priority={idx === 0}
                                loading={idx === 0 ? "eager" : "lazy"}
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                className="object-cover opacity-50 group-hover:opacity-80 group-hover:scale-110 transition-all duration-1000 grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-5 left-5">
                                <span className="text-2xl mb-1 block group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500 origin-left">{cat.icon}</span>
                                <h3 className="text-[10px] font-black text-white uppercase tracking-[0.15em]">{cat.name}</h3>
                            </div>
                        </button>
                    ))}
                </motion.div>

                {/* ── Featured Spotlight ─────────────────────── */}
                {!lat && featuredVendors.length > 0 && (
                    <motion.div variants={staggerItem} className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-2xl font-black tracking-tighter">Spotlight</h2>
                            <button
                                onClick={() => router.push('/dashboard/search?featured=true')}
                                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
                            >
                                Browse All
                                <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-8">
                            {featuredVendors.map((vendor) => (
                                <motion.div
                                    key={vendor.id}
                                    whileHover={{ y: -8, scale: 1.01 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                    className="relative h-[26rem] rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/5"
                                    onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                >
                                    {vendor.cover_url ? (
                                        <Image
                                            src={vendor.cover_url}
                                            alt={vendor.name}
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-[2s] group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-muted-foreground/20" />
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                                    <div className="absolute top-6 right-6">
                                        <div className="glass px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                                            <Star className="h-2.5 w-2.5 text-warning fill-warning" />
                                            <span className="text-[10px] font-black text-white">{vendor.rating}</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-8 left-8 right-8 space-y-4">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">{vendor.category}</p>
                                            <h3 className="text-2xl font-black text-white tracking-tighter leading-tight">{vendor.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-white/70">
                                                <Clock className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">25-35m</span>
                                            </div>
                                            <div className="h-1 w-1 rounded-full bg-white/20" />
                                            <div className="flex items-center gap-2 text-white/70">
                                                <TrendingUp className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider">Top rated</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* ── Selection Grid ─────────────────────────── */}
                <motion.div variants={staggerItem} className="space-y-6">
                    <h2 className="text-2xl font-black tracking-tighter px-1">{lat ? "Available Selection" : "Local Favorites"}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 3xl:grid-cols-3 gap-6">
                        {displayVendors.map((vendor) => (
                            <motion.div
                                key={vendor.id}
                                whileHover={{ x: 4 }}
                                onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                className="group glass-heavy p-6 rounded-[2.5rem] flex items-center gap-6 cursor-pointer hover:bg-foreground/5 transition-all duration-300"
                            >
                                <div className="h-20 w-20 rounded-[1.8rem] overflow-hidden glass shrink-0 relative">
                                    {vendor.cover_url ? (
                                        <Image
                                            src={vendor.cover_url}
                                            alt={vendor.name}
                                            width={80}
                                            height={80}
                                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-primary/5 flex items-center justify-center">
                                            <Package className="h-7 w-7 text-muted-foreground/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="font-black text-sm truncate tracking-tight">{vendor.name}</h3>
                                        <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">{vendor.rating} ★</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-3">
                                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-none">{calculateDeliveryTime((vendor as any).dist_meters)}</span>
                                        <div className="h-0.5 w-0.5 rounded-full bg-muted-foreground/30" />
                                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest leading-none">{formatDistance((vendor as any).dist_meters)}</span>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground/40 mt-3 line-clamp-1 font-bold uppercase tracking-tight">{vendor.category} • {vendor.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </ScreenShell>
    );
}

