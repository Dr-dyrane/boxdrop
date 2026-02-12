"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/core/store";

/* ─────────────────────────────────────────────────────
   THEME PROVIDER
   Applies the theme class to <html> and watches
   system preference when set to "system".
   ───────────────────────────────────────────────────── */

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useThemeStore();

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (resolvedTheme: "light" | "dark") => {
            root.classList.remove("light", "dark");
            root.classList.add(resolvedTheme);
        };

        if (theme === "system") {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            applyTheme(mediaQuery.matches ? "dark" : "light");

            const handler = (e: MediaQueryListEvent) =>
                applyTheme(e.matches ? "dark" : "light");
            mediaQuery.addEventListener("change", handler);
            return () => mediaQuery.removeEventListener("change", handler);
        } else {
            applyTheme(theme);
        }
    }, [theme]);

    return <>{children}</>;
}
