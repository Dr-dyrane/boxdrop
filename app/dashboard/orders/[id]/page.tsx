"use client";

import { useParams, useRouter } from "next/navigation";
import { useOrder, useVendor } from "@/core/hooks";
import { ScreenShell } from "@/components/layout/screen-shell";
import { GlassCard, Button } from "@/components/ui";
import { DiscoveryMap } from "@/components/shared/discovery-map";
import { ChevronLeft, ChevronUp, ChevronRight, Package, Clock, MapPin, Truck, CheckCircle2, Bike } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency, timeAgo } from "@/core/utils";
import { useLocation } from "@/core/hooks/use-location";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { advanceOrderSimulation } from "@/core/actions/courier-simulator";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * PRODUCTION READINESS & GO-LIVE GUIDE
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * 1. DATA INFRASTRUCTURE (Supabase):
 *    - Ensure the 'orders' table contains 'courier_lat' and 'courier_lng' cols.
 *    - Type: DOUBLE PRECISION or GEOMETRY(Point, 4326).
 *    - Ensure Row Level Security (RLS) allows the Courier/System to write.
 * 
 * 2. REAL-TIME PIPELINE:
 *    - Currently, this page uses a "Virtual Simulation" loop (useEffect line ~118)
 *      to provide a smooth level 3/10 experience without backend heavy lifting.
 *    - FOR PRODUCTION: Delete the 'advanceOrderSimulation' useEffect. 
 *    - The 'useOrder' hook already provides real-time Supabase subscriptions.
 *    - The UI will bind directly to 'order.courier_lat' and 'order.progress'.
 * 
 * 3. ROUTE FETCHING (Mapbox):
 *    - Transitions from start -> end coordinates via the Directions API.
 *    - Optimized to follow the USER'S LIVE GPS if available.
 * 
 * 4. DEMO MODE:
 *    - Used for localized testing in Hemet, CA.
 *    - Toggle 'isDemoMode' to false for authentic database-to-glass tracking.
 * ─────────────────────────────────────────────────────────────────────────────
 */

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

    const [isDemoMode, setIsDemoMode] = useState(false);
    const [demoTick, setDemoTick] = useState(0);
    const [virtualOrder, setVirtualOrder] = useState<any>(null);
    const [isSheetExpanded, setIsSheetExpanded] = useState(false);
    const [isDesktopPanelCollapsed, setIsDesktopPanelCollapsed] = useState(false);

    // Demo Mode Simulation Interval
    useEffect(() => {
        if (!isDemoMode) return;
        const interval = setInterval(() => {
            setDemoTick(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isDemoMode]);

    // Consolidated Display Data
    const displayOrder = useMemo(() => {
        // 1. Prioritize Virtual Simulation State (Continuity)
        if (virtualOrder && !isDemoMode) return virtualOrder;

        // 2. Fallback to Realtime DB State
        if (order && !isDemoMode) {
            // RESILIENCE: If Live order is missing coordinates, provide Hemet defaults
            const delivery_lat = Number(order.delivery_lat) || 33.74;
            const delivery_lng = Number(order.delivery_lng) || -116.95;

            return {
                ...order,
                delivery_lat,
                delivery_lng,
                delivery_location: order.delivery_location || "Hemet, CA"
            };
        }
        if (isDemoMode) {
            const cycleSeconds = 30; // Complete one status cycle every 30s for demo
            const statusIndex = Math.floor((demoTick % cycleSeconds) / (cycleSeconds / statusSteps.length));
            const progress = (demoTick % (cycleSeconds / statusSteps.length)) / (cycleSeconds / statusSteps.length);

            return {
                id: "DEMO-TRACK-LXI",
                status: statusSteps[Math.min(statusIndex, 4)].key as any,
                total: 84.20,
                delivery_location: "2235 Corinto Court, Hemet, CA",
                delivery_lat: 33.7431,
                delivery_lng: -116.9478,
                progress: progress,
                // Move courier from vendor to delivery
                courier_lat: 33.747 + (33.7431 - 33.747) * progress,
                courier_lng: -116.971 + (-116.9478 - (-116.971)) * progress,
                created_at: new Date(Date.now() - 3600000).toISOString(),
                vendor_id: "DEMO-VND-01"
            };
        }
        return null;
    }, [order, isDemoMode, demoTick, virtualOrder]);

    const displayVendor = useMemo(() => {
        if (vendor) return vendor;
        if (isDemoMode) {
            return {
                id: "DEMO-VND-01",
                name: "Demo Kitchen Hemet",
                location: { coordinates: [-116.971, 33.747] }
            };
        }
        return null;
    }, [vendor, isDemoMode]);

    const activeStatus = displayOrder?.status || 'pending';
    const currentStepIndex = statusSteps.findIndex(s => s.key === activeStatus);
    const isLoading = isOrderLoading || (order && isVendorLoading);

    /**
     * LOGISTICS SIMULATION ENGINE
     * ---------------------------
     * In the absence of a live Courier App writing to the database, this loop
     * calls a server action to "nudge" the order through its lifecycle.
     * 
     * [PRODUCTION]: Remove this entire block when a real logistics backend is active.
     */
    useEffect(() => {
        if (!displayOrder || !displayVendor || displayOrder.status === 'delivered' || isDemoMode) return;

        const isSimulatable = ['pending', 'confirmed', 'preparing', 'picked_up'].includes(displayOrder.status);
        const hasVendorLoc = (displayVendor.location as any)?.coordinates;

        if (isSimulatable && hasVendorLoc) {
            const interval = setInterval(async () => {
                try {
                    const nextState = await advanceOrderSimulation(
                        displayOrder.id,
                        displayOrder.status,
                        {
                            lat: (displayVendor.location as any).coordinates[1],
                            lng: (displayVendor.location as any).coordinates[0]
                        },
                        {
                            // Priority: Live GPS > DB Destination > Hemet Default
                            lat: userLocation?.lat || Number(displayOrder.delivery_lat) || 33.74,
                            lng: userLocation?.lng || Number(displayOrder.delivery_lng) || -116.95
                        },
                        displayOrder.progress || 0
                    );
                    setVirtualOrder({ ...displayOrder, ...nextState });
                } catch (e) {
                    console.error("Simulation tick failed", e);
                }
            }, 3000); // 1x Speed Simulation

            return () => clearInterval(interval);
        }
    }, [displayOrder?.status, displayOrder?.progress, displayVendor, isDemoMode]);

    // DYNAMIC ZOOM & TELEMETRY
    useEffect(() => {
        // Quiet production logs
    }, [displayOrder?.status]);

    // REAL-ROAD NAVIGATION (Mapbox Directions API)
    const [smartRoute, setSmartRoute] = useState<{ coordinates: [number, number][] } | null>(null);

    useEffect(() => {
        const vendorLoc = (displayVendor?.location as any)?.coordinates;
        const destLat = userLocation?.lat || displayOrder?.delivery_lat;
        const destLng = userLocation?.lng || displayOrder?.delivery_lng;

        if (!vendorLoc || !destLat || !destLng) return;

        const start = [vendorLoc[0], vendorLoc[1]]; // [lng, lat]
        const end = [destLng, destLat];

        const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

        const fetchRoute = async () => {
            if (!token) {
                console.error("🚨 [Mapbox] Missing Access Token. Static route only.");
                return;
            }

            try {
                const query = await fetch(
                    `https://api.mapbox.com/directions/v5/mapbox/driving/${start.join(',')};${end.join(',')}?geometries=geojson&access_token=${token}`
                );
                const json = await query.json();

                if (json.code !== 'Ok') {
                    console.error("🚨 [Mapbox] Directions API Error:", json.code, json.message);
                    return;
                }

                if (json.routes?.[0]) {
                    const data = json.routes[0];
                    setSmartRoute({ coordinates: data.geometry.coordinates });
                }
            } catch (e) {
                console.warn("🚨 [Mapbox] Fetch Failed. Falling back to straight line.", e);
            }
        };

        fetchRoute();
    }, [displayVendor, displayOrder?.delivery_lat, displayOrder?.delivery_lng, userLocation?.lat, userLocation?.lng]);

    // Path Snapping: Interpolate position along the road polyline
    const visualCourierPos = useMemo(() => {
        if (!displayOrder?.courier_lat || !displayOrder?.courier_lng) return null;
        if (!smartRoute || smartRoute.coordinates.length < 2) {
            return { lat: displayOrder.courier_lat, lng: displayOrder.courier_lng };
        }

        // Snap to the polyline based on progress
        const coords = smartRoute.coordinates;
        const progress = displayOrder.progress || 0;
        const index = Math.min(Math.floor(progress * (coords.length - 1)), coords.length - 2);
        const nextIndex = index + 1;
        const subProgress = (progress * (coords.length - 1)) % 1;

        const p1 = coords[index];
        const p2 = coords[nextIndex];

        return {
            lng: p1[0] + (p2[0] - p1[0]) * subProgress,
            lat: p1[1] + (p2[1] - p1[1]) * subProgress
        };
    }, [displayOrder, smartRoute]);

    const route = useMemo(() => {
        if (smartRoute) return { ...smartRoute, color: '#000000' };

        // Straight line fallback if API fails
        const vendorLoc = (displayVendor?.location as any)?.coordinates;
        if (!vendorLoc || !displayOrder?.delivery_lat) return undefined;

        const start = { lat: vendorLoc[1], lng: vendorLoc[0] };
        const end = { lat: displayOrder.delivery_lat, lng: displayOrder.delivery_lng! };

        const points: [number, number][] = [];
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const lat = start.lat + (end.lat - start.lat) * t;
            const lng = start.lng + (end.lng - start.lng) * t;
            points.push([lng, lat]);
        }
        return { coordinates: points, color: '#000000' };
    }, [smartRoute, displayVendor, displayOrder]);

    // Calculate heading/bearing based on road segments
    const courierHeading = useMemo(() => {
        const coords = smartRoute?.coordinates;
        if (!coords || coords.length < 2) {
            const vendorLoc = (displayVendor?.location as any)?.coordinates;
            if (!vendorLoc || !displayOrder?.delivery_lat) return 0;
            const start = { lat: vendorLoc[1], lng: vendorLoc[0] };
            const end = { lat: displayOrder.delivery_lat, lng: displayOrder.delivery_lng! };
            return Math.atan2(end.lng - start.lng, end.lat - start.lat) * 180 / Math.PI;
        }

        const progress = displayOrder?.progress || 0;
        const index = Math.min(Math.floor(progress * (coords.length - 1)), coords.length - 2);
        const nextIndex = index + 1;
        const p1 = coords[index];
        const p2 = coords[nextIndex];

        const toRad = (d: number) => (d * Math.PI) / 180;
        const toDeg = (r: number) => (r * 180) / Math.PI;

        const y = Math.sin(toRad(p2[0] - p1[0])) * Math.cos(toRad(p2[1]));
        const x = Math.cos(toRad(p1[1])) * Math.sin(toRad(p2[1])) -
            Math.sin(toRad(p1[1])) * Math.cos(toRad(p2[1])) * Math.cos(toRad(p2[0] - p1[0]));

        return (toDeg(Math.atan2(y, x)) + 360) % 360;
    }, [smartRoute, displayOrder, displayVendor]);

    // Consolidated Logic & Dynamic Zoom
    const dynamicZoom = isDemoMode || displayOrder?.courier_lat ? 14 : 12;

    // CENTER ON IMPORTANT ANCHOR (User > Courier > Vendor)
    const activeCenter = useMemo(() => {
        if (userLocation) return userLocation;
        if (visualCourierPos) return visualCourierPos;
        if (displayVendor?.location) {
            const coords = (displayVendor.location as any).coordinates;
            return { lat: coords[1], lng: coords[0] };
        }
        return {
            lat: displayOrder?.delivery_lat || 33.74,
            lng: displayOrder?.delivery_lng || -116.95
        };
    }, [userLocation, visualCourierPos, displayVendor, displayOrder]);

    // DYNAMIC ZOOM & TELEMETRY (QUIET)
    useEffect(() => {
        // Silent
    }, [displayOrder?.id]);

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

    if (!displayOrder) {
        return (
            <ScreenShell>
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 max-w-md mx-auto">
                    <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center">
                        <Package className="h-10 w-10 text-primary opacity-20" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight">No Order Telemetry</h2>
                        <p className="text-muted-foreground text-sm">We couldn't find an active order for this ID in your database. Would you like to start a demo simulation instead?</p>
                    </div>
                    <div className="flex flex-col w-full gap-3 pt-4">
                        <Button onClick={() => setIsDemoMode(true)} className="h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/10">
                            Start Demo Simulation
                        </Button>
                        <Button variant="secondary" onClick={() => router.push("/dashboard/orders")} className="h-14 rounded-2xl font-black uppercase tracking-widest">
                            Back to Orders
                        </Button>
                    </div>
                </div>
            </ScreenShell>
        );
    }

    // Construct Markers
    const markers: any[] = [];
    const destLat = userLocation?.lat || displayOrder.delivery_lat;
    const destLng = userLocation?.lng || displayOrder.delivery_lng;

    if (destLat && destLng) {
        markers.push({
            id: "delivery",
            lat: destLat,
            lng: destLng,
            type: "delivery" as const,
            active: activeStatus === "delivered"
        });
    }
    if (userLocation) {
        markers.push({
            id: "user-loc",
            lat: userLocation.lat,
            lng: userLocation.lng,
            type: "user" as const
        });
    }
    if (displayVendor && (displayVendor.location as any)?.coordinates) {
        markers.push({
            id: "vendor",
            lat: (displayVendor.location as any).coordinates[1],
            lng: (displayVendor.location as any).coordinates[0],
            type: "vendor" as const,
            status: activeStatus // This triggers the Chef/Check animations on the map
        });
    }
    if (visualCourierPos && activeStatus !== 'delivered') {
        markers.push({
            id: "courier",
            lat: visualCourierPos.lat,
            lng: visualCourierPos.lng,
            type: "courier" as const,
            active: true,
            heading: courierHeading
        });
    }

    const ActiveIcon = statusSteps[currentStepIndex]?.icon || Package;

    // ── Sidebar Content ───────────────────────────────
    const OrderDetailsSidebar = (
        <div className="space-y-10 min-h-full flex flex-col">
            <TimelineContent
                displayOrder={displayOrder}
                activeStatus={activeStatus}
                currentStepIndex={currentStepIndex}
                isDemoMode={isDemoMode}
            />

            <div className="mt-auto pt-10 sticky bottom-0">
                <Button className="w-full h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/10">
                    Contact Courier
                </Button>
            </div>
        </div>
    );

    return (
        <ScreenShell flush side={OrderDetailsSidebar}>
            <div className="relative w-full h-[calc(100vh-80px)] lg:h-[100dvh] overflow-hidden">
                {/* Floating Header */}
                <div className="absolute top-[calc(1.5rem+env(safe-area-inset-top))] left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <button
                            onClick={() => router.back()}
                            className="h-10 w-10 glass-heavy rounded-full flex items-center justify-center active:scale-90 transition-transform cursor-pointer"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        <div className="glass-heavy px-4 py-2 rounded-2xl flex items-center gap-3 border border-foreground/5 shadow-2xl">
                            <div className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mt-0.5">#{displayOrder.id.slice(0, 8)}</p>
                        </div>
                    </div>
                </div>

                <DiscoveryMap
                    center={activeCenter}
                    zoom={14}
                    markers={markers}
                    route={route}
                    className="absolute inset-0 h-full w-full"
                />

                {/* Mobile Dynamic Bottom Sheet */}
                <motion.div
                    initial={false}
                    animate={{ height: isSheetExpanded ? "85vh" : "33vh" }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="absolute bottom-0 left-0 right-0 bg-background rounded-t-[3rem] z-[50] flex flex-col lg:hidden border-t border-foreground/5 shadow-[0_-20px_50px_rgba(0,0,0,0.15)] overflow-hidden pb-[calc(1rem+env(safe-area-inset-bottom))]"
                >
                    {/* Drag/Click Handle */}
                    <button
                        onClick={() => setIsSheetExpanded(!isSheetExpanded)}
                        className="w-full flex flex-col items-center py-4 shrink-0 group"
                    >
                        <div className="w-12 h-1.5 bg-foreground/10 rounded-full mb-2 transition-colors group-hover:bg-foreground/20" />
                    </button>

                    <div className="flex-1 overflow-y-auto px-8 scrollbar-none pb-20">
                        {isSheetExpanded ? (
                            <TimelineContent
                                displayOrder={displayOrder}
                                activeStatus={activeStatus}
                                currentStepIndex={currentStepIndex}
                                isDemoMode={isDemoMode}
                            />
                        ) : (
                            <SummaryContent
                                displayOrder={displayOrder}
                                activeStatus={activeStatus}
                                ActiveIcon={ActiveIcon}
                                statusLabel={statusSteps[currentStepIndex]?.label}
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </ScreenShell>
    );
}

// Sub-component for shared timeline content
function TimelineContent({ displayOrder, activeStatus, currentStepIndex, isDemoMode }: any) {
    return (
        <div className="space-y-10">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">{isDemoMode ? "DEMO MODE" : "Live Tracking"}</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${activeStatus === 'delivered' ? 'bg-foreground text-background' : 'border border-foreground text-foreground'}`}>
                        {activeStatus.replace('_', ' ')}
                    </span>
                </div>
                <h1 className="text-3xl font-black tracking-tight leading-none">Order #{displayOrder.id.slice(0, 8)}</h1>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <p className="text-xs font-medium uppercase tracking-widest">{timeAgo(displayOrder.created_at)}</p>
                    <span className="text-foreground/10">•</span>
                    <p className="text-xs font-black text-foreground">{formatCurrency(displayOrder.total)}</p>
                </div>
            </div>

            <div className="space-y-6 text-black dark:text-white">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Progress Timeline</h3>
                <div className="space-y-8 relative">
                    {statusSteps.map((step, i) => {
                        const isCompleted = i <= currentStepIndex;
                        const isCurrent = i === currentStepIndex;
                        const Icon = step.icon;
                        return (
                            <div key={step.key} className="flex items-center gap-5 group">
                                <div className="relative z-10">
                                    <div className={`
                                        h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500
                                        ${isCompleted ? 'bg-foreground text-background shadow-xl scale-110' : 'bg-foreground/5 text-muted-foreground/30 border border-foreground/5'}
                                        ${isCurrent ? 'ring-4 ring-foreground/10 scale-125' : ''}
                                    `}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    {i < statusSteps.length - 1 && (
                                        <div className={`absolute top-12 left-1/2 -translate-x-1/2 w-[2px] h-8 transition-colors duration-500 ${isCompleted ? 'bg-foreground' : 'bg-foreground/5'}`} />
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <p className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isCompleted ? 'text-foreground' : 'text-muted-foreground/30'}`}>Step 0{i + 1}</p>
                                    <p className={`text-lg font-black tracking-tight transition-colors ${isCompleted ? 'text-foreground' : 'text-muted-foreground/30'}`}>{step.label}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">Delivery Signals</h3>
                <div className="grid grid-cols-1 gap-4">
                    <GlassCard className="flex items-center gap-4 p-5 rounded-3xl border border-foreground/5">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                            <Bike className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Destination</p>
                            <p className="text-sm font-bold truncate leading-tight">{displayOrder.delivery_location}</p>
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
    );
}

function SummaryContent({ displayOrder, activeStatus, ActiveIcon, statusLabel }: any) {
    return (
        <div className="space-y-6 pt-2">
            <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center shadow-lg shrink-0">
                    <ActiveIcon className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{activeStatus.replace('_', ' ')}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">#{displayOrder.id.slice(0, 8)}</p>
                    </div>
                    <p className="text-xl font-black tracking-tight truncate">{statusLabel}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Destination</p>
                    <p className="text-[11px] font-bold truncate leading-none">{displayOrder.delivery_location.split(',')[0]}</p>
                </div>
                <div className="p-4 rounded-2xl bg-foreground/[0.03] border border-foreground/5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mb-1">Arrival</p>
                    <p className="text-[11px] font-bold leading-none">~25 mins</p>
                </div>
            </div>
        </div>
    );
}
