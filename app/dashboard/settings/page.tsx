"use client";

import { ScreenShell } from "@/components/layout/screen-shell";
import { motion } from "framer-motion";
import { Moon, Sun, Bell, Shield, Smartphone, LogOut, ChevronRight } from "lucide-react";
import { GlassCard, Button } from "@/components/ui";
import { useThemeStore } from "@/core/store";
import { useAuth } from "@/core/hooks"; // Assuming signout is here
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────────────
   SETTINGS PAGE
   Configuration hub.
   Manages application behavior and appearance.
   ───────────────────────────────────────────────────── */

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

function SettingRow({ icon: Icon, label, description, action }: any) {
    return (
        <GlassCard className="p-6 rounded-[2rem] flex items-center justify-between gap-6 hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex items-center gap-6">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="font-bold text-sm tracking-tight">{label}</p>
                    {description && <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{description}</p>}
                </div>
            </div>
            {action}
        </GlassCard>
    );
}

export default function SettingsPage() {
    const { theme, setTheme } = useThemeStore();
    const { signOut } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <ScreenShell>
            <motion.div
                className="space-y-12 pb-24"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={item} className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter hidden md:block">Settings.</h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-lg">
                        Configure your BoxDrop experience. Customization reflects your operational style.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Column 1: Interface & Behavior */}
                    <div className="space-y-10">
                        <motion.div variants={item} className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Interface</h3>
                            <div className="space-y-4">
                                <SettingRow
                                    icon={theme === 'dark' ? Moon : Sun}
                                    label="Appearance Mode"
                                    description={`Currently active: ${theme.charAt(0).toUpperCase() + theme.slice(1)}`}
                                    action={
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest bg-white/5 border border-white/5 hover:bg-white/10"
                                        >
                                            Toggle
                                        </Button>
                                    }
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Notifications</h3>
                            <div className="space-y-4">
                                <SettingRow
                                    icon={Bell}
                                    label="Push Alerts"
                                    description="Receive updates on order status"
                                    action={
                                        <div className="h-6 w-10 bg-primary rounded-full relative cursor-pointer">
                                            <div className="absolute top-1 right-1 h-4 w-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    }
                                />
                                <SettingRow
                                    icon={Mail}
                                    label="Email Digest"
                                    description="Weekly summary of activity"
                                    action={
                                        <div className="h-6 w-10 bg-zinc-800 rounded-full relative cursor-pointer">
                                            <div className="absolute top-1 left-1 h-4 w-4 bg-white/20 rounded-full" />
                                        </div>
                                    }
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Column 2: Security & Session */}
                    <div className="space-y-10">
                        <motion.div variants={item} className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Privacy & Security</h3>
                            <div className="space-y-4">
                                <SettingRow
                                    icon={Shield}
                                    label="Two-Factor Auth"
                                    description="Enhanced account protection"
                                    action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                />
                                <SettingRow
                                    icon={Smartphone}
                                    label="Active Sessions"
                                    description="Manage logged-in devices"
                                    action={<ChevronRight className="h-4 w-4 text-muted-foreground" />}
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="pt-8 border-t border-white/5">
                            <Button
                                onClick={handleLogout}
                                className="w-full h-16 rounded-[2rem] bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 font-black uppercase tracking-widest transition-all duration-300"
                            >
                                <LogOut className="h-4 w-4 mr-3" />
                                Terminate Session
                            </Button>
                            <p className="text-[10px] text-center mt-6 text-muted-foreground font-medium">
                                BoxDrop v2.4.0 (Stable) • Build 8942
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </ScreenShell>
    );
}

// Helper icons
function Mail(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-mail"
        >
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
    )
}
