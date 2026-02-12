"use client";

import { useEffect, useState, useMemo, useRef } from 'react';
import { Source, Layer, Marker, useMap } from 'react-map-gl/mapbox';
import type { Feature, LineString } from 'geojson';
import mapboxgl from 'mapbox-gl';

/* ─────────────────────────────────────────────────────
   MAPBOX ROUTE COMPONENT
   Fetches and renders a floating driving route.
   Used for live order tracking.
   ───────────────────────────────────────────────────── */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

interface MapboxRouteProps {
    origin: [number, number];       // [lng, lat]
    destination: [number, number];  // [lng, lat]
    active?: boolean;
}

/**
 * Helper to fetch driving route from Mapbox Directions API
 */
export async function getRoute(start: [number, number], end: [number, number]): Promise<LineString | null> {
    try {
        const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${MAPBOX_TOKEN}`;
        const response = await fetch(url);
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) return null;
        return data.routes[0].geometry;
    } catch (error) {
        console.error("Failed to fetch Mapbox route:", error);
        return null;
    }
}

export function MapboxRoute({ origin, destination, active = true }: MapboxRouteProps) {
    const { current: map } = useMap();
    const [geometry, setGeometry] = useState<LineString | null>(null);

    // ── Fetch Geometry ───────────────────────────────
    useEffect(() => {
        if (!active) return;

        let isMounted = true;
        getRoute(origin, destination).then(geo => {
            if (isMounted && geo) {
                setGeometry(geo);
            }
        });

        return () => { isMounted = false };
    }, [origin, destination, active]);

    // ── Auto-Fit Map Bounds ──────────────────────────
    useEffect(() => {
        if (!map || !geometry) return;

        const bounds = new mapboxgl.LngLatBounds();
        geometry.coordinates.forEach((coord: any) => {
            bounds.extend(coord as [number, number]);
        });

        map.fitBounds(bounds, {
            padding: { top: 60, bottom: 60, left: 60, right: 60 },
            duration: 1000
        });
    }, [map, geometry]);

    const geojsonData: Feature<LineString> = useMemo(() => ({
        type: 'Feature',
        properties: {},
        geometry: geometry || { type: 'LineString', coordinates: [] }
    }), [geometry]);

    if (!geometry) return null;

    return (
        <>
            <Source id="route-source" type="geojson" data={geojsonData}>
                {/* ── Shadow Layer (Depth) ──────────────── */}
                <Layer
                    id="route-shadow"
                    type="line"
                    paint={{
                        'line-color': '#000000',
                        'line-opacity': 0.15,
                        'line-width': 10,
                        'line-blur': 5
                    }}
                    layout={{
                        'line-join': 'round',
                        'line-cap': 'round'
                    }}
                />
                {/* ── Main Route Layer ──────────────────── */}
                <Layer
                    id="route-line"
                    type="line"
                    paint={{
                        'line-color': '#4F46E5', // Electric Indigo
                        'line-width': 4,
                        'line-opacity': 0.9
                    }}
                    layout={{
                        'line-join': 'round',
                        'line-cap': 'round'
                    }}
                />
            </Source>

            {/* ── Origin Marker (Vendor) ─────────────── */}
            <Marker longitude={origin[0]} latitude={origin[1]} anchor="center">
                <div className="h-4 w-4 bg-foreground rounded-full border-2 border-background shadow-lg" />
            </Marker>

            {/* ── Destination Marker (User) ──────────── */}
            <Marker longitude={destination[0]} latitude={destination[1]} anchor="center">
                <div className="relative flex h-5 w-5 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                    <div className="h-3 w-3 bg-primary rounded-full border-2 border-background shadow-lg shadow-primary/20" />
                </div>
            </Marker>
        </>
    );
}
