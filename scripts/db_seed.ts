
import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 📍 HEMET, CA - CENTER POINT
const HEMET_LAT = 33.7470;
const HEMET_LNG = -116.9710;
const USER_LAT = 33.7431;
const USER_LNG = -116.9478;

// HELPERS
const randomLoc = (lat: number, lng: number, radiusDeg = 0.08) => {
    const newLng = lng + (Math.random() - 0.5) * radiusDeg;
    const newLat = lat + (Math.random() - 0.5) * radiusDeg;
    return `POINT(${newLng} ${newLat})`;
};

const CATEGORIES = ["Restaurant", "Groceries", "Pharmacy", "Retail", "Coffee"];

const VENDOR_NAMES = {
    "Restaurant": ["Bistro", "Grill", "Eats", "Diner", "Kitchen", "House", "Tacos", "Sushi", "Pizza", "Burger"],
    "Groceries": ["Market", "Fresh", "Grocer", "Pantry", "Mart", "Foods", "Organics"],
    "Pharmacy": ["Pharmacy", "Drugstore", "Rx", "Health", "Wellness", "Care", "Meds"],
    "Retail": ["Shop", "Store", "Outlet", "Boutique", "Tech", "Supply", "Gear"],
    "Coffee": ["Cafe", "Coffee", "Roasters", "Brew", "Espresso", "Beans", "Grind"]
};

// CURATED UNSPLASH IMAGES
const CATEGORY_IMAGES = {
    "Restaurant": [
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1200", // Restaurant Interior
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200", // Plated Food
        "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1200", // Fine Dining
        "https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200", // Bar
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1200", // Healthy Bowl
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200"  // Steak
    ],
    "Groceries": [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1200", // Market produce
        "https://images.unsplash.com/photo-1534723452862-4c874018d66d?q=80&w=1200", // Fresh Vegetables
        "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=1200", // Supermarket Aisle
        "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=1200", // Fruits
        "https://images.unsplash.com/photo-1578916171728-46686eac8d58?q=80&w=1200"  // Pantry items
    ],
    "Pharmacy": [
        "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=1200", // Pills
        "https://images.unsplash.com/photo-1631549916768-4119b2d3f962?q=80&w=1200", // Medical Shelf
        "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=1200", // Pharmacy Counter
        "https://images.unsplash.com/photo-1585435557343-3b092031a831?q=80&w=1200", // Medicine Bottles
        "https://images.unsplash.com/photo-1563213126-a4273aed2016?q=80&w=1200"  // Vitamins
    ],
    "Retail": [
        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200", // Clothing Rack
        "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=1200", // Boutique
        "https://images.unsplash.com/photo-1472851294608-415522f716a7?q=80&w=1200", // Watches
        "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=1200", // Camera
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200"  // Fashion
    ],
    "Coffee": [
        "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1200", // Latte Art
        "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=1200", // Coffee Beans
        "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200", // Cafe Table
        "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200", // Coffee Shop
        "https://images.unsplash.com/photo-1507133750069-41d5711b7963?q=80&w=1200"  // Barista
    ]
};

// Helper: Get robust image
const getCategoryImg = (cat: string) => {
    const images = CATEGORY_IMAGES[cat as keyof typeof CATEGORY_IMAGES] || CATEGORY_IMAGES["Retail"];
    return images[Math.floor(Math.random() * images.length)];
};

// Generate 100+ Vendors
const generateVendors = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
        const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
        const suffix = VENDOR_NAMES[category as keyof typeof VENDOR_NAMES][Math.floor(Math.random() * VENDOR_NAMES[category as keyof typeof VENDOR_NAMES].length)];
        const name = `${['The', 'Golden', 'Royal', 'Urban', 'Local', 'Prime', 'Elite'][Math.floor(Math.random() * 7)]} ${suffix} ${Math.floor(Math.random() * 100)}`;

        return {
            name,
            description: `Premium ${category.toLowerCase()} delivered to your door.`,
            address: `${Math.floor(Math.random() * 9000) + 100} Florida Ave, Hemet, CA`,
            rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
            is_featured: Math.random() > 0.8, // 20% featured
            category,
            logo_url: `https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=random&color=fff&size=128`, // Improved avatar params
            cover_url: getCategoryImg(category),
            location: randomLoc(HEMET_LAT, HEMET_LNG)
        };
    });
};

async function unifiedSeed() {
    console.log("🚀 Starting UNIFIED SEED (Clean + 120 Vendors)...");

    // 1. DELETE EXISTING DATA
    console.log("🧹 Wiping existing data...");
    const { error: e1 } = await supabase.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: e2 } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: e3 } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    const { error: e4 } = await supabase.from('vendors').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (e1 || e2 || e3 || e4) console.warn("⚠️ Warning during wipe (safe to ignore if tables empty).");

    // 2. INSERT HIGH FIDELITY VENDORS (Fixed IDs)
    console.log("🌱 Seeding 4 High-Fidelity Vendors...");
    const hifiVendors = [
        {
            id: 'a1000000-0000-0000-0000-000000000010', name: 'The Tech Haven', description: 'Next-gen gadgets.', address: 'W Florida Ave, Hemet', location: 'POINT(-116.971 33.747)', rating: 4.9, is_featured: true, category: 'Retail', cover_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=1200'
        },
        {
            id: 'a1000000-0000-0000-0000-000000000011', name: 'Hemet Florals', description: 'Bespoke bouquets.', address: 'N Sanderson Ave, Hemet', location: 'POINT(-116.994 33.743)', rating: 4.8, is_featured: false, category: 'Retail', cover_url: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1200'
        },
        {
            id: 'a1000000-0000-0000-0000-000000000013', name: 'Sushi Zen', description: 'Premium sushi.', address: 'S State St, Hemet', location: 'POINT(-117.011 33.767)', rating: 4.9, is_featured: true, category: 'Restaurant', cover_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1200'
        },
        {
            id: 'a1000000-0000-0000-0000-000000000012', name: 'Prime Auto', description: 'Car parts.', address: 'E Stetson Ave, Hemet', location: 'POINT(-116.954 33.754)', rating: 4.7, is_featured: false, category: 'Retail', cover_url: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?q=80&w=1200'
        }
    ];
    await supabase.from('vendors').upsert(hifiVendors);

    // 3. INSERT MASSIVE VENDORS
    console.log("🌳 Seeding 120 Generated Vendors...");
    const genVendors = generateVendors(120);
    const { data: allVendors, error: seedError } = await supabase.from('vendors').insert(genVendors).select();
    if (seedError) {
        console.error("❌ Error seeding massive vendors:", seedError);
        process.exit(1);
    }

    const combinedVendors = [...hifiVendors, ...(allVendors || [])];
    console.log(`✅ Total Vendors: ${combinedVendors.length}`);

    // 4. SEED PRODUCTS
    console.log("📦 Seeding Products...");
    const products = [];
    for (const v of combinedVendors) {
        // Hifi products for specific IDs
        if (v.id === 'a1000000-0000-0000-0000-000000000010') {
            products.push({ vendor_id: v.id, name: 'Neural Buds', price: 199, category: 'Audio', is_available: true });
        } else if (v.id === 'a1000000-0000-0000-0000-000000000013') {
            products.push({ vendor_id: v.id, name: 'Dragon Roll', price: 18, category: 'Rolls', is_available: true });
        } else {
            // Random products with proper images
            for (let i = 0; i < 5; i++) {
                products.push({
                    vendor_id: v.id,
                    name: `${v.category} Item ${i + 1}`,
                    description: `High quality ${v.category.toLowerCase()} product.`, // Added missing desc field for robust data
                    price: Number((10 + Math.random() * 50).toFixed(2)),
                    category: v.category,
                    is_available: true,
                    image_url: getCategoryImg(v.category), // Use robust image helper
                    stock: Math.floor(Math.random() * 50) + 10
                });
            }
        }
    }

    // Chunk insert products
    for (let i = 0; i < products.length; i += 100) {
        await supabase.from('products').insert(products.slice(i, i + 100));
    }
    console.log(`✅ Total Products: ${products.length}`);

    // 5. CREATE DEMO ORDER
    console.log("🚚 Creating Demo Order...");
    const dummyUserId = 'd1000000-0000-0000-0000-000000000001';
    await supabase.from('profiles').upsert({ id: dummyUserId, role: 'user', full_name: 'Alex Hemet', email: 'alex@boxdrop.ai' });

    const { data: order } = await supabase.from('orders').insert({
        user_id: dummyUserId,
        vendor_id: hifiVendors[2].id, // Sushi Zen
        status: 'preparing',
        total: 55.00,
        delivery_location: '2235 Corinto Court, Hemet, CA',
        delivery_lat: USER_LAT,
        delivery_lng: USER_LNG,
        progress: 0.1
    }).select().single();

    if (order) {
        console.log(`🎉 Demo Order Created! ID: ${order.id}`);
        console.log(`🔗 Link: http://localhost:3000/dashboard/orders/${order.id}`);
    }

    console.log("\n✨ UNIFIED SEED COMPLETE!");
}

unifiedSeed();
