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
        .or(`name.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
        .order("is_featured", { ascending: false });

    if (error) throw error;
    return data ?? [];
}
