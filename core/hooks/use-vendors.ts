"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVendors, fetchVendorById, fetchProductsByVendor, searchVendors } from "@/core/services";
import type { Vendor, Product } from "@/types/database";

/* ─────────────────────────────────────────────────────
   VENDOR HOOKS
   Connect UI to Service Layer via React Query.
   ───────────────────────────────────────────────────── */

export function useVendors() {
    return useQuery<Vendor[]>({
        queryKey: ["vendors"],
        queryFn: fetchVendors,
    });
}

export function useVendor(id: string) {
    return useQuery<Vendor | null>({
        queryKey: ["vendor", id],
        queryFn: () => fetchVendorById(id),
        enabled: !!id,
    });
}

export function useVendorProducts(vendorId: string) {
    return useQuery<Product[]>({
        queryKey: ["vendor-products", vendorId],
        queryFn: () => fetchProductsByVendor(vendorId),
        enabled: !!vendorId,
    });
}

export function useSearchVendors(query: string) {
    return useQuery<Vendor[]>({
        queryKey: ["vendors", "search", query],
        queryFn: () => searchVendors(query),
        enabled: !!query && query.length > 2,
    });
}
