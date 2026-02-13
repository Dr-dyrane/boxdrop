"use client";

import { useScrollDirection } from "@/core/hooks/use-scroll-direction";
import { motion } from "framer-motion";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Button, Logo } from "@/components/ui";

// Modular Components
import { Hero } from "@/components/landing/hero";
import { TransitTerminal } from "@/components/landing/transit-terminal";
import { PartnerMarquee } from "@/components/landing/partner-marquee";
import { BlackMembership } from "@/components/landing/black-membership";
import { CategoryGrid } from "@/components/landing/category-grid";
import { FeatureList } from "@/components/landing/feature-list";

export default function LandingPage() {
  const { direction, isScrolled } = useScrollDirection(10);
  const isHidden = direction === "down" && isScrolled;

  return (
    <div className="min-h-[100dvh] flex flex-col selection:bg-primary selection:text-white">
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
            <span className="font-semibold text-lg tracking-tight">BoxDrop</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm">Browse Vendors</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* ── Main Flow ──────────────────────────────── */}
      <main className="flex-1 overflow-x-hidden">
        {/* 1. Hero & Discovery */}
        <Hero />

        {/* 2. System Evidence (Live Tracking) */}
        <TransitTerminal />

        {/* 3. Social Proof (Partner Marquee) */}
        <PartnerMarquee />

        {/* 4. Elite Access (Membership) */}
        <BlackMembership />

        {/* 5. Depth (Category Selection) */}
        <CategoryGrid />

        {/* 6. Values (Feature List) */}
        <FeatureList />
      </main>

      {/* ── Footer ─────────────────────────────────── */}
      <Footer />
    </div>
  );
}
