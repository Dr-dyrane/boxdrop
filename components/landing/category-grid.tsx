"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const CATEGORIES = [
    { name: "Restaurant", icon: "🍳" },
    { name: "Groceries", icon: "🍎" },
    { name: "Pharmacy", icon: "💊" },
    { name: "Retail", icon: "🛍️" },
    { name: "Coffee", icon: "☕" },
];

export function CategoryGrid() {
    const router = useRouter();

    return (
        <motion.section
            className="max-w-6xl mx-auto px-6 pb-24 sm:pb-32"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            <div className="space-y-8 sm:space-y-12">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tighter">Everything, Delivered.</h2>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.2em] opacity-50">Discovery Hub</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                    {CATEGORIES.map((cat, i) => (
                        <motion.div
                            key={cat.name}
                            whileHover={{ y: -8 }}
                            className="group cursor-pointer"
                            onClick={() => router.push(`/dashboard/search?category=${cat.name}`)}
                        >
                            <div className={`h-40 sm:h-48 rounded-[2rem] sm:rounded-[3rem] glass-heavy border border-foreground/5 flex flex-col items-center justify-center gap-4 sm:gap-6 group-hover:bg-primary transition-all duration-500 shadow-xl shadow-black/5 ${i % 2 === 0 ? "md:translate-y-6" : ""
                                }`}>
                                <span className="text-4xl sm:text-5xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">{cat.icon}</span>
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">{cat.name}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.section>
    );
}
