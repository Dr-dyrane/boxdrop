"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Shield, MapPin, Search } from "lucide-react";
import { Button, Logo } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { geocodingService, type GeocodeResult } from "@/core/services";
import { useScrollDirection } from "@/core/hooks/use-scroll-direction";

/* ─────────────────────────────────────────────────────
   LANDING PAGE
   The first impression. Premium. Minimal. Confident.
   One dominant action: Geolocation-based browsing.
   ───────────────────────────────────────────────────── */

const features = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description: "Real-time tracking from pickup to doorstep.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    description: "Your packages are insured and monitored.",
  },
  {
    icon: MapPin,
    title: "Live Tracking",
    description: "Know exactly where your order is, always.",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
} as const;

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const { direction, isScrolled } = useScrollDirection(10);
  const isHidden = direction === "down" && isScrolled;

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
    <div className="min-h-[100dvh] flex flex-col">
      {/* ── Header ─────────────────────────────────── */}
      <motion.header
        initial={{ y: 0 }}
        animate={{ y: isHidden ? -120 : 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 40 }}
        className="fixed top-0 left-0 right-0 z-50 glass-heavy h-[calc(4rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)]"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6" />
            <span className="font-semibold text-lg tracking-tight">
              BoxDrop
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log In
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">
                Browse Vendors
              </Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Hero ───────────────────────────────────── */}
      <motion.section
        className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-16 relative overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Decorations */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-success/5 rounded-full blur-[150px] animate-pulse delay-1000" />
        </div>

        {/* ── Live Network Pulse ─────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
          className="mb-10 px-4 sm:px-6 py-2 glass-heavy rounded-full border border-primary/10 shadow-2xl shadow-primary/5 flex items-center gap-3 sm:gap-6 group hover:scale-[1.02] transition-transform cursor-default"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
              {new Date().getHours() > 8 && new Date().getHours() < 22 ? "Network Optimal" : "Off-Peak Hours"}
            </span>
          </div>

          <div className="h-4 w-px bg-foreground/10 hidden sm:block" />

          <div className="hidden sm:flex items-center gap-4">
            <div className="flex flex-col items-start">
              <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60 leading-none mb-1">Active Couriers</span>
              <span className="text-xs font-black tabular-nums leading-none">16 Units</span>
            </div>
            <div className="flex flex-col items-start border-l border-foreground/5 pl-4">
              <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60 leading-none mb-1">Efficiency</span>
              <span className="text-xs font-black tabular-nums leading-none">99.4%</span>
            </div>
          </div>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter max-w-4xl leading-[0.9] text-foreground mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
        >
          Precision <br />
          <span className="text-muted-foreground/20 italic font-medium">Logistics.</span>
        </motion.h1>

        <motion.p
          className="text-base sm:text-lg md:text-xl text-muted-foreground/60 max-w-xl font-medium tracking-tight mb-12 px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
        >
          Premium delivery redefined for absolute efficiency.
          Real-time tracking, zero friction, instant fulfillment.
        </motion.p>

        {/* ── Search Experience ───────────────────────── */}
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
      </motion.section>

      {/* ── Immersive Categories ────────────────────── */}
      <motion.section
        className="max-w-6xl mx-auto px-6 pb-24 sm:pb-32"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <div className="space-y-8 sm:space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter">Everything, Delivered.</h2>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-50">Discovery Hub</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {[
              { name: "Restaurant", icon: "🍳" },
              { name: "Groceries", icon: "🍎" },
              { name: "Pharmacy", icon: "💊" },
              { name: "Retail", icon: "🛍️" },
              { name: "Coffee", icon: "☕" },
            ].map((cat, i) => (
              <motion.div
                key={cat.name}
                whileHover={{ y: -8 }}
                className="group cursor-pointer"
                onClick={() => router.push(`/dashboard/search?category=${cat.name}`)}
              >
                <div className={`h-40 sm:h-48 rounded-[2rem] sm:rounded-[3rem] glass-heavy border border-foreground/5 flex flex-col items-center justify-center gap-4 sm:gap-6 group-hover:bg-primary transition-all duration-500 shadow-xl shadow-black/5 ${i % 2 === 0 ? "md:translate-y-6" : ""
                  }`}>
                  <span className="text-4xl sm:text-5xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">{cat.icon}</span>
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">{cat.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── Features ───────────────────────────────── */}
      <motion.section
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-24"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="p-6 sm:p-8 space-y-3 sm:space-y-4 text-center glass-heavy sm:glass-none rounded-[2rem] sm:rounded-none border border-foreground/5 sm:border-none"
            >
              <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
              </div>
              <h3 className="font-black text-base sm:text-lg tracking-tight">{feature.title}</h3>
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wider opacity-60">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── Footer ─────────────────────────────────── */}
      <Footer />
    </div>
  );
}
