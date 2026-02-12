"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, Search, ShoppingBag, User } from "lucide-react";

/* ─────────────────────────────────────────────────────
   MAIN (TABS) LAYOUT
   Glassmorphism bottom tab bar.
   ───────────────────────────────────────────────────── */

const tabs = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/search", label: "Search", icon: Search },
    { href: "/dashboard/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div className="min-h-[100dvh] pb-20">
            {/* Page content */}
            {children}

            {/* ── Glassmorphism Tab Bar ────────────────── */}
            <nav className="fixed bottom-0 left-0 right-0 z-50">
                <div className="glass-heavy shadow-[var(--shadow-xl)]">
                    {/* Safe area padding for notched devices */}
                    <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
                        {tabs.map((tab) => {
                            const isActive =
                                pathname === tab.href ||
                                (tab.href !== "/dashboard" &&
                                    pathname.startsWith(tab.href));

                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className="relative flex flex-col items-center justify-center w-16 h-full gap-0.5"
                                >
                                    <div className="relative">
                                        <tab.icon
                                            className={`h-5 w-5 transition-colors duration-200 ${isActive
                                                    ? "text-foreground"
                                                    : "text-muted-foreground"
                                                }`}
                                        />
                                        {isActive && (
                                            <motion.div
                                                layoutId="tab-indicator"
                                                className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-foreground"
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 500,
                                                    damping: 35,
                                                }}
                                            />
                                        )}
                                    </div>
                                    <span
                                        className={`text-[10px] font-medium transition-colors duration-200 ${isActive
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                            }`}
                                    >
                                        {tab.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                    {/* Bottom safe area spacer */}
                    <div className="h-[env(safe-area-inset-bottom)]" />
                </div>
            </nav>
        </div>
    );
}
