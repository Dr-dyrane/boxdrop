"use client";

import { useState, useCallback, useMemo } from 'react';
import Map, { Marker, Source, Layer, NavigationControl } from 'react-map-gl/mapbox';
import { cn } from '@/core/utils';
import { useThemeStore } from '@/core/store';

/* ─────────────────────────────────────────────────────
   MAP VIEW COMPONENT
   Beautiful, high-contrast, minimal map (Uber style).
   Standardizes on Mapbox for logistics precision.
   ───────────────────────────────────────────────────── */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface MapViewProps {
    center?: { lat: number; lng: number };
    zoom?: number;
    markers?: Array<{
        id: string;
        lat: number;
        lng: number;
        label?: string;
    }>;
    route?: [number, number][]; // [longitude, latitude] array
    className?: string;
    interactive?: boolean;
}

export function MapView({
    center = { lat: 6.4549, lng: 3.4246 }, // Default Lagos
    zoom = 15, // Street level
    markers = [],
    route,
    className,
    interactive = true
}: MapViewProps) {
    const { theme } = useThemeStore();

    // Theme-sensitive grayscale style
    const mapStyle = useMemo(() => {
        return theme === "light"
            ? "mapbox://styles/mapbox/light-v11"
            : "mapbox://styles/mapbox/dark-v11";
    }, [theme]);

    const [viewState, setViewState] = useState({
        latitude: center.lat,
        longitude: center.lng,
        zoom: zoom
    });

    const routeData = useMemo(() => {
        if (!route || route.length === 0) return null;
        return {
            type: 'Feature' as const,
            properties: {},
            geometry: {
                type: 'LineString' as const,
                coordinates: route
            }
        };
    }, [route]);

    return (
        <div className={cn("relative w-full h-full rounded-[var(--radius-lg)] overflow-hidden glass shadow-[var(--shadow-xl)]", className)}>
            <Map
                {...viewState}
                onMove={(evt: any) => setViewState(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                mapStyle={mapStyle}
                mapboxAccessToken={MAPBOX_TOKEN}
                reuseMaps
                scrollZoom={interactive}
                dragPan={interactive}
            >
                {/* ── Route Polyline ─────────────────────── */}
                {routeData && (
                    <Source id="route-source" type="geojson" data={routeData}>
                        <Layer
                            id="route-layer"
                            type="line"
                            layout={{
                                'line-join': 'round',
                                'line-cap': 'round'
                            }}
                            paint={{
                                'line-color': '#FFFFFF', // Pure white route for high contrast
                                'line-width': 4,
                                'line-opacity': 0.8
                            }}
                        />
                    </Source>
                )}

                {/* ── Markers ────────────────────────────── */}
                {markers.map(marker => (
                    <Marker
                        key={marker.id}
                        latitude={marker.lat}
                        longitude={marker.lng}
                        anchor="bottom"
                    >
                        <div className="relative group">
                            <div className="h-6 w-6 bg-primary rounded-full border-2 border-background shadow-lg scale-75 group-hover:scale-100 transition-transform duration-300" />
                            {marker.label && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 glass rounded-md text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    {marker.label}
                                </div>
                            )}
                        </div>
                    </Marker>
                ))}

                <div className="absolute top-4 right-4">
                    <NavigationControl showCompass={false} />
                </div>
            </Map>
        </div>
    );
}
