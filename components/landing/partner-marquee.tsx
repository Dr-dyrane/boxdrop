"use client";

import { motion } from "framer-motion";

const PARTNERS = [
    "Elite Groceries", "Maison Luxury", "The Bakery Hub", "Prime Pharmacy",
    "Urban Coffee", "Atelier Retail", "Global Logistics", "Secure Dispatch"
];

export function PartnerMarquee() {
    return (
        <section className="py-24 border-y border-foreground/5 overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 mb-10 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60 dark:text-muted-foreground/40">Serving Global Partners</p>
            </div>

            <div className="relative flex overflow-hidden">
                <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 30,
                            ease: "linear",
                        },
                    }}
                    className="flex flex-none gap-20 items-center pr-20"
                >
                    {[...PARTNERS, ...PARTNERS].map((partner, i) => (
                        <span
                            key={i}
                            className="text-2xl md:text-3xl font-black italic tracking-tighter text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors uppercase whitespace-nowrap cursor-default"
                        >
                            {partner}
                        </span>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
