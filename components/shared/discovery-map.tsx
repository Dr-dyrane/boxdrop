import { useRef, useEffect, useState, useMemo } from "react";
import Map, { Marker, NavigationControl, MapRef, Source, Layer } from "react-map-gl/mapbox";
import { Package, Truck, Store, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useThemeStore } from "@/core/store";
import type { LineLayer } from 'mapbox-gl';

/* ─────────────────────────────────────────────────────
   DISCOVERY MAP
   Premium Map interface for Order Tracking.
   Supports multiple marker types, smooth camera transitions,
   and route visualization (polylines).
   ───────────────────────────────────────────────────── */

interface PinProps {
    type: "vendor" | "courier" | "delivery" | "user";
    active?: boolean;
}

function Pin({ type, active }: PinProps) {
    const icons = {
        vendor: Store,
        courier: Truck,
        delivery: Package,
        user: User,
    };
    const Icon = icons[type];

    if (type === 'user') {
        return (
            <div className="relative flex items-center justify-center">
                <span className="h-4 w-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10" />
                <motion.span
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute h-4 w-4 bg-blue-500 rounded-full opacity-50"
                />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            className={`
                relative h-10 w-10 flex items-center justify-center rounded-full shadow-2xl
                ${active ? "bg-primary text-primary-foreground" : type === 'courier' ? "bg-foreground text-background" : "bg-background/90 text-foreground glass-heavy shadow-lg"}
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
    zoom?: number;
    markers?: Array<{
        id: string;
        lat: number;
        lng: number;
        type: "vendor" | "courier" | "delivery" | "user";
        active?: boolean;
    }>;
    route?: {
        coordinates: [number, number][]; // [lng, lat]
        color?: string;
    };
    className?: string;
    interactive?: boolean;
}

export function DiscoveryMap({ center, zoom = 14, markers = [], route, className = "", interactive = true }: DiscoveryMapProps) {
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
        zoom: zoom,
    });

    // Handle center changes with smooth flyTo
    useEffect(() => {
        if (center) {
            mapRef.current?.flyTo({
                center: [center.lng, center.lat],
                zoom: zoom,
                duration: 2000,
                essential: true
            });
        }
    }, [center, zoom]);

    // Construct GeoJSON for route
    const routeGeoJSON = useMemo(() => {
        if (!route || route.coordinates.length < 2) return null;
        return {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'LineString',
                coordinates: route.coordinates
            }
        };
    }, [route]);

    const routeLayer: LineLayer = {
        id: 'route-line',
        type: 'line',
        source: 'route-source',
        layout: {
            'line-join': 'round',
            'line-cap': 'round'
        },
        paint: {
            'line-color': route?.color || '#000000', // Default black/foreground color
            'line-width': 4,
            'line-opacity': 0.6
        }
    };

    return (
        <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden glass-heavy ${className}`}>
            <Map
                {...viewState}
                ref={mapRef}
                onMove={(evt) => setViewState(evt.viewState)}
                mapStyle={mapStyle}
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                attributionControl={false}
                interactive={interactive}
            >
                {interactive && <NavigationControl position="top-right" showCompass={false} />}

                {/* Route Visualization */}
                {routeGeoJSON && (
                    <Source id="route-source" type="geojson" data={routeGeoJSON as any}>
                        <Layer {...routeLayer} />
                    </Source>
                )}

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

            {/* Glass Overlay for Map Info - Only show if tracking active */}
            {markers.some(m => m.type === 'courier') && (
                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-heavy p-4 rounded-[2rem] flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Truck className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-0.5">Live Telemetry</p>
                                <p className="text-sm font-black">Courier en route to destination</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
