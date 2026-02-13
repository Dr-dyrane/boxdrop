"use client";

import { ScreenShell } from "@/components/layout/screen-shell";
import { useAuth, useAddresses } from "@/core/hooks";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, Shield, CreditCard, ChevronRight, X, Star } from "lucide-react";
import { GlassCard, Button } from "@/components/ui";

/* ─────────────────────────────────────────────────────
   PROFILE PAGE
   User identity management.
   Visualizes member status and personal data.
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

export default function ProfilePage() {
    const { profile, user, loading } = useAuth();
    const { addresses, deleteAddress } = useAddresses(user?.id);

    if (loading) return <ScreenShell>Loading Profile...</ScreenShell>;

    return (
        <ScreenShell>
            <motion.div
                className="space-y-12 pb-24"
                variants={container}
                initial="hidden"
                animate="show"
            >
                {/* Header */}
                <motion.div variants={item} className="space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter hidden md:block">Identity.</h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-lg">
                        Manage your digital presence and preferences within the BoxDrop ecosystem.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Avatar & Quick Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <motion.div variants={item} className="glass-heavy p-8 rounded-[3rem] text-center space-y-6 border border-white/5 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative mx-auto h-32 w-32 rounded-full bg-zinc-900 flex items-center justify-center border-4 border-white/5 shadow-2xl overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl font-black text-white">
                                        {profile?.email?.[0].toUpperCase() || "U"}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-black tracking-tight">{profile?.email?.split('@')[0] || "User"}</h2>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                                    <Shield className="h-3 w-3 text-primary" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Premium Member</span>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="glass p-6 rounded-[2.5rem] border border-white/5 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2">Quick Stats</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                                    <span className="text-xs font-bold">Total Orders</span>
                                    <span className="text-lg font-black">24</span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                                    <span className="text-xs font-bold">Saved Places</span>
                                    <span className="text-lg font-black">{addresses.length}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-8 space-y-8">
                        <motion.div variants={item}>
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 mb-6">Personal Information</h3>
                            <div className="space-y-4">
                                <GlassCard className="p-6 rounded-[2rem] flex items-center gap-6 group cursor-pointer hover:bg-white/5 transition-colors">
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Email Address</p>
                                        <p className="text-sm font-bold truncate">{profile?.email}</p>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-50 group-hover:translate-x-1 transition-transform" />
                                </GlassCard>

                                <GlassCard className="p-6 rounded-[2rem] flex items-center gap-6 group cursor-pointer hover:bg-white/5 transition-colors">
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                                        <Phone className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Phone Number</p>
                                        <p className="text-sm font-bold truncate">+234 810 000 0000</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-[10px] uppercase font-black">Verify</Button>
                                </GlassCard>

                                <GlassCard className="p-6 rounded-[2rem] flex items-center gap-6 group cursor-pointer hover:bg-white/5 transition-colors">
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center shrink-0">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Joined</p>
                                        <p className="text-sm font-bold truncate">Oct 24, 2024</p>
                                    </div>
                                </GlassCard>
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="pt-8">
                            <div className="flex items-center justify-between px-2 mb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Saved Places</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                                    onClick={() => window.dispatchEvent(new CustomEvent("boxdrop-open-location"))}
                                >
                                    Add New
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addresses.length > 0 ? (
                                    addresses.map((addr: any) => (
                                        <GlassCard key={addr.id} className="p-6 rounded-[2rem] space-y-4 group relative overflow-hidden">
                                            <div className="flex items-start justify-between">
                                                <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Star className="h-4 w-4 fill-primary/20" />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                                                    onClick={() => deleteAddress(addr.id)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{addr.label}</p>
                                                <p className="text-sm font-bold truncate">{addr.address.split(',')[0]}</p>
                                                <p className="text-[10px] text-muted-foreground truncate opacity-60 leading-tight mt-1">{addr.address.split(',').slice(1).join(',').trim()}</p>
                                            </div>
                                        </GlassCard>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center glass rounded-[2.5rem] border border-dashed border-white/5">
                                        <p className="text-sm text-muted-foreground font-medium">No saved places yet.</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-2 cursor-pointer hover:underline" onClick={() => window.dispatchEvent(new CustomEvent("boxdrop-open-location"))}>Set your first destination</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        <motion.div variants={item} className="pt-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 mb-6">Financial</h3>
                            <GlassCard className="p-8 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 border border-white/5">
                                <div className="flex items-center gap-6">
                                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                                        <CreditCard className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-black text-lg">**** 4242</p>
                                        <p className="text-xs text-muted-foreground font-medium">Expires 12/28</p>
                                    </div>
                                </div>
                                <Button className="text-xs font-black uppercase tracking-widest px-8 rounded-xl h-12">Manage Cards</Button>
                            </GlassCard>
                        </motion.div>

                        <motion.div variants={item} className="pt-8">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 mb-6">System Utilities</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="ghost"
                                    className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1"
                                    onClick={() => window.location.href = '/dashboard/settings'}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Settings</span>
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-1"
                                    onClick={() => window.location.href = '/dashboard/notifications'}
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alerts</span>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </ScreenShell>
    );
}
