
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

const USER_LAT = 33.7431;
const USER_LNG = -116.9478;

async function hemetSeed() {
    console.log("🚀 Seeding Hemet Demo Ecosystem...");

    // 1. Create User Profile
    const dummyUserId = 'd1000000-0000-0000-0000-000000000001';
    await supabase.from('profiles').upsert({
        id: dummyUserId,
        role: 'user',
        full_name: 'Alexander Hemet',
        email: 'hemet@boxdrop.ai'
    });

    // 2. Create Vendors
    const vendors = [
        {
            id: 'v1000000-0000-0000-0000-000000000001',
            name: 'Corinto Bistro',
            address: 'Hemet Ave, CA',
            location: `POINT(-116.971 33.747)`,
            rating: 4.9,
            image_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'v1000000-0000-0000-0000-000000000002',
            name: 'Sierra Deli',
            address: 'Sierra Way, Hemet',
            location: `POINT(-116.960 33.745)`,
            rating: 4.7,
            image_url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400'
        },
        {
            id: 'v1000000-0000-0000-0000-000000000003',
            name: 'Palm Cafe',
            address: 'Palm Ave, Hemet',
            location: `POINT(-116.950 33.740)`,
            rating: 4.5,
            image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80&w=400'
        }
    ];

    for (const v of vendors) {
        console.log(`🔹 Upserting Vendor: ${v.name}`);
        const { error } = await supabase.from('vendors').upsert(v);
        if (error) console.error(`❌ Error seeding ${v.name}:`, error);

        // Add some products
        const products = [
            { name: `${v.name} Signature`, price: 2500, category: 'Food', vendor_id: v.id },
            { name: 'Artisan Drink', price: 800, category: 'Beverage', vendor_id: v.id }
        ];
        await supabase.from('products').upsert(products, { onConflict: 'name,vendor_id' });
    }

    // 3. Create active order for Corinto Bistro targeting the user's house
    const targetOrderId = 'hemet-demo-order-001';
    console.log(`🔹 Creating Demo Order: ${targetOrderId}`);

    await supabase.from('orders').upsert({
        id: targetOrderId,
        user_id: dummyUserId,
        vendor_id: vendors[0].id,
        status: 'pending',
        total: 3300,
        delivery_location: '2235 Corinto Court, Hemet, CA',
        delivery_lat: USER_LAT,
        delivery_lng: USER_LNG,
        progress: 0
    });

    console.log("✅ Hemet Seed Complete!");
    console.log(`📍 User Home Base: ${USER_LAT}, ${USER_LNG}`);
    console.log(`🔗 Tracking Link: http://localhost:3000/dashboard/orders/${targetOrderId}`);
}

hemetSeed();
