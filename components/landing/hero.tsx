"use client";

import { motion } from "framer-motion";
import { NetworkPulse } from "./network-pulse";
import { SearchBar } from "./search-bar";

export function Hero() {
    return (
        <motion.section
            className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-32 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            {/* Background Decorations */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[30rem] h-[30rem] bg-success/5 rounded-full blur-[150px] animate-pulse delay-1000" />
            </div>

            <NetworkPulse />

            <motion.h1
                className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter max-w-4xl leading-[0.9] text-foreground mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const }}
            >
                Precision <br />
                <span className="text-muted-foreground/20 italic font-medium">Logistics.</span>
            </motion.h1>

            <motion.p
                className="text-base sm:text-lg md:text-xl text-muted-foreground/60 max-w-xl font-medium tracking-tight mb-12 px-6 text-balance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] as const }}
            >
                Premium delivery redefined for absolute efficiency.
                Real-time tracking, zero friction, instant fulfillment.
            </motion.p>

            <SearchBar />
        </motion.section>
    );
}
