"use client";

import { motion } from "framer-motion";
import { Zap, Shield, MapPin } from "lucide-react";

const features = [
    {
        icon: Zap,
        title: "Instant Delivery",
        description: "Real-time tracking from pickup to doorstep.",
    },
    {
        icon: Shield,
        title: "Secure & Reliable",
        description: "Your packages are insured and monitored.",
    },
    {
        icon: MapPin,
        title: "Live Tracking",
        description: "Know exactly where your order is, always.",
    },
];

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
} as const;

export function FeatureList() {
    return (
        <motion.section
            className="max-w-4xl mx-auto px-4 sm:px-6 pb-24"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
        >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
                {features.map((feature) => (
                    <motion.div
                        key={feature.title}
                        variants={item}
                        className="p-6 sm:p-8 space-y-3 sm:space-y-4 text-center glass-heavy sm:glass-none rounded-[2rem] sm:rounded-none border border-foreground/5 sm:border-none"
                    >
                        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-foreground/5 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                            <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground" />
                        </div>
                        <h3 className="font-black text-base sm:text-lg tracking-tight">{feature.title}</h3>
                        <p className="text-[10px] sm:text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wider opacity-60">
                            {feature.description}
                        </p>
                    </motion.div>
                ))}
            </div>
        </motion.section>
    );
}
