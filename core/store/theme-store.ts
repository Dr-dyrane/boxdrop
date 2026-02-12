import { create } from "zustand";
import { persist } from "zustand/middleware";

/* ─────────────────────────────────────────────────────
   THEME STORE
   Controls dark mode. Persisted to localStorage.
   ───────────────────────────────────────────────────── */

type Theme = "light" | "dark" | "system";

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: "dark", // BoxDrop defaults to dark — premium feel
            setTheme: (theme) => set({ theme }),
        }),
        {
            name: "boxdrop-theme",
        }
    )
);
