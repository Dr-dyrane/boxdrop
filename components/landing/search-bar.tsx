"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ArrowRight, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui";
import { useState, useEffect, useRef } from "react";
import { geocodingService, type GeocodeResult } from "@/core/services";
import { useRouter } from "next/navigation";

export function SearchBar() {
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GeocodeResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // ── Address Autocomplete Logic ──────────────────────
    useEffect(() => {
        const handler = setTimeout(async () => {
            if (query.length > 2) {
                setLoading(true);
                try {
                    const data = await geocodingService.search(query);
                    setResults(data);
                    setShowDropdown(true);
                } catch (err) {
                    console.error("Geocoding failed:", err);
                    setResults([]);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
                setShowDropdown(false);
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (res: GeocodeResult) => {
        const [lng, lat] = res.center;
        router.push(`/dashboard?lat=${lat}&lng=${lng}&address=${encodeURIComponent(res.text)}`);
    };

    return (
        <motion.div
            ref={searchRef}
            className="w-full max-w-2xl relative z-40 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        >
            <div className="relative group">
                <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    {loading ? (
                        <div className="h-5 w-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    ) : (
                        <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder="Delivery address..."
                    className="
                        w-full h-16 sm:h-20 pl-14 sm:pl-16 pr-20 sm:pr-44
                        glass shadow-2xl rounded-[2rem] sm:rounded-[2.5rem] 
                        text-base sm:text-lg font-bold text-foreground placeholder:text-muted-foreground/40
                        outline-none transition-all duration-700
                        focus:bg-white/5 focus:ring-4 focus:ring-primary/5
                        focus:scale-[1.01]
                    "
                />
                <div className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:bottom-3">
                    <Button
                        onClick={() => query.length > 0 && setShowDropdown(true)}
                        className={`h-full rounded-[1.5rem] sm:rounded-[2rem] transition-all duration-500 bg-foreground text-background hover:bg-foreground/90 active:scale-95 font-black uppercase tracking-widest text-[10px] sm:text-xs ${isFocused ? "px-5 sm:px-10" : "px-6 sm:px-10"
                            }`}
                    >
                        <span className={`hidden sm:inline transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-100'}`}>Browse Near Me</span>
                        <span className={`sm:hidden transition-all duration-300 ${isFocused ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>Browse</span>
                        <ArrowRight className={`h-4 w-4 transition-transform duration-500 ${isFocused ? 'rotate-90 sm:rotate-0' : ''}`} />
                    </Button>
                </div>
            </div>

            {/* ── Autocomplete Results ─────────────────── */}
            <AnimatePresence>
                {showDropdown && results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 sm:left-4 sm:right-4 mt-2 sm:mt-4 glass-heavy rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl p-2 sm:p-4 border border-foreground/5 z-50"
                    >
                        {results.map((res) => (
                            <button
                                key={res.id}
                                onClick={() => handleSelect(res)}
                                className="w-full text-left px-4 sm:px-5 py-4 sm:py-5 hover:bg-primary/5 rounded-[1.5rem] sm:rounded-[2rem] transition-all flex items-center gap-4 sm:gap-5 group/item"
                            >
                                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover/item:bg-primary group-hover/item:text-white transition-colors">
                                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                                </div>
                                <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                    <span className="text-xs sm:text-sm font-black text-foreground line-clamp-1">{res.text}</span>
                                    <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium truncate uppercase tracking-widest leading-none">{res.place_name}</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all" />
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-8 px-4 opacity-40">
                <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">End-to-End Insurance</span>
                </div>
                <div className="hidden sm:block h-1 w-1 rounded-full bg-foreground" />
                <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Instant Dispatch</span>
                </div>
            </div>
        </motion.div>
    );
}
