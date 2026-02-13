"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const overlay = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
    exit: { opacity: 0 }
};

const modal = {
    hidden: { scale: 0.95, opacity: 0, y: 20 },
    show: { scale: 1, opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { scale: 0.95, opacity: 0, y: 20 }
} as const;

// Simulated geocoding results
const PRESETS = [
    { label: "Current Location", address: "Using GPS...", lat: "gps", lng: "gps" },
    { label: "Home", address: "123 Marina, Lagos", lat: 6.4541, lng: 3.3947 },
    { label: "Work", address: "Victoria Island, Lagos", lat: 6.4281, lng: 3.4219 },
    { label: "Ikeja City Mall", address: "Obafemi Awolowo Way, Ikeja", lat: 6.6018, lng: 3.3515 },
    { label: "Lekki Phase 1", address: "Admiralty Way, Lekki", lat: 6.4474, lng: 3.4723 },
    { label: "Yaba Tech", address: "Herbert Macaulay Way, Yaba", lat: 6.5167, lng: 3.3725 },
];

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("");

    const handleUseCurrentLocation = async () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }

        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    // Reverse Geocode via Mapbox
                    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
                    if (!token) throw new Error("Missing Mapbox Token");

                    const res = await fetch(
                        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}`
                    );
                    const data = await res.json();

                    const address = data.features?.[0]?.place_name || "Unknown Location";

                    const params = new URLSearchParams(searchParams.toString());
                    params.set("lat", latitude.toString());
                    params.set("lng", longitude.toString());
                    params.set("address", address);

                    router.push(`/dashboard?${params.toString()}`);
                    onClose();
                } catch (error) {
                    console.error("Geocoding failed:", error);
                    // Fallback to coordinates only if geocoding fails
                    const params = new URLSearchParams(searchParams.toString());
                    params.set("lat", latitude.toString());
                    params.set("lng", longitude.toString());
                    params.set("address", `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    router.push(`/dashboard?${params.toString()}`);
                    onClose();
                } finally {
                    setIsLoading(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                alert("Unable to retrieve your location. Please check your permissions.");
                setIsLoading(false);
            }
        );
    };

    const handleSelect = (lat: number | string, lng: number | string, address: string) => {
        if (lat === "gps") {
            handleUseCurrentLocation();
        } else {
            const params = new URLSearchParams(searchParams.toString());
            params.set("lat", lat.toString());
            params.set("lng", lng.toString());
            params.set("address", address);
            router.push(`/dashboard?${params.toString()}`);
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6">
                    <motion.div
                        variants={overlay}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="absolute inset-0 bg-background/20 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        variants={modal}
                        initial="hidden"
                        animate="show"
                        exit="exit"
                        className="relative w-full max-w-lg glass-heavy border border-foreground/5 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-10"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="space-y-6">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter text-foreground">Set Location.</h2>
                                <p className="text-sm text-muted-foreground font-medium">Where should we deliver to?</p>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search street, city, or district..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-muted/30 border border-transparent focus:border-primary/10 focus:bg-background rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/5 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Button
                                    onClick={handleUseCurrentLocation}
                                    disabled={isLoading}
                                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-3"
                                >
                                    {isLoading ? (
                                        <div className="h-4 w-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                    ) : (
                                        <Navigation className="h-4 w-4" />
                                    )}
                                    {isLoading ? "Locating..." : "Use Current Location"}
                                </Button>

                                <div className="flex items-center gap-2 mb-2 pt-4">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Nearby & Recent</span>
                                </div>

                                {PRESETS.filter(p => (p.label.toLowerCase().includes(query.toLowerCase()) || p.address.toLowerCase().includes(query.toLowerCase())) && p.lat !== "gps").map((place, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelect(place.lat, place.lng, `${place.label}, ${place.address}`)}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group text-left"
                                    >
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold text-sm truncate text-foreground">{place.label}</p>
                                            <p className="text-xs text-muted-foreground truncate">{place.address}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
