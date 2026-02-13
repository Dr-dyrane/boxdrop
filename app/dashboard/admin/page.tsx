"use client";

import { useAuth } from "@/core/hooks";
import { Shield, ArrowLeft, Activity, UserPlus, Filter, Map as MapIcon, Layers, Search } from "lucide-react";
import Link from "next/link";
import { GlassCard, Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { AdminUserTable } from "@/components/dashboard/admin/user-table";
import { LogisticsPulse } from "@/components/admin/logistics-pulse";
import { DiscoveryMap } from "@/components/shared/discovery-map";
import { ProvisionUserModal } from "@/components/dashboard/admin/provision-user-modal";
import { useNetworkTelemetry } from "@/core/hooks/use-network-telemetry";
import type { UserRole } from "@/types/database";
import { useMediaQuery } from "@/core/hooks/use-media-query";

export default function AdminDashboard() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const { orders } = useNetworkTelemetry();
    const isMobile = useMediaQuery("(max-width: 768px)");

    // ── State ─────────────────────────────────────
    const [provisionModalOpen, setProvisionModalOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push("/dashboard");
        }
    }, [isAdmin, authLoading, router]);

    // ── Map Markers Logic ─────────────────────────
    const mapMarkers = useMemo(() => {
        const markers: any[] = [];

        orders.forEach(order => {
            // 1. Delivery Points
            markers.push({
                id: `delivery-${order.id}`,
                lat: order.delivery_lat,
                lng: order.delivery_lng,
                type: 'delivery',
                active: true,
                label: `Order #${order.id.slice(0, 4)}`
            });

            // 2. Couriers (if in transit)
            if (order.courier_lat && order.courier_lng) {
                markers.push({
                    id: `courier-${order.id}`,
                    lat: order.courier_lat,
                    lng: order.courier_lng,
                    type: 'courier',
                    active: true
                });
            }

            // 3. Vendors
            const vendorLoc = (order.vendors as any)?.location?.coordinates;
            if (vendorLoc) {
                markers.push({
                    id: `vendor-${order.vendor_id}`,
                    lat: vendorLoc[1],
                    lng: vendorLoc[0],
                    type: 'vendor'
                });
            }
        });

        return markers;
    }, [orders]);

    if (authLoading || !isAdmin) return null;

    return (
        <div className={`min-h-screen bg-background text-foreground ${isMobile ? 'p-4 pb-32' : 'p-6 pb-24 lg:p-12'}`}>
            {/* 1. Header */}
            <div className={`flex flex-col ${isMobile ? 'gap-4' : 'lg:flex-row lg:items-center justify-between gap-6'} mb-8 lg:mb-12`}>
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-foreground/5 transition-colors text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Oversight Layer</span>
                    </div>
                    <h1 className={`${isMobile ? 'text-3xl' : 'text-4xl lg:text-5xl'} font-black tracking-tighter`}>
                        Logistics <span className="text-muted-foreground italic font-medium">Command Center</span>
                    </h1>
                </div>

                <div className={`flex items-center gap-3 bg-muted/30 ${isMobile ? 'p-3 w-full justify-between' : 'p-2'} rounded-2xl border border-foreground/5 shadow-2xl shadow-black/5`}>
                    <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Network Live</span>
                    </div>
                    {isMobile && (
                        <div className="flex items-center gap-1">
                            <Shield className="w-4 h-4 text-muted-foreground" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Admin Session</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. God-View Map Preview */}
            <div className={`mb-8 lg:mb-12 ${isMobile ? 'h-[300px]' : 'h-[400px] lg:h-[500px]'} w-full rounded-[2.5rem] border border-foreground/5 overflow-hidden relative group`}>
                <DiscoveryMap
                    markers={mapMarkers}
                    interactive={true}
                    zoom={isMobile ? 11 : 12}
                    className="w-full h-full grayscale-[0.5] contrast-[1.1]"
                />

                {/* Map Overlay HUD */}
                <div className={`absolute ${isMobile ? 'top-4 left-4' : 'top-6 left-6'} pointer-events-none`}>
                    <div className="glass-heavy border border-foreground/10 p-4 rounded-[1.5rem] flex flex-col gap-1 items-center shadow-xl">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Cycles</span>
                        <span className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-black tabular-nums leading-none text-foreground`}>{orders.length}</span>
                    </div>
                </div>

                <div className={`absolute ${isMobile ? 'bottom-4 right-4 flex-col items-end' : 'top-6 right-6'} flex gap-2`}>
                    <Button variant="secondary" size="sm" className="glass-heavy border-foreground/10 text-foreground rounded-xl h-10 shadow-lg">
                        <Layers className="w-4 h-4 mr-2" />
                        Layers
                    </Button>
                    <Link href="/dashboard/admin/network">
                        <Button variant="secondary" size="sm" className="glass-heavy border-foreground/10 text-foreground rounded-xl h-10 shadow-lg">
                            <MapIcon className="w-4 h-4 mr-2" />
                            Expand
                        </Button>
                    </Link>
                </div>
            </div>

            {/* 3. Oversight Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Real-time Logistics Pulse */}
                <div className="lg:col-span-12 xl:col-span-4">
                    <LogisticsPulse />
                </div>

                {/* Network Units Management */}
                <div className="lg:col-span-12 xl:col-span-8">
                    <GlassCard className={`p-6 lg:p-8 border-foreground/5 ${isMobile ? 'rounded-[2rem]' : ''}`}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                    <Shield className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-foreground leading-none">Network Units</h2>
                                    <p className="text-muted-foreground italic text-sm mt-1">Active Logistics Entities</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={`flex items-center gap-2 overflow-hidden transition-all duration-300 ${showSearch ? (isMobile ? 'w-full' : 'w-48 lg:w-64') + ' opacity-100' : 'w-0 opacity-0'}`}>
                                    <div className="relative w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            placeholder="Find..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full h-12 pl-9 pr-4 bg-foreground/5 border border-foreground/5 rounded-2xl text-xs outline-none focus:bg-foreground/10 transition-colors"
                                        />
                                    </div>
                                </div>

                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className={`border-foreground/10 ${showSearch ? 'bg-foreground/10' : ''}`}
                                    onClick={() => setShowSearch(!showSearch)}
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    {showSearch ? 'Collapse' : 'Filter'}
                                </Button>
                                {(!isMobile || !showSearch) && (
                                    <Button
                                        size="sm"
                                        className="bg-primary text-primary-foreground hover:opacity-90"
                                        onClick={() => setProvisionModalOpen(true)}
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Provision
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Filter Tabs (Sync with UserTable roleFilter) */}
                        {showSearch && (
                            <div className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-2">
                                {(["all", "admin", "vendor", "courier", "support", "user"] as const).map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setRoleFilter(role)}
                                        className={`
                                            h-8 px-4 rounded-full text-[9px] font-black uppercase tracking-widest
                                            transition-all shrink-0 border
                                            ${roleFilter === role
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-foreground/5 text-muted-foreground border-foreground/5 hover:border-foreground/20"
                                            }
                                        `}
                                    >
                                        {role === "all" ? "Every Unit" : role}
                                    </button>
                                ))}
                            </div>
                        )}

                        <AdminUserTable
                            search={searchQuery}
                            roleFilter={roleFilter}
                        />
                    </GlassCard>
                </div>
            </div>

            <ProvisionUserModal
                isOpen={provisionModalOpen}
                onClose={() => setProvisionModalOpen(false)}
            />
        </div>
    );
}
