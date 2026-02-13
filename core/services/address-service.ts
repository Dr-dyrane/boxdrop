import { createClient } from "@/lib/supabase/client";
import type { UserAddress } from "@/types/database";

/* ─────────────────────────────────────────────────────
   ADDRESS SERVICE
   CRUD operations for user-saved locations.
   ───────────────────────────────────────────────────── */

export async function fetchUserAddresses(userId: string): Promise<UserAddress[]> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as any) ?? []; // Casting to resolve inference lag
}

export async function saveAddress(address: Omit<UserAddress, "id" | "created_at">): Promise<UserAddress> {
    const supabase = createClient();
    const { data, error } = await supabase
        .from("addresses")
        .insert(address as any)
        .select()
        .single();

    if (error) throw error;
    return data as any;
}

export async function deleteAddress(addressId: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

    if (error) throw error;
}

export async function setDefaultAddress(userId: string, addressId: string): Promise<void> {
    const supabase = createClient();

    // First, unset all default addresses for this user
    await supabase
        .from("addresses")
        .update({ is_default: false } as any)
        .eq("user_id", userId);

    // Then set the specific one
    const { error } = await supabase
        .from("addresses")
        .update({ is_default: true } as any)
        .eq("id", addressId);

    if (error) throw error;
}
