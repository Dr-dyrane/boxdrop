"use client";

import { useState, useEffect } from "react";

interface Location {
    lat: number;
    lng: number;
}

interface UseLocationReturn {
    location: Location | null;
    error: string | null;
    loading: boolean;
}

export function useLocation(): UseLocationReturn {
    const [location, setLocation] = useState<Location | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        const success = (position: GeolocationPosition) => {
            setLocation({
                lat: position.coords.latitude,
                lng: position.coords.longitude
            });
            setLoading(false);
        };

        const error = (err: GeolocationPositionError) => {
            setError(err.message);
            setLoading(false);
        };

        // Get initial position quickly
        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });

        // Watch for updates
        const watchId = navigator.geolocation.watchPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        });

        return () => navigator.geolocation.clearWatch(watchId);
    }, []);

    return { location, error, loading };
}
