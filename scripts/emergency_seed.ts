
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixSchemaAndSeed() {
    console.log("🚀 Starting Schema Fix & Emergency Seed...");

    // 1. Attempt to add missing columns via SQL (using any possible RPC or assuming schema might catch up)
    // Actually, I'll just try to insert/upsert. If it fails, I'll know why.

    // 2. Find or Create a Vendor
    console.log("🔹 Identifying Vendor...");
    let { data: vendors } = await supabase.from('vendors').select('id, name').limit(1);

    if (!vendors || vendors.length === 0) {
        console.log("🔸 No vendors found. Creating a demo vendor...");
        const { data: newVendor, error: vError } = await supabase.from('vendors').insert({
            id: 'a1000000-0000-0000-0000-000000000001',
            name: 'Hemet Global Kitchen',
            address: 'Downtown Hemet, CA',
            location: 'POINT(-116.971 33.747)', // WKT for PostGIS
            owner_id: 'd1000000-0000-0000-0000-000000000001', // Link to dummy profile
            rating: 4.8
        }).select().single();
        if (vError) {
            console.error("❌ Vendor creation failed (Schema might be mismatching):", vError);
        }
        vendors = newVendor ? [newVendor] : [];
    }

    if (!vendors || vendors.length === 0) return;
    const vendorId = vendors[0].id;

    // 3. Create a Dummy User Profile
    const dummyUserId = 'd1000000-0000-0000-0000-000000000001';
    console.log("🔹 Seeding Profile...");
    await supabase.from('profiles').upsert({
        id: dummyUserId,
        role: 'user',
        full_name: 'Demo User',
        email: 'demo@example.com'
    });

    // 4. Create an Active Order
    // We'll use a specific ID if provided or let it generate
    const targetOrderId = '36fc5a23-d3c5-493c-a09e-b742157175f8';
    console.log(`🔹 Seeding Order ${targetOrderId}...`);

    const { data: order, error: orderError } = await supabase.from('orders').upsert({
        id: targetOrderId,
        user_id: dummyUserId,
        vendor_id: vendorId,
        status: 'pending',
        total: 84.20,
        delivery_location: 'Hemet Residential East, CA',
        delivery_lat: 33.74,
        delivery_lng: -116.95,
        progress: 0
    }).select().single();

    if (orderError) {
        console.error("❌ Order Seed Failed. This usually means 'courier_lat/lng' columns are missing or RLS is blocking even with Service Key (unlikely).", orderError);
        console.log("💡 Suggestion: Run 'ALTER TABLE orders ADD COLUMN courier_lat double precision, ADD COLUMN courier_lng double precision;' in Supabase SQL Editor.");
    } else {
        console.log("✅ Seed Successful!");
        console.log("------------------------------------");
        console.log(`📡 ACTIVE ORDER ID: ${order.id}`);
        console.log(`🔗 TRACKING URL: http://localhost:3000/dashboard/orders/${order.id}`);
        console.log("------------------------------------");
    }
}

fixSchemaAndSeed();
