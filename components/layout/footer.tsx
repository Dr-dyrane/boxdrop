"use client";

import { ThemeToggle, Logo } from "@/components/ui";

/* ─────────────────────────────────────────────────────
   FOOTER
   Minimalist footer for common pages.
   Includes copyright and the theme toggle.
   Follows "No UI Clutter" rule.
   ───────────────────────────────────────────────────── */

export function Footer() {
    return (
        <footer className="mt-12 py-12 shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.05)] flex flex-col sm:flex-row items-center justify-between gap-6 px-2">
            <div className="flex items-center gap-2 opacity-30 grayscale saturate-0">
                <Logo className="h-4" />
                <span className="text-xs font-semibold tracking-tighter uppercase">BoxDrop</span>
            </div>

            <div className="flex items-center gap-6">
                <p className="text-[10px] text-muted-foreground/40 uppercase tracking-[0.2em] font-medium order-2 sm:order-1">
                    © {new Date().getFullYear()} Precision & Care
                </p>
                <div className="h-4 w-px bg-primary/5 hidden sm:block order-2" />
                <ThemeToggle />
            </div>
        </footer>
    );
}
