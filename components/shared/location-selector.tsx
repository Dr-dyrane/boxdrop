"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X, History, Star, Plus, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { geocodingService, type GeocodeResult } from "@/core/services/geocoding-service";
import { useRecentLocations, useAddresses, useAuth } from "@/core/hooks"; // Ensure this export exists in index.ts

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

export function LocationModal({ isOpen, onClose }: LocationModalProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GeocodeResult[]>([]);

    // ── Data Hooks ─────────────────────────────────────
    const { recents, addRecentLocation } = useRecentLocations();
    const { addresses, addAddress, isAdding } = useAddresses(user?.id);

    // ── Save State ─────────────────────────────────────
    const [savingPlace, setSavingPlace] = useState<GeocodeResult | null>(null);
    const [saveLabel, setSaveLabel] = useState("");

    // Debounced Search Effect
    useEffect(() => {
        if (!query || query.length < 3) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            const hits = await geocodingService.search(query);
            setResults(hits);
            setIsSearching(false);
        }, 500);

        return () => clearTimeout(timer);
    }, [query]);

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
                    // Reverse Geocode via Mapbox Service
                    const address = await geocodingService.reverse(longitude, latitude) || "Unknown Location";

                    const params = new URLSearchParams(searchParams.toString());
                    params.set("lat", latitude.toString());
                    params.set("lng", longitude.toString());
                    params.set("address", address);

                    // Add to recent history
                    addRecentLocation({
                        label: "Current Location",
                        address: address,
                        lat: latitude,
                        lng: longitude
                    });

                    router.push(`/dashboard?${params.toString()}`);
                    onClose();
                } catch (error) {
                    console.error("Geocoding failed:", error);
                    // Fallback to coordinates
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

    const handleSelect = (lat: number, lng: number, address: string, label: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("lat", lat.toString());
        params.set("lng", lng.toString());
        params.set("address", address);

        // Persist selection
        addRecentLocation({
            label: label,
            address: address,
            lat: lat,
            lng: lng
        });

        router.push(`/dashboard?${params.toString()}`);
        onClose();
    };

    const handleSaveAddress = async () => {
        if (!savingPlace || !saveLabel || !user) return;

        try {
            await addAddress({
                user_id: user.id,
                label: saveLabel,
                address: savingPlace.place_name,
                lat: savingPlace.center[1],
                lng: savingPlace.center[0],
                is_default: addresses.length === 0 // Default if it's the first one
            });
            setSavingPlace(null);
            setSaveLabel("");
        } catch (e) {
            console.error("Failed to save address", e);
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
                        className="relative w-full max-w-lg glass-heavy border border-foreground/5 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-muted transition-colors z-10"
                        >
                            <X className="h-5 w-5 text-muted-foreground" />
                        </button>

                        <div className="space-y-6 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter text-foreground">Set Location.</h2>
                                <p className="text-sm text-muted-foreground font-medium">Where should we deliver to?</p>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search specific address, landmark, or city..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full h-14 pl-12 pr-4 bg-muted/30 border border-transparent focus:border-primary/10 focus:bg-background rounded-2xl text-sm font-bold focus:ring-2 focus:ring-primary/5 transition-all outline-none text-foreground placeholder:text-muted-foreground/50"
                                    autoFocus
                                />
                                {isSearching && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                )}
                            </div>

                            {!savingPlace && (
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
                                </div>
                            )}
                        </div>

                        {/* Save Place UI Overlay */}
                        <AnimatePresence>
                            {savingPlace && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden space-y-4 pt-4 border-t border-foreground/5 mt-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Save as New Place</h4>
                                        <button onClick={() => setSavingPlace(null)} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Label (e.g., Home, Work, Gym)"
                                            value={saveLabel}
                                            onChange={(e) => setSaveLabel(e.target.value)}
                                            className="flex-1 h-12 px-4 bg-white/5 rounded-xl text-xs font-bold outline-none border border-transparent focus:border-primary/20"
                                            autoFocus
                                        />
                                        <Button
                                            onClick={handleSaveAddress}
                                            disabled={isAdding || !saveLabel}
                                            className="h-12 w-12 rounded-xl p-0"
                                        >
                                            {isAdding ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-muted-foreground font-medium px-1 truncate opacity-70">Saving: {savingPlace.place_name}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex-1 overflow-y-auto min-h-0 mt-6 -mx-2 px-2 space-y-6 scrollbar-none pb-10">
                            {/* 1. Show Search Results if Query Exists */}
                            {query.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 mb-2 px-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Discovery Results</span>
                                    </div>
                                    {results.length > 0 ? (
                                        results.map((place) => (
                                            <div key={place.id} className="relative group/item">
                                                <button
                                                    onClick={() => handleSelect(place.center[1], place.center[0], place.place_name, place.text)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors text-left"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                        <MapPin className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-bold text-sm truncate text-foreground">{place.text}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{place.place_name}</p>
                                                    </div>
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSavingPlace(place);
                                                        setSaveLabel(place.text);
                                                    }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg glass group-hover/item:opacity-100 opacity-0 transition-opacity flex items-center justify-center text-primary"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        !isSearching && query.length > 2 && (
                                            <div className="text-center py-8 text-muted-foreground text-sm">No results found for "{query}"</div>
                                        )
                                    )}
                                </div>
                            ) : (
                                <>
                                    {/* 2. Show Saved Addresses from Backend */}
                                    {addresses.length > 0 && (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 mb-2 px-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">Saved Places</span>
                                            </div>
                                            {addresses.map((place) => (
                                                <button
                                                    key={place.id}
                                                    onClick={() => handleSelect(place.lat, place.lng, place.address, place.label)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 transition-colors group text-left border border-transparent hover:border-primary/10"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                                                        <Star className="h-4 w-4 fill-primary/20" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-black text-xs uppercase tracking-widest text-primary mb-0.5">{place.label}</p>
                                                        <p className="text-xs text-foreground font-bold truncate leading-none">{place.address.split(',')[0]}</p>
                                                        <p className="text-[10px] text-muted-foreground truncate mt-1">{place.address.split(',').slice(1).join(',').trim()}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* 3. Show Recent History (Local) */}
                                    {recents.length > 0 && (
                                        <div className="space-y-1 pt-2">
                                            <div className="flex items-center gap-2 mb-2 px-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Recent History</span>
                                            </div>
                                            {recents.map((place, i) => (
                                                <button
                                                    key={i + place.address}
                                                    onClick={() => handleSelect(place.lat, place.lng, place.address, place.label)}
                                                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 transition-colors group text-left"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                        <History className="h-4 w-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1 text-muted-foreground group-hover:text-foreground">
                                                        <p className="font-bold text-sm truncate">{place.label}</p>
                                                        <p className="text-xs truncate opacity-60">{place.address}</p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
