"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Zap, Headphones, Crown } from "lucide-react";
import { Button } from "@/components/ui";

const perks = [
    { icon: Zap, label: "Quantum Dispatch", desc: "Your orders bypass the queue for instant fulfillment." },
    { icon: Crown, label: "Lounge Access", desc: "Exclusive partner deals and boutique invitations." },
    { icon: Headphones, label: "Concierge 24/7", desc: "A dedicated logistics agent for every request." },
    { icon: Shield, label: "Infinite Insurance", desc: "Unlimited coverage for high-value items." },
];

export function BlackMembership() {
    return (
        <section className="max-w-6xl mx-auto px-6 pb-40">
            <div className="relative bg-card dark:bg-black rounded-[4rem] overflow-hidden p-12 md:p-24 border border-foreground/5 dark:border-white/5 shadow-2xl">
                {/* Background Texture */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent)]" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="inline-flex items-center gap-2 bg-foreground/5 dark:bg-white/5 border border-foreground/10 dark:border-white/10 rounded-full px-4 py-1.5 backdrop-blur-xl">
                            <Sparkles className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground dark:text-white">Elite Service</span>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] text-foreground dark:text-white">
                                BoxDrop <br />
                                <span className="italic font-medium text-muted-foreground/30 dark:text-white/40">Black.</span>
                            </h2>
                            <p className="text-xl text-muted-foreground/60 dark:text-white/60 font-medium max-w-sm leading-tight">
                                Invisible logistics. Unmatched priority. The evolution of elite delivery.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button variant="primary" className="h-16 px-10 rounded-[2rem] font-black uppercase tracking-widest text-xs">
                                Apply for Access
                            </Button>
                            <Button variant="ghost" className="h-16 px-10 rounded-[2rem] border border-foreground/10 dark:border-white/10 font-black uppercase tracking-widest text-xs">
                                View Benefits
                            </Button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {perks.map((perk) => (
                            <motion.div
                                key={perk.label}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="bg-foreground/5 dark:bg-white/5 border border-foreground/5 dark:border-white/10 p-8 rounded-[2.5rem] backdrop-blur-xl space-y-6 group transition-all"
                            >
                                <div className="h-12 w-12 rounded-2xl bg-foreground/10 dark:bg-white/10 flex items-center justify-center group-hover:bg-foreground dark:group-hover:bg-white group-hover:text-background dark:group-hover:text-black transition-colors">
                                    <perk.icon className="h-6 w-6" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-black text-foreground dark:text-white tracking-tight">{perk.label}</h3>
                                    <p className="text-xs text-muted-foreground/60 dark:text-white/50 font-medium leading-relaxed">{perk.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
