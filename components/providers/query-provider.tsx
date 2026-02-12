"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

/* ─────────────────────────────────────────────────────
   QUERY PROVIDER
   TanStack Query client with sensible defaults
   for a logistics app (short stale time, retry).
   ───────────────────────────────────────────────────── */

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30 * 1000, // 30 seconds — logistics data changes fast
                        retry: 2,
                        refetchOnWindowFocus: true,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
}
