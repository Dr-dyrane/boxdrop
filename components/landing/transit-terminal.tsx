"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock, Box, ShieldCheck, Zap } from "lucide-react";
import { useState, useEffect } from "react";

const STEPS = [
    { id: 1, label: "Order Verified", description: "LVMH Boutique • 2.4km away", icon: ShieldCheck, color: "text-blue-500" },
    { id: 2, label: "Eco-Route Generated", description: "Optimal transit via courier unit #14", icon: MapPin, color: "text-primary" },
    { id: 3, label: "Awaiting Capture", description: "Courier approaching pickup point", icon: Zap, color: "text-success" },
];

export function TransitTerminal() {
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveStep((prev) => (prev + 1) % STEPS.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="max-w-4xl mx-auto px-6 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Pulse</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-foreground">
                            Global Coverage. <br />
                            Atomic Precision.
                        </h2>
                    </div>
                    <p className="text-muted-foreground/60 font-medium leading-relaxed max-w-sm">
                        Witness our dispatch engine in motion. From boutique verification to doorstep fulfillment in under 12 minutes.
                    </p>

                    <div className="flex gap-10">
                        <div className="space-y-1">
                            <p className="text-2xl font-black tracking-tighter tabular-nums">12:04</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Avg. Discovery</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-black tracking-tighter tabular-nums">98.2%</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">Accuracy Rate</p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    {/* Simulated Tracking Interface */}
                    <div className="glass-heavy rounded-[3rem] p-8 space-y-8 shadow-2xl relative z-10 overflow-hidden border border-foreground/5 dark:border-white/5">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Box className="h-32 w-32" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Courier 014 · In Transit</span>
                            </div>
                            <span className="text-xs font-black tabular-nums">ETA 08:42</span>
                        </div>

                        <div className="space-y-6">
                            {STEPS.map((step, i) => (
                                <motion.div
                                    key={step.id}
                                    initial={false}
                                    animate={{
                                        opacity: i === activeStep ? 1 : 0.3,
                                        x: i === activeStep ? 8 : 0
                                    }}
                                    className="flex items-start gap-4"
                                >
                                    <div className={`h-10 w-10 rounded-2xl ${i === activeStep ? 'bg-primary' : 'bg-foreground/5'} flex items-center justify-center shrink-0 transition-colors duration-500`}>
                                        <step.icon className={`h-5 w-5 ${i === activeStep ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black text-foreground">{step.label}</span>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground/50 tracking-wide">{step.description}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-foreground/5 dark:border-white/5 flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-6 w-6 rounded-full border-2 border-background bg-muted overflow-hidden">
                                        <div className="h-full w-full bg-primary/20" />
                                    </div>
                                ))}
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground shrink-0">Certified Premium</span>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-[80px] -z-10" />
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
                </div>
            </div>
        </section>
    );
}
