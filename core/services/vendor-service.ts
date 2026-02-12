import { createClient } from "@/lib/supabase/client";
import type { Vendor, Product } from "@/types/database";

/* ─────────────────────────────────────────────────────
   VENDOR SERVICE
   Pure data functions. No UI logic.
   ───────────────────────────────────────────────────── */

export async function fetchVendors(): Promise<Vendor[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .order("is_featured", { ascending: false })
        .order("rating", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

export async function fetchVendorById(id: string): Promise<Vendor | null> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", id)
        .single();

    if (error) throw error;
    return data;
}

export async function fetchProductsByVendor(vendorId: string): Promise<Product[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId)
        .eq("is_available", true)
        .order("name");

    if (error) throw error;
    return data ?? [];
}

export async function searchVendors(query: string): Promise<Vendor[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`)
        .order("is_featured", { ascending: false });

    if (error) throw error;
    return data ?? [];
}

/**
 * Finds vendors within a radius of a coordinates point using PostGIS.
 * This is much cheaper and faster than using Google Places API.
 */
export async function fetchNearbyVendors(
    lat: number,
    lng: number,
    radiusMeters: number = 10000
): Promise<(Vendor & { dist_meters: number })[]> {
    const supabase = createClient();
    const { data, error } = await (supabase.rpc as any)('get_nearby_vendors', {
        user_lat: lat,
        user_long: lng,
        radius_meters: radiusMeters
    });

    if (error) throw error;
    return (data as any) ?? [];
}
