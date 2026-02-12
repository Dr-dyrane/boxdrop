"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/core/store";

/* ─────────────────────────────────────────────────────
   THEME TOGGLE
   Floating glass pill. Minimalist. 
   Follows "Logic via hooks/services" pure UI rule.
   ───────────────────────────────────────────────────── */

export function ThemeToggle() {
    const { theme, setTheme } = useThemeStore();

    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="
                h-10 w-10 flex items-center justify-center
                glass rounded-full text-muted-foreground hover:text-foreground
                transition-all duration-300 cursor-pointer
            "
        >
            {theme === "dark" ? (
                <Sun className="h-4 w-4" />
            ) : (
                <Moon className="h-4 w-4" />
            )}
        </motion.button>
    );
}
