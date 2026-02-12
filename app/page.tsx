"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, MapPin } from "lucide-react";
import { Button, Logo } from "@/components/ui";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";

/* ─────────────────────────────────────────────────────
   LANDING PAGE
   The first impression. Premium. Minimal. Confident.
   One dominant action: Get Started.
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

        <motion.div
          className="mt-10 w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] as const }}
        >
          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
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
            <Link href="/dashboard" className="absolute right-2 top-2 bottom-2">
              <Button className="h-full rounded-[var(--radius-squircle)] px-6 gap-2 bg-foreground text-background hover:bg-foreground/90 transition-all active:scale-95">
                <span className="hidden sm:inline">Browse Nearby</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
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
