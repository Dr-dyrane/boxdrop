"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Compass, ShoppingBag, Package, Search, User } from "lucide-react";
import { useScrollDirection } from "@/core/hooks/use-scroll-direction";
import { useAuth } from "@/core/hooks";
import { useCartStore } from "@/core/store";

/* ─────────────────────────────────────────────────────
   MAIN LAYOUT — Apple Store-Inspired Adaptive Nav
   
   Mobile:   Floating bottom pill (scroll-aware)
             + top header with avatar & search
   Tablet:   Left icon rail (72px)
   Desktop:  Left sidebar (240px) with labels
   ───────────────────────────────────────────────────── */

const tabs = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/search", label: "Explore", icon: Compass },
    { href: "/dashboard/orders", label: "Orders", icon: Package },
    { href: "/dashboard/cart", label: "Bag", icon: ShoppingBag },
];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { direction, isScrolled } = useScrollDirection(48);
    const { profile, user } = useAuth();
    const cartCount = useCartStore((s) => s.items.length);

    const isCollapsed = direction === "down" && isScrolled;

    // Active tab check
    const isActive = (href: string) =>
        pathname === href ||
        (href !== "/dashboard" && pathname.startsWith(href));

    // Profile display
    const avatarUrl = profile?.avatar_url;
    const initials = (profile?.full_name || user?.email || "U")[0].toUpperCase();

    return (
        <div className="min-h-[100dvh]">
            {/* ── Mobile Header ──────────────────────────── */}
            <header className="md:hidden sticky top-0 z-40 glass-heavy">
                <div className="flex items-center justify-between h-12 px-4">
                    {/* Left: Page context */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <span className="text-sm font-bold tracking-tight">BoxDrop</span>
                    </Link>

                    {/* Right: Search & Avatar */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push("/dashboard/search")}
                            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent transition-colors"
                            aria-label="Search"
                        >
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </button>
                        <button
                            onClick={() => router.push("/dashboard/profile")}
                            className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0"
                            aria-label="Profile"
                        >
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-xs font-bold text-muted-foreground">
                                    {initials}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Tablet Side Rail (md only) ────────────── */}
            <aside className="hidden md:flex lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[72px] flex-col items-center py-6 gap-2 glass-heavy shadow-[var(--shadow-lg)]">
                <Link
                    href="/dashboard"
                    className="h-10 w-10 flex items-center justify-center mb-4"
                    aria-label="BoxDrop Home"
                >
                    <span className="text-lg font-black tracking-tighter">B</span>
                </Link>

                <nav className="flex-1 flex flex-col items-center gap-1">
                    {tabs.map((tab) => {
                        const active = isActive(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`
                                    relative h-11 w-11 flex items-center justify-center rounded-[var(--radius-md)]
                                    transition-colors duration-200
                                    ${active
                                        ? "bg-primary/10 text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    }
                                `}
                                aria-label={tab.label}
                            >
                                <tab.icon className="h-5 w-5" />
                                {tab.label === "Bag" && cartCount > 0 && (
                                    <span className="absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: Profile */}
                <button
                    onClick={() => router.push("/dashboard/profile")}
                    className="h-10 w-10 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center mt-auto"
                    aria-label="Profile"
                >
                    {avatarUrl ? (
                        <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-muted-foreground">{initials}</span>
                    )}
                </button>
            </aside>

            {/* ── Desktop Sidebar (lg+) ─────────────────── */}
            <aside className="hidden lg:flex fixed top-0 left-0 bottom-0 z-50 w-60 flex-col py-6 px-3 gap-1 glass-heavy shadow-[var(--shadow-lg)]">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 h-10 mb-4"
                >
                    <span className="text-base font-black tracking-tight">BoxDrop</span>
                </Link>

                <nav className="flex-1 flex flex-col gap-0.5">
                    {tabs.map((tab) => {
                        const active = isActive(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`
                                    relative flex items-center gap-3 px-3 h-11 rounded-[var(--radius-md)]
                                    text-sm font-medium transition-colors duration-200
                                    ${active
                                        ? "bg-primary/10 text-foreground"
                                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    }
                                `}
                            >
                                <tab.icon className="h-5 w-5 shrink-0" />
                                <span>{tab.label}</span>
                                {tab.label === "Bag" && cartCount > 0 && (
                                    <span className="ml-auto h-5 min-w-5 px-1.5 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: Profile */}
                <button
                    onClick={() => router.push("/dashboard/profile")}
                    className={`
                        flex items-center gap-3 px-3 h-12 rounded-[var(--radius-md)]
                        hover:bg-accent transition-colors text-left
                        ${pathname === "/dashboard/profile" ? "bg-primary/10" : ""}
                    `}
                >
                    <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                        {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                            {profile?.full_name || user?.email?.split("@")[0] || "Profile"}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                            {user?.email || "Not signed in"}
                        </p>
                    </div>
                </button>
            </aside>

            {/* ── Content Area ──────────────────────────── */}
            <div className="md:pl-[72px] lg:pl-60 pb-24 md:pb-0">
                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </div>

            {/* ── Mobile Bottom Pill (scroll-aware) ─────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
                <motion.div
                    className="pointer-events-auto mb-[calc(8px+env(safe-area-inset-bottom))]"
                    animate={{
                        y: isCollapsed ? 100 : 0,
                        opacity: isCollapsed ? 0 : 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                    }}
                >
                    <div className="glass-heavy shadow-[var(--shadow-xl)] rounded-full px-2 h-14 flex items-center gap-1">
                        {tabs.map((tab) => {
                            const active = isActive(tab.href);
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`
                                        relative flex items-center gap-2 h-10 rounded-full
                                        transition-all duration-300
                                        ${active
                                            ? "bg-foreground text-background px-4"
                                            : "text-muted-foreground px-3 hover:text-foreground"
                                        }
                                    `}
                                >
                                    <tab.icon className="h-[18px] w-[18px] shrink-0" />
                                    <AnimatePresence>
                                        {active && (
                                            <motion.span
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: "auto", opacity: 1 }}
                                                exit={{ width: 0, opacity: 0 }}
                                                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                                                className="text-xs font-semibold overflow-hidden whitespace-nowrap"
                                            >
                                                {tab.label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {tab.label === "Bag" && cartCount > 0 && !active && (
                                        <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>
            </nav>
        </div>
    );
}
