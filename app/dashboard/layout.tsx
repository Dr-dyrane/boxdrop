"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Compass, ShoppingBag, Package, Search, User, ChevronLeft, ArrowRight, CreditCard, Sun, Moon } from "lucide-react";
import { useScrollDirection } from "@/core/hooks/use-scroll-direction";
import { useAuth } from "@/core/hooks";
import { useCartStore, useThemeStore } from "@/core/store";
import { Logo } from "@/components/ui";
import { PersistentCart } from "@/components/shared/persistent-cart";

/* ─────────────────────────────────────────────────────
   MAIN LAYOUT — Apple Store-Inspired Adaptive Nav
   
   Mobile:   Floating bottom pill (scroll-aware)
             + top header with avatar & search
   Tablet:   Left icon rail (72px)
   Desktop:  Left sidebar (240px) with labels
   ───────────────────────────────────────────────────── */

const pillTabs = [
    { href: "/dashboard", label: "Shop", icon: Home },
    { href: "/dashboard/orders", label: "Products", icon: Package },
    // Bag removed from pill since it's now in the dynamic FAB
];

const sidebarTabs = [
    { href: "/dashboard", label: "Shop", icon: Home },
    { href: "/dashboard/search", label: "Explore", icon: Compass },
    { href: "/dashboard/orders", label: "Products", icon: Package },
];

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { theme, setTheme } = useThemeStore();
    const router = useRouter();
    const { direction, isScrolled } = useScrollDirection(10);
    const { profile, user } = useAuth();
    const cartCount = useCartStore((s) => s.items.length);
    const isCollapsed = direction === "down" && isScrolled;

    // ── Navigation Logic ─────────────────────────

    // Active tab check
    const isActive = (href: string) =>
        pathname === href ||
        (href !== "/dashboard" && pathname.startsWith(href));

    // Dynamic Title Logic
    const getPageTitle = () => {
        if (pathname === "/dashboard") return "BoxDrop";
        if (pathname.startsWith("/dashboard/search")) return "Explore";
        if (pathname.startsWith("/dashboard/orders")) return "Products";
        if (pathname.startsWith("/dashboard/cart")) return "Bag";
        if (pathname.startsWith("/dashboard/profile")) return "Profile";
        if (pathname.startsWith("/dashboard/vendor/")) return "Vendor";
        return "BoxDrop";
    };

    // Dynamic FAB Logic
    const getFABConfig = () => {
        const hasItems = cartCount > 0;

        // Cart Page Special: Checkout
        if (pathname === "/dashboard/cart") {
            return {
                icon: CreditCard,
                onClick: () => {
                    const event = new CustomEvent("boxdrop-checkout");
                    window.dispatchEvent(event);
                },
                isActive: true,
                badge: null,
                label: "Pay"
            };
        }

        // If items are in bag, the Bag becomes the primary FAB action everywhere else
        if (hasItems) {
            return {
                icon: ShoppingBag,
                onClick: () => router.push("/dashboard/cart"),
                isActive: pathname === "/dashboard/cart",
                badge: cartCount,
                label: "Bag"
            };
        }

        // Default: Search
        return {
            icon: Search,
            onClick: () => router.push("/dashboard/search"),
            isActive: pathname === "/dashboard/search",
            badge: null,
            label: "Find"
        };
    };

    const fab = getFABConfig();

    // Profile display
    const avatarUrl = profile?.avatar_url;
    const initials = (profile?.full_name || user?.email || "U")[0].toUpperCase();

    return (
        <div className="min-h-[100dvh]">
            {/* ── Mobile Header ──────────────────────────── */}
            <motion.header
                initial={{ y: 0 }}
                animate={{ y: isCollapsed ? -120 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="md:hidden fixed top-0 left-0 right-0 z-40 glass-heavy h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)]"
            >
                <div className="flex items-center justify-between h-14 px-4">
                    {/* Left: Dynamic Branding / Back */}
                    <div className="flex items-center gap-3">
                        {pathname !== "/dashboard" && (
                            <button
                                onClick={() => router.back()}
                                className="h-8 w-8 flex items-center justify-center glass rounded-full active:scale-90 transition-transform cursor-pointer"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                        )}
                        <span className="text-lg font-black tracking-tight cursor-default">
                            {getPageTitle()}
                        </span>
                    </div>

                    {/* Right: Avatar */}
                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => router.push("/dashboard/profile")}
                            className="h-9 w-9 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0 ring-2 ring-white/10 active:scale-95 transition-transform cursor-pointer"
                            aria-label="Profile"
                        >
                            {avatarUrl ? (
                                <Image
                                    src={avatarUrl}
                                    alt="Profile"
                                    width={36}
                                    height={36}
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
            </motion.header>

            {/* ── Tablet Side Rail (md only) ────────────── */}
            <motion.aside
                animate={{ x: isCollapsed ? -80 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="hidden md:flex lg:hidden fixed top-0 left-0 bottom-0 z-50 w-[72px] flex-col items-center py-6 gap-2 glass-heavy"
            >
                <Link
                    href="/dashboard"
                    className="h-10 w-10 flex items-center justify-center mb-4 cursor-pointer"
                    aria-label="BoxDrop Home"
                >
                    <Logo className="h-8 w-8" />
                </Link>

                <nav className="flex-1 flex flex-col items-center gap-1">
                    {sidebarTabs.map((tab) => {
                        const active = isActive(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`
                                    relative h-11 w-11 flex items-center justify-center rounded-[var(--radius-md)]
                                    transition-colors duration-200 cursor-pointer
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
                        <Image src={avatarUrl} alt="Profile" width={40} height={40} className="h-full w-full object-cover" />
                    ) : (
                        <span className="text-xs font-bold text-muted-foreground">{initials}</span>
                    )}
                </button>
            </motion.aside>

            {/* ── Desktop Sidebar (lg+) ─────────────────── */}
            <motion.aside
                animate={{ x: isCollapsed ? -240 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                className="hidden lg:flex fixed top-0 left-0 bottom-0 z-50 w-60 flex-col py-6 px-3 gap-1 glass-heavy"
            >
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 h-10 mb-4 cursor-pointer"
                >
                    <Logo className="h-7 w-7" />
                    <span className="text-base font-black tracking-tight">BoxDrop</span>
                </Link>

                <nav className="flex-1 flex flex-col gap-0.5">
                    {sidebarTabs.map((tab) => {
                        const active = isActive(tab.href);
                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className={`
                                    relative flex items-center gap-3 px-3 h-11 rounded-[var(--radius-md)]
                                    text-sm font-medium transition-colors duration-200 cursor-pointer
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

                {/* Bottom: Settings & Profile */}
                <div className="mt-auto space-y-2 pb-4">
                    <div className="px-3">
                        <button
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            className="
                                flex items-center gap-3 w-full px-3 h-10 rounded-[var(--radius-md)]
                                hover:bg-accent transition-colors text-left text-muted-foreground hover:text-foreground
                            "
                        >
                            <div className="h-6 w-6 rounded-full flex items-center justify-center shrink-0 bg-primary/5">
                                {theme === "dark" ? <Sun className="h-3 w-3" /> : <Moon className="h-3 w-3" />}
                            </div>
                            <span className="text-xs font-medium">Appearance</span>
                        </button>
                    </div>

                    <div className="px-3">
                        <button
                            onClick={() => router.push("/dashboard/profile")}
                            className={`
                                flex items-center gap-3 w-full px-3 h-12 rounded-[var(--radius-md)]
                                hover:bg-accent transition-colors text-left
                                ${pathname === "/dashboard/profile" ? "bg-primary/10" : ""}
                            `}
                        >
                            <div className="h-8 w-8 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center shrink-0">
                                {avatarUrl ? (
                                    <Image src={avatarUrl} alt="Profile" width={32} height={32} className="h-full w-full object-cover" />
                                ) : (
                                    <User className="h-4 w-4 text-muted-foreground" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black uppercase tracking-tight truncate leading-tight">
                                    {profile?.full_name || user?.email?.split("@")[0] || "Profile"}
                                </p>
                                <p className="text-[9px] text-muted-foreground truncate tabular-nums">
                                    {user?.email || "Not signed in"}
                                </p>
                            </div>
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* ── Content Area ──────────────────────────── */}
            <div className="md:pl-[72px] lg:pl-60 pt-[calc(3.5rem+env(safe-area-inset-top))] md:pt-0 pb-24 md:pb-0">
                <Suspense fallback={null}>
                    {children}
                </Suspense>

                <PersistentCart />
            </div>

            {/* ── Mobile Bottom Pill (scroll-aware) ─────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-between items-end gap-2 pb-[calc(12px+env(safe-area-inset-bottom))] px-4 pointer-events-none">
                <motion.div
                    className="pointer-events-auto"
                    animate={{
                        y: isCollapsed ? 120 : 0,
                        opacity: isCollapsed ? 0 : 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                    }}
                >
                    <div className="glass-heavy rounded-full px-2 h-14 flex items-center gap-1.5">
                        {pillTabs.map((tab) => {
                            const active = isActive(tab.href);
                            return (
                                <Link
                                    key={tab.href}
                                    href={tab.href}
                                    className={`
                                        relative flex items-center gap-2 h-10 rounded-full
                                        transition-all duration-300 cursor-pointer
                                        ${active
                                            ? "bg-foreground text-background px-4"
                                            : "text-muted-foreground px-3 hover:text-foreground"
                                        }
                                    `}
                                >
                                    <tab.icon className="h-[18px] w-[18px] shrink-0" />
                                    <AnimatePresence mode="wait">
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
                                </Link>
                            );
                        })}
                    </div>
                </motion.div>

                {/* ── Dynamic Action FAB ────────────────── */}
                <motion.button
                    onClick={fab.onClick}
                    className="pointer-events-auto h-14 w-14 rounded-full glass-heavy flex items-center justify-center shrink-0 active:scale-90 transition-transform cursor-pointer relative"
                    animate={{
                        y: isCollapsed ? 120 : 0,
                        opacity: isCollapsed ? 0 : 1,
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        delay: 0.05,
                    }}
                >
                    <div className={`
                        h-10 w-10 rounded-full flex items-center justify-center
                        ${fab.isActive ? "bg-foreground text-background" : "text-muted-foreground"}
                        transition-colors duration-300
                    `}>
                        <fab.icon className="h-[18px] w-[18px]" />

                        {/* Dynamic FAB Badge (e.g. Cart count) */}
                        {fab.badge !== null && fab.badge > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 min-w-5 px-1.5 rounded-full bg-foreground text-background text-[10px] font-black flex items-center justify-center">
                                {fab.badge}
                            </span>
                        )}
                    </div>
                </motion.button>
            </nav>
        </div>
    );
}
