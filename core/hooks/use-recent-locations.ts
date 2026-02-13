"use client";

import { useState, useEffect } from "react";

export interface RecentLocation {
    label: string;
    address: string;
    lat: number;
    lng: number;
    timestamp: number;
}

const STORAGE_KEY = "boxdrop-recent-locations";
const MAX_RECENTS = 5;

export function useRecentLocations() {
    const [recents, setRecents] = useState<RecentLocation[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                setRecents(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse recent locations", e);
            }
        }
    }, []);

    const addRecentLocation = (location: Omit<RecentLocation, "timestamp">) => {
        setRecents((prev) => {
            const newLocation = { ...location, timestamp: Date.now() };
            // Filter out duplicates based on lat/lng or address
            const filtered = prev.filter(
                (item) =>
                    item.address !== location.address &&
                    (Math.abs(item.lat - location.lat) > 0.0001 || Math.abs(item.lng - location.lng) > 0.0001)
            );
            const updated = [newLocation, ...filtered].slice(0, MAX_RECENTS);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearRecentLocations = () => {
        setRecents([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    return { recents, addRecentLocation, clearRecentLocations };
}
