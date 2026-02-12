import { useRef, useEffect, useState, useMemo } from "react";
import Map, { Marker, NavigationControl, MapRef, Source, Layer } from "react-map-gl/mapbox";
import { Package, Bike, Store, User, ChefHat, Utensils, CheckCircle2, History } from "lucide-react";
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
    heading?: number;
    status?: string;
}

function Pin({ type, active, heading = 0, status }: PinProps) {
    const icons = {
        vendor: Store,
        courier: Bike,
        delivery: Package,
        user: User,
    };
    const Icon = icons[type];

    if (type === 'user') {
        return (
            <div className="relative flex items-center justify-center">
                <span className="h-4 w-4 bg-black rounded-full border-2 border-white shadow-lg relative z-10" />
                <motion.span
                    initial={{ scale: 1, opacity: 0.8 }}
                    animate={{ scale: 3, opacity: 0 }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute h-4 w-4 bg-black rounded-full opacity-50"
                />
            </div>
        );
    }

    // SPECIAL CASE: Vendor Activity Animations (Minimalist B&W)
    if (type === 'vendor') {
        if (status === 'preparing') {
            return (
                <div className="relative group">
                    <motion.div
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                        className="h-10 w-10 bg-black shadow-2xl rounded-2xl flex items-center justify-center text-white relative z-10 border border-white/10"
                    >
                        <ChefHat className="h-5 w-5" />
                    </motion.div>
                </div>
            );
        }
        if (status === 'confirmed') {
            return (
                <div className="relative group">
                    <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="h-10 w-10 bg-black shadow-2xl rounded-2xl flex items-center justify-center text-white relative z-10 border border-white/10"
                    >
                        <CheckCircle2 className="h-5 w-5" />
                    </motion.div>
                </div>
            );
        }
    }

    return (
        <motion.div
            initial={{ scale: 0, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            whileHover={{ scale: 1.1 }}
            className={`
                relative h-10 w-10 flex items-center justify-center rounded-full shadow-2xl
                ${active ? "bg-black text-white" : type === 'courier' ? "bg-black text-white" : "bg-white text-black border border-black/10"}
                transition-colors duration-500
            `}
            style={{
                transform: type === 'courier' ? `rotate(${heading}deg)` : 'none'
            } as any}
        >
            <Icon className="h-5 w-5" style={{ transform: type === 'courier' ? `rotate(${-heading}deg)` : 'none' } as any} />
            {active && (
                <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 h-3 w-3 bg-black rounded-full ring-2 ring-white animate-pulse"
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
        heading?: number;
        status?: string;
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

    /**
     * PRODUCTION VIEWPORT MANAGEMENT
     * -----------------------------
     * This map uses a dual-layer positioning system:
     * 1. viewState: Handles manual panning/zooming.
     * 2. fitBounds: Automatically frames ALL active logistics markers (User, Vendor, Courier).
     * 
     * [GUIDE]: The grayscale style (Standard v11) is selected to maintain the 'Liquid Glass'
     * B&W aesthetic. Change the tilesets in mapStyle if a more colorful map is desired.
     */
    const [viewState, setViewState] = useState({
        longitude: center?.lng || -116.95,
        latitude: center?.lat || 33.74,
        zoom: zoom,
    });

    // Update viewState when center prop changes externally (jump to location)
    useEffect(() => {
        if (center) {
            setSafeViewState({
                ...viewState,
                latitude: center.lat,
                longitude: center.lng,
                zoom: zoom
            });
        }
    }, [center?.lat, center?.lng]);

    // Bounds fitting whenever logistics markers change
    useEffect(() => {
        // We want to see the "Logistics Line": User -> Vendor -> Delivery
        const focusMarkers = markers.filter(m => {
            const lat = Number(m.lat);
            const lng = Number(m.lng);
            return !isNaN(lat) && !isNaN(lng) && ['user', 'vendor', 'delivery', 'courier'].includes(m.type);
        });

        if (focusMarkers.length > 0 && mapRef.current) {
            const lats = focusMarkers.map(m => Number(m.lat));
            const lngs = focusMarkers.map(m => Number(m.lng));

            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);

            // Double check for finite numbers
            if ([minLat, maxLat, minLng, maxLng].every(n => isFinite(n))) {
                // If only one marker, just center on it
                if (focusMarkers.length === 1) {
                    mapRef.current.easeTo({
                        center: [minLng, minLat],
                        zoom: 14,
                        duration: 1000
                    });
                } else {
                    // Adjust padding for mobile (more compact)
                    const isMobile = window.innerWidth < 768;
                    mapRef.current.fitBounds(
                        [[minLng, minLat], [maxLng, maxLat]],
                        {
                            padding: isMobile
                                ? { top: 80, bottom: 200, left: 40, right: 40 } // More bottom padding for mobile sheet
                                : { top: 120, bottom: 120, left: 80, right: 80 },
                            duration: 1000
                        }
                    );
                }
            }
        }
    }, [markers.length, JSON.stringify(markers.map(m => ({ id: m.id, active: m.active, lat: m.lat, lng: m.lng })))]);

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
            'line-color': '#000000', // Pure Black for B&W Aesthetic
            'line-width': 4,
            'line-opacity': 0.6
        }
    };

    // Safe state setter to prevent "Vec4" crashes from poisoned data
    const setSafeViewState = (next: any) => {
        if (isFinite(next.latitude) && isFinite(next.longitude) && isFinite(next.zoom)) {
            setViewState(next);
        }
    };

    return (
        <div className={`relative w-full h-full rounded-[2.5rem] overflow-hidden glass-heavy ${className}`}>
            <Map
                {...viewState}
                ref={mapRef}
                style={{ width: '100%', height: '100%' }}
                onMove={(evt) => setSafeViewState(evt.viewState)}
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

                {markers.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-sm z-50 pointer-events-none">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 animate-pulse">Waiting for telemetry...</p>
                    </div>
                )}

                {markers.map((m) => (
                    <Marker
                        key={m.id}
                        longitude={m.lng}
                        latitude={m.lat}
                        anchor={m.type === 'courier' ? "center" : "bottom"}
                    >
                        <Pin type={m.type} active={m.active} heading={m.heading} status={m.status} />
                    </Marker>
                ))}
            </Map>

            {/* Glass Overlay for Map Info - Only show if tracking active */}
            {markers.some(m => m.type === 'courier') && (
                <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-heavy p-4 rounded-[2rem] flex items-center justify-between border border-white/10"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center shrink-0">
                                <Bike className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-0.5">Live Telemetry</p>
                                <p className="text-sm font-black">Courier en route to destination</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
