"use client";

import { motion } from "framer-motion";

export function NetworkPulse() {
    const isOptimal = new Date().getHours() > 8 && new Date().getHours() < 22;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
            className="mb-10 px-4 sm:px-6 py-2 glass-heavy rounded-full border border-foreground/5 dark:border-primary/10 shadow-2xl shadow-primary/5 flex items-center gap-3 sm:gap-6 group hover:scale-[1.02] transition-transform cursor-default"
        >
            <div className="flex items-center gap-2">
                <div className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-success opacity-75 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
                </div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                    {isOptimal ? "Network Optimal" : "Off-Peak Hours"}
                </span>
            </div>

            <div className="h-4 w-px bg-foreground/10 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-4">
                <div className="flex flex-col items-start">
                    <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60 leading-none mb-1">Active Couriers</span>
                    <span className="text-xs font-black tabular-nums leading-none">16 Units</span>
                </div>
                <div className="flex flex-col items-start border-l border-foreground/5 pl-4">
                    <span className="text-[9px] font-black uppercase tracking-tighter text-muted-foreground/60 leading-none mb-1">Efficiency</span>
                    <span className="text-xs font-black tabular-nums leading-none">99.4%</span>
                </div>
            </div>
        </motion.div>
    );
}
