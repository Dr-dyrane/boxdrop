"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrder, useVendor } from "@/core/hooks";
import { ScreenShell } from "@/components/layout/screen-shell";
import { GlassCard, Button } from "@/components/ui";
import { DiscoveryMap } from "@/components/shared/discovery-map";
import { ChevronLeft, Package, Clock, MapPin, Truck, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { formatCurrency, timeAgo } from "@/core/utils";
import { useLocation } from "@/core/hooks/use-location";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { advanceOrderSimulation } from "@/core/actions/courier-simulator";

/* ─────────────────────────────────────────────────────
   ORDER TRACKING PAGE
   Live telemetry for active orders.
   Includes simulated courier polling and route interpolation.
   ───────────────────────────────────────────────────── */

const statusSteps = [
    { key: "pending", label: "Pending", icon: Clock },
    { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
    { key: "preparing", label: "Preparing", icon: Package },
    { key: "picked_up", label: "In Transit", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

export default function OrderTrackingPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const { data: order, isLoading: isOrderLoading } = useOrder(id);
    const { data: vendor, isLoading: isVendorLoading } = useVendor(order?.vendor_id || "");
    const { location: userLocation } = useLocation();

    // Backend-Driven Simulation Polling
    useEffect(() => {
        if (!order || !vendor || order.status === 'delivered') return;

        // If we are in a simulatable state, poll the backend "courier"
        const isSimulatable = ['pending', 'confirmed', 'preparing', 'picked_up'].includes(order.status);

        if (isSimulatable) {
            const interval = setInterval(async () => {
                try {
                    // Call Server Action to advance the "courier"
                    await advanceOrderSimulation(
                        order.id,
                        order.status,
                        {
                            lat: (vendor.location as any).coordinates[1],
                            lng: (vendor.location as any).coordinates[0]
                        },
                        { lat: order.delivery_lat!, lng: order.delivery_lng! },
                        // Estimate current progress based on distance if needed, but for now we let backend manage abstract progress
                        // We actually need to store progress in DB to match perfect resumption, 
                        // but for this "seeding" demo, the backend action will handle incremental updates based on state.
                        0
                    );
                    // The useOrder hook's realtime subscription will pick up the DB changes 
                    // and update 'order' prop, which triggers re-render.
                } catch (e) {
                    console.error("Simulation tick failed", e);
                }
            }, 3000); // Tick every 3 seconds

            return () => clearInterval(interval);
        }
    }, [order, vendor]);

    const activeStatus = order?.status || 'pending';
    const isLoading = isOrderLoading || (order && isVendorLoading);

    // Generate Route Polyline (Simple Linear Interpolation for MVP)
    const route = useMemo(() => {
        if (!vendor || !order?.delivery_lat) return undefined;

        const start = { lat: (vendor.location as any).coordinates[1], lng: (vendor.location as any).coordinates[0] };
        const end = { lat: order.delivery_lat, lng: order.delivery_lng! };

        // Create 100 points between start and end
        const points: [number, number][] = [];
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const lat = start.lat + (end.lat - start.lat) * t;
            const lng = start.lng + (end.lng - start.lng) * t;
            points.push([lng, lat]);
        }
        return { coordinates: points, color: '#22c55e' }; // Green route
    }, [vendor, order]);

    // Use REAL courier position from DB (seeded) or vendor position
    const activeCenter = (order?.courier_lat && order?.courier_lng)
        ? { lat: order.courier_lat, lng: order.courier_lng }
        : order?.delivery_lat
            ? { lat: order.delivery_lat, lng: order.delivery_lng! }
            : userLocation || undefined;

    if (isLoading) {
        return (
            <ScreenShell>
                <div className="space-y-6">
                    <div className="h-10 w-32 skeleton" />
                    <div className="h-[400px] w-full skeleton rounded-[2.5rem]" />
                    <div className="space-y-4">
                        <div className="h-20 w-full skeleton rounded-[2rem]" />
                        <div className="h-20 w-full skeleton rounded-[2rem]" />
                    </div>
                </div>
            </ScreenShell>
        );
    }

    if (!order) {
        return (
            <ScreenShell>
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-muted-foreground">Order not found</p>
                    <Button onClick={() => router.push("/dashboard/orders")} className="mt-4">
                        Back to Orders
                    </Button>
                </div>
            </ScreenShell>
        );
    }

    const currentStepIndex = statusSteps.findIndex(s => s.key === activeStatus);

    // Construct Markers
    const markers: any[] = [];

    // 1. Delivery Location
    if (order.delivery_lat) {
        markers.push({
            id: "delivery",
            lat: order.delivery_lat,
            lng: order.delivery_lng!,
            type: "delivery",
            active: activeStatus === "delivered"
        });
    }

    // 2. User Location (Blue Dot)
    if (userLocation) {
        markers.push({
            id: "user-loc",
            lat: userLocation.lat,
            lng: userLocation.lng,
            type: "user",
        });
    }

    // 3. Vendor Location
    if (vendor && (vendor.location as any)?.coordinates) {
        markers.push({
            id: "vendor",
            lat: (vendor.location as any).coordinates[1],
            lng: (vendor.location as any).coordinates[0],
            type: "vendor"
        });
    }

    // 4. Courier (Live from DB)
    if (order.courier_lat && order.courier_lng && activeStatus !== 'delivered' && activeStatus !== 'pending') {
        markers.push({
            id: "courier",
            lat: order.courier_lat,
            lng: order.courier_lng,
            type: "courier",
            active: true
        });
    }

    return (
        <ScreenShell flush>
            <div className="flex flex-col lg:flex-row h-[100dvh]">
                {/* ── Main Viewport: Map (Left 2/3 on Desktop) ────────────────── */}
                <div className="flex-1 min-h-[40vh] relative overflow-hidden">
                    <button
                        onClick={() => router.back()}
                        className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] left-6 z-10 h-10 w-10 glass-heavy rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>

                    <DiscoveryMap
                        center={activeCenter}
                        zoom={14}
                        markers={markers}
                        route={activeStatus === 'picked_up' ? route : undefined}
                        className="absolute inset-0"
                    />
                </div>

                {/* ── Telemetry Panel (Right 1/3 on Desktop / Bottom on Mobile) ── */}
                <div className="lg:w-[420px] lg:h-full lg:border-l lg:border-foreground/5 glass-heavy lg:bg-background/80 lg:backdrop-blur-3xl rounded-t-[3rem] lg:rounded-none flex flex-col shadow-2xl lg:shadow-none z-20">
                    <div className="p-8 lg:p-10 space-y-10 overflow-y-auto flex-1 scrollbar-none">
                        {/* Header Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Live Tracking</p>
                                <span className={`
                                    px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest
                                    ${activeStatus === 'delivered' ? 'bg-success/10 text-success' : 'bg-primary text-background'}
                                `}>
                                    {activeStatus.replace('_', ' ')}
                                </span>
                            </div>
                            <h1 className="text-3xl font-black tracking-tight leading-none">Order #{order.id.slice(0, 8)}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <p className="text-xs font-medium uppercase tracking-widest">{timeAgo(order.created_at)}</p>
                                <span className="text-foreground/10">•</span>
                                <p className="text-xs font-black text-foreground">{formatCurrency(order.total)}</p>
                            </div>
                        </div>

                        {/* Status Timeline */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Progress Timeline</h3>
                            <div className="space-y-8 relative">
                                {statusSteps.map((step, i) => {
                                    const isCompleted = i <= currentStepIndex;
                                    const isCurrent = i === currentStepIndex;
                                    const Icon = step.icon;

                                    return (
                                        <div key={step.key} className="flex items-center gap-4 relative group">
                                            {/* Connector line */}
                                            {i < statusSteps.length - 1 && (
                                                <div className="absolute left-5 top-10 bottom-[-20px] w-[1px] bg-foreground/5 overflow-hidden">
                                                    <motion.div
                                                        initial={{ height: 0 }}
                                                        animate={{ height: isCompleted ? "100%" : 0 }}
                                                        className="w-full bg-primary origin-top"
                                                        transition={{ duration: 0.8, delay: i * 0.1 }}
                                                    />
                                                </div>
                                            )}

                                            <div className={`
                                                h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500
                                                ${isCompleted ? "bg-foreground text-background" : "bg-foreground/5 text-muted-foreground/30"}
                                                ${isCurrent ? "ring-4 ring-primary/20 scale-110" : ""}
                                            `}>
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <div className="min-w-0">
                                                <p className={`text-sm font-black transition-opacity ${isCompleted ? "opacity-100" : "opacity-30"}`}>
                                                    {step.label}
                                                </p>
                                                {isCurrent && (
                                                    <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5 animate-pulse">
                                                        Active Step
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Logistics Bento */}
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Delivery Signals</h3>
                            <div className="grid grid-cols-1 gap-4">
                                <GlassCard className="flex items-center gap-4 p-5 rounded-3xl border border-foreground/5">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Destination</p>
                                        <p className="text-sm font-bold truncate leading-tight">{order.delivery_location}</p>
                                    </div>
                                </GlassCard>

                                <GlassCard className="flex items-center gap-4 p-5 rounded-3xl border border-foreground/5">
                                    <div className="h-12 w-12 rounded-2xl bg-orange-500/5 flex items-center justify-center shrink-0">
                                        <Clock className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">ETA</p>
                                        <p className="text-sm font-bold leading-tight">25 - 35 mins</p>
                                    </div>
                                </GlassCard>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-8 lg:p-10 pt-4 border-t border-foreground/5 bg-background/50">
                        <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/10">
                            Contact Courier
                        </Button>
                    </div>
                </div>
            </div>
        </ScreenShell>
    );
}
