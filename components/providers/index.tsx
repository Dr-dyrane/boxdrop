"use client";

import { ThemeProvider } from "./theme-provider";
import { QueryProvider } from "./query-provider";

/* ─────────────────────────────────────────────────────
   APP PROVIDERS
   Global provider tree. Order matters:
   Query (server state) → Theme (client state)
   ───────────────────────────────────────────────────── */

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <ThemeProvider>
                {children}
            </ThemeProvider>
        </QueryProvider>
    );
}
