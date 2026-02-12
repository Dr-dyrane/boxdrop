"use client";

import { useRef, useEffect, useState, useMemo } from "react";
import Map, { Marker, NavigationControl, MapRef } from "react-map-gl/mapbox";
import { Package, Truck, Store } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/core/store";

/* ─────────────────────────────────────────────────────
   DISCOVERY MAP
   Premium Map interface for Order Tracking.
   Supports multiple marker types and smooth camera transitions.
   ───────────────────────────────────────────────────── */

interface PinProps {
    type: "vendor" | "courier" | "delivery";
    active?: boolean;
}

function Pin({ type, active }: PinProps) {
    const icons = {
        vendor: Store,
        courier: Truck,
        delivery: Package,
    };
    const Icon = icons[type];

    return (
        <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            className={`
                relative h-10 w-10 flex items-center justify-center rounded-full shadow-2xl
                ${active ? "bg-primary text-primary-foreground" : "bg-background/90 text-foreground glass-heavy shadow-lg"}
            `}
        >
            <Icon className="h-5 w-5" />
            {active && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full ring-2 ring-background ring-offset-2 ring-offset-primary animate-pulse"
                />
            )}
        </motion.div>
    );
}

interface DiscoveryMapProps {
    center?: { lat: number; lng: number };
    markers?: Array<{
        id: string;
        lat: number;
        lng: number;
        type: "vendor" | "courier" | "delivery";
        active?: boolean;
    }>;
    className?: string;
}

export function DiscoveryMap({ center, markers = [], className = "" }: DiscoveryMapProps) {
    const mapRef = useRef<MapRef>(null);
    const { theme } = useThemeStore();

    // Standard grayscale-leaning styles for a premium look
    const mapStyle = useMemo(() => {
        return theme === "light"
            ? "mapbox://styles/mapbox/light-v11"
            : "mapbox://styles/mapbox/dark-v11";
    }, [theme]);

    const [viewState, setViewState] = useState({
        longitude: center?.lng ?? 3.3792, // Default Lagos
        latitude: center?.lat ?? 6.5244,
        zoom: 15, // Street level
    });

    // Handle center changes
    useEffect(() => {
        if (center) {
            setViewState(prev => ({
                ...prev,
                longitude: center.lng,
                latitude: center.lat,
            }));
            mapRef.current?.flyTo({
                center: [center.lng, center.lat],
                duration: 2000,
                essential: true
            });
        }
    }, [center]);

    return (
        <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden glass-heavy ${className}`}>
            <Map
                {...viewState}
                ref={mapRef}
                onMove={(evt: any) => setViewState(evt.viewState)}
                mapStyle={mapStyle}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                attributionControl={false}
            >
                <NavigationControl position="top-right" showCompass={false} />

                {markers.map((m) => (
                    <Marker
                        key={m.id}
                        longitude={m.lng}
                        latitude={m.lat}
                        anchor="bottom"
                    >
                        <Pin type={m.type} active={m.active} />
                    </Marker>
                ))}
            </Map>

            {/* Glass Overlay for Map Info */}
            <div className="absolute bottom-6 left-6 right-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-heavy p-4 rounded-[2rem] flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Truck className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-40">Live Tracking</p>
                            <p className="text-sm font-semibold">Courier is on the way</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
