"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNearbyVendors } from "@/core/services/vendor-service";

/* ─────────────────────────────────────────────────────
   USE NEARBY VENDORS HOOK
   Encapsulates PostGIS-powered discovery logic.
   Caches results for performance.
   ───────────────────────────────────────────────────── */

export function useNearbyVendors(lat?: number, lng?: number, radius?: number) {
    return useQuery({
        queryKey: ["vendors", "nearby", lat, lng, radius],
        queryFn: () => {
            if (lat === undefined || lng === undefined) return [];
            return fetchNearbyVendors(lat, lng, radius);
        },
        enabled: lat !== undefined && lng !== undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
