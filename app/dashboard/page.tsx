"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, MapPin, Clock, TrendingUp, Search } from "lucide-react";
import { ScreenShell } from "@/components/layout/screen-shell";
import { useVendors, useAuth } from "@/core/hooks";
import { getGreeting } from "@/core/utils";
import { GlassCard, SkeletonCard, SkeletonText } from "@/components/ui";

/* ─────────────────────────────────────────────────────
   DASHBOARD / HOME — Marketplace
   Shows featured vendors & quick stats.
   ───────────────────────────────────────────────────── */

const CATEGORIES = [
    { name: "Restaurant", icon: "🍳" },
    { name: "Groceries", icon: "🍎" },
    { name: "Pharmacy", icon: "💊" },
    { name: "Retail", icon: "🛍️" },
];

const stats = [
    { label: "Active Orders", value: "0", icon: Package },
    { label: "Nearby Vendors", value: "5", icon: MapPin },
    { label: "Avg. Delivery", value: "28m", icon: Clock },
    { label: "This Month", value: "₦0", icon: TrendingUp },
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
    const { data: vendors, isLoading } = useVendors();
    const { profile, user } = useAuth();
    const router = useRouter();

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

    const featuredVendors = vendors?.filter((v) => v.is_featured) ?? [];
    const nearbyVendors = vendors?.filter((v) => !v.is_featured) ?? [];

    return (
        <ScreenShell>
            <motion.div
                className="space-y-6"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={item}>
                    <p className="text-sm text-muted-foreground">{greeting}, {displayName}</p>
                    <h1 className="text-2xl font-bold tracking-tight mt-0.5">
                        What are you looking for?
                    </h1>
                </motion.div>

                {/* ── Search Entry ───────────────────────────── */}
                <motion.div variants={item}>
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
                        "
                    >
                        <Search className="h-4 w-4" />
                        <span>Search vendors, products...</span>
                    </button>
                </motion.div>

                {/* ── Quick Categories ──────────────────────── */}
                <motion.div variants={item} className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.name}
                            onClick={() => router.push(`/dashboard/search?category=${cat.name}`)}
                            className="
                                flex items-center gap-2 px-4 py-3 
                                glass rounded-2xl shrink-0 
                                hover:bg-white/[0.05] transition-colors
                            "
                        >
                            <span className="text-lg">{cat.icon}</span>
                            <span className="text-xs font-semibold">{cat.name}</span>
                        </button>
                    ))}
                </motion.div>

                {/* ── Quick Stats ───────────────────────────── */}
                <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {stats.map((stat) => (
                        <GlassCard
                            key={stat.label}
                            elevation="sm"
                            className="flex items-center gap-3 p-3"
                        >
                            <div className="h-9 w-9 rounded-[var(--radius-md)] bg-primary/5 flex items-center justify-center shrink-0">
                                <stat.icon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-lg font-semibold leading-tight">{stat.value}</p>
                                <p className="text-[11px] text-muted-foreground truncate">
                                    {stat.label}
                                </p>
                            </div>
                        </GlassCard>
                    ))}
                </motion.div>

                {/* ── Featured Vendors ──────────────────────── */}
                {featuredVendors.length > 0 && (
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
                                    {/* Avatar placeholder */}
                                    <div className="h-12 w-12 rounded-[var(--radius-md)] bg-primary/5 flex items-center justify-center shrink-0">
                                        <span className="text-lg font-bold text-muted-foreground">
                                            {vendor.name[0]}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-sm truncate">{vendor.name}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <MapPin className="h-3 w-3" />
                                            {vendor.location}
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

                {/* ── All Vendors ───────────────────────────── */}
                <motion.div variants={item}>
                    <h2 className="font-semibold mb-3">Nearby</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {nearbyVendors.length > 0 ? (
                            nearbyVendors.map((vendor) => (
                                <GlassCard
                                    key={vendor.id}
                                    interactive
                                    elevation="sm"
                                    className="cursor-pointer space-y-3"
                                    onClick={() => router.push(`/dashboard/vendor/${vendor.id}`)}
                                >
                                    {/* Cover placeholder */}
                                    <div className="h-28 rounded-[var(--radius-md)] bg-primary/5 flex items-center justify-center">
                                        <Package className="h-8 w-8 text-muted-foreground/40" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-sm">{vendor.name}</p>
                                            <span className="text-xs font-medium">{vendor.rating} ★</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {vendor.location} · {vendor.category || "Vendor"}
                                        </p>
                                    </div>
                                </GlassCard>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground py-8 text-center col-span-full">
                                No vendors found in your area.
                            </p>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </ScreenShell>
    );
}
