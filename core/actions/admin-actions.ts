"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * TRIGGER SIMULATION ORDER
 * Creates a randomized order to kickstart the logistics engine pulse.
 * This is used for stress-testing and demonstration of the real-time network.
 */
export async function triggerSimulationOrder() {
    const supabase = await createClient();

    // 1. Get a random user/patron
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'user')
        .limit(5);

    // 2. Get a random vendor
    const { data: vendors } = await supabase
        .from('vendors')
        .select('id, location')
        .limit(5);

    if (!profiles?.length || !vendors?.length) {
        throw new Error("Cannot trigger simulation: Insufficient setup data (Users/Vendors).");
    }

    const randomUser = profiles[Math.floor(Math.random() * profiles.length)];
    const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];

    // 3. Create randomized delivery location near the vendor (simulated city radius)
    // Most vendors are centered around Santa Monica (34.0195, -118.4912) in our seed
    // We'll just jitter the vendor location slightly
    const vendorLoc = (randomVendor.location as any)?.coordinates || [-118.4912, 34.0195];
    const jitterLat = (Math.random() - 0.5) * 0.02;
    const jitterLng = (Math.random() - 0.5) * 0.02;

    const { data: order, error } = await supabase
        .from('orders')
        .insert({
            user_id: randomUser.id,
            vendor_id: randomVendor.id,
            total: Math.floor(Math.random() * 50) + 15,
            status: 'pending',
            delivery_lat: vendorLoc[1] + jitterLat,
            delivery_lng: vendorLoc[0] + jitterLng,
            delivery_location: "Simulated Destination Point",
            notes: "Simulation Engine Drop"
        })
        .select()
        .single();

    if (error) throw error;

    // 4. Create a system notification about the drop
    await supabase.from('notifications').insert({
        user_id: randomUser.id,
        type: 'system',
        title: "Simulation Injection",
        message: `New network cycle initiated: Order #${order.id.slice(0, 8)}`,
        metadata: { order_id: order.id }
    });

    revalidatePath('/dashboard/admin');
    return order;
}

/**
 * PROVISION SYSTEM MEMBER
 * Creates a new user profile/role safely.
 * In a real app, this would also handle Auth invite.
 */
export async function provisionSystemMember(data: {
    email: string;
    fullName: string;
    role: "user" | "vendor" | "courier" | "admin" | "support";
}) {
    const supabase = await createClient();

    // Note: This relies on handle_new_user and existing Auth records or manual creation.
    // For this admin tool, we update the existing profile if it exists or throw.
    const { error } = await supabase
        .from('profiles')
        .update({
            full_name: data.fullName,
            role: data.role,
            updated_at: new Date().toISOString()
        })
        .eq('email', data.email);

    if (error) throw error;

    revalidatePath('/dashboard/admin');
}
