"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Zap, Shield, MapPin, Search, Loader2 } from "lucide-react";
import { Button, Logo } from "@/components/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Footer } from "@/components/layout/footer";
import { geocodingService, GeocodeResult } from "@/core/services/geocoding-service";

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
  const searchRef = useRef<HTMLDivElement>(null);

  // ── Address Autocomplete Logic ──────────────────────
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (query.length > 2) {
        setLoading(true);
        const data = await geocodingService.search(query);
        setResults(data);
        setLoading(false);
        setShowDropdown(true);
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
      <header className="fixed top-0 left-0 right-0 z-50 glass-heavy">
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
      </header>

      {/* ── Hero ───────────────────────────────────── */}
      <motion.section
        className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-24 pb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
            <span className="text-sm text-muted-foreground">
              Now accepting deliveries
            </span>
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl leading-[1.1]"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
        >
          Delivery, redefined
          <span className="block text-muted-foreground mt-2">
            with precision & care.
          </span>
        </motion.h1>

        <motion.p
          className="mt-6 text-lg text-muted-foreground max-w-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
        >
          Premium logistics for people who value their time.
          Real-time tracking, instant dispatch, seamless experience.
        </motion.p>

        {/* ── Search Experience ───────────────────────── */}
        <motion.div
          ref={searchRef}
          className="mt-10 w-full max-w-md relative z-40"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              {loading ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <MapPin className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              )}
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your delivery address..."
              className="
                w-full h-16 pl-12 pr-32
                glass rounded-[var(--radius-squircle)] 
                text-sm sm:text-base text-foreground placeholder:text-muted-foreground
                outline-none shadow-[var(--shadow-md)]
                transition-all duration-500
                focus:shadow-[0_0_0_2px_hsl(var(--primary)/0.2),0_20px_40px_-10px_rgba(0,0,0,0.1)]
                focus:scale-[1.02]
              "
            />
            <div className="absolute right-2 top-2 bottom-2">
              <Button
                onClick={() => query.length > 0 && setShowDropdown(true)}
                className="h-full rounded-[var(--radius-squircle)] px-6 gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95"
              >
                <span className="hidden sm:inline">Browse</span>
                <Search className="h-4 w-4" />
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
                className="absolute top-full left-0 right-0 mt-3 glass-heavy rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] border border-white/10 overflow-hidden"
              >
                {results.map((res) => (
                  <button
                    key={res.id}
                    onClick={() => handleSelect(res)}
                    className="w-full text-left px-5 py-3 hover:bg-primary/5 transition-colors flex flex-col gap-0.5"
                  >
                    <span className="text-sm font-semibold text-foreground">{res.text}</span>
                    <span className="text-[11px] text-muted-foreground truncate">{res.place_name}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <p className="mt-4 text-[11px] text-muted-foreground/60 font-medium uppercase tracking-[0.2em]">
            No account required to browse
          </p>
        </motion.div>
      </motion.section>

      {/* ── Features ───────────────────────────────── */}
      <motion.section
        className="max-w-4xl mx-auto px-4 sm:px-6 pb-24"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={item}
              className="glass rounded-[var(--radius-lg)] p-6 space-y-3"
            >
              <div className="h-10 w-10 rounded-[var(--radius-md)] bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
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
