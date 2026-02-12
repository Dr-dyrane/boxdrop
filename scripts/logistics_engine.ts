import { config } from "dotenv";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// Load local env
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // We need Service Role for God Mode

if (!supabaseKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local.");
    console.warn("💡 You need to add this key from your Supabase Dashboard -> Settings -> API.");
    console.warn("   This script requires the service_role key to bypass Row Level Security.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TICK_INTERVAL = 4000; // 4 seconds per tick
const COURIER_SPEED = 0.05; // 5% progress per tick during transit

console.log("📦 BoxDrop Logistics Engine: ONLINE");
console.log("------------------------------------");

async function tick() {
    try {
        // 1. Fetch all non-delivered/cancelled orders
        const { data: orders, error: ordersError } = await supabase
            .from('orders')
            .select('*, vendors(location)')
            .not('status', 'in', '("delivered", "cancelled")');

        if (ordersError) throw ordersError;
        if (!orders || orders.length === 0) return;

        console.log(`[PULSE] Processing ${orders.length} active cycles...`);

        for (const order of orders) {
            const currentStatus = order.status;
            let nextStatus = currentStatus;
            let updatePayload: any = {};

            // A. PENDING -> CONFIRMED (Acknowledge instantly)
            if (currentStatus === 'pending') {
                nextStatus = 'confirmed';
                updatePayload.status = nextStatus;
                console.log(`   └─ Order #${order.id.slice(0, 8)}: CONFIRMED`);
            }
            // B. CONFIRMED -> PREPARING (Simulate Vendor Activity)
            else if (currentStatus === 'confirmed') {
                nextStatus = 'preparing';
                updatePayload.status = nextStatus;
                console.log(`   └─ Order #${order.id.slice(0, 8)}: PREPARING (Vendor)`);
            }
            // C. PREPARING -> PICKED_UP (Assign Courier & Start Journey)
            else if (currentStatus === 'preparing') {
                // Ensure we have a courier assigned (or just use a dummy if we haven't seeded specific couriers yet)
                // For this simulation, we'll just assigned a fixed ID if empty
                if (!order.courier_id) {
                    // Try to find a courier in profiles
                    const { data: couriers } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('role', 'courier')
                        .limit(1);

                    if (couriers && couriers.length > 0) {
                        updatePayload.courier_id = couriers[0].id;
                    }
                }

                nextStatus = 'picked_up';
                updatePayload.status = nextStatus;

                // Start position at vendor
                const vendorLoc = (order.vendors as any)?.location?.coordinates;
                if (vendorLoc) {
                    updatePayload.courier_lat = vendorLoc[1];
                    updatePayload.courier_lng = vendorLoc[0];
                    updatePayload.progress = 0;
                }

                console.log(`   └─ Order #${order.id.slice(0, 8)}: PICKED UP`);
            }
            // D. PICKED_UP -> DELIVERED (Transit Simulation)
            else if (currentStatus === 'picked_up') {
                const currentProgress = order.progress || 0;
                const nextProgress = Math.min(currentProgress + COURIER_SPEED, 1);

                const vendorLoc = (order.vendors as any)?.location?.coordinates;
                const destLat = order.delivery_lat;
                const destLng = order.delivery_lng;

                if (vendorLoc && destLat && destLng) {
                    // Interpolate position
                    const sourceLat = vendorLoc[1];
                    const sourceLng = vendorLoc[0];

                    const nextLat = sourceLat + (destLat - sourceLat) * nextProgress;
                    const nextLng = sourceLng + (destLng - sourceLng) * nextProgress;

                    updatePayload.courier_lat = nextLat;
                    updatePayload.courier_lng = nextLng;
                    updatePayload.progress = nextProgress;
                }

                if (nextProgress >= 1) {
                    nextStatus = 'delivered';
                    updatePayload.status = nextStatus;
                    console.log(`   └─ Order #${order.id.slice(0, 8)}: DELIVERED 🏁`);
                } else {
                    console.log(`   └─ Order #${order.id.slice(0, 8)}: IN TRANSIT (${Math.round(nextProgress * 100)}%)`);
                }
            }

            // Write updates if any
            if (Object.keys(updatePayload).length > 0) {
                await supabase
                    .from('orders')
                    .update(updatePayload)
                    .eq('id', order.id);

                // Insert Notification if status changed
                if (updatePayload.status) {
                    let notificationTitle = "";
                    let notificationMessage = "";

                    switch (updatePayload.status) {
                        case 'confirmed':
                            notificationTitle = "Order Confirmed";
                            notificationMessage = `Vendor is preparing your items.`;
                            break;
                        case 'preparing':
                            notificationTitle = "Order Preparing";
                            notificationMessage = `Vendor has started preparing your order.`;
                            break;
                        case 'picked_up':
                            notificationTitle = "Out for Delivery";
                            notificationMessage = `Courier is on the way to your location.`;
                            break;
                        case 'delivered':
                            notificationTitle = "Order Delivered";
                            notificationMessage = `Package has been dropped off. Enjoy!`;
                            break;
                    }

                    if (notificationTitle) {
                        await supabase
                            .from('notifications')
                            .insert({
                                user_id: order.user_id,
                                type: 'order',
                                title: notificationTitle,
                                message: notificationMessage,
                            });
                    }
                }
            }

        }

    } catch (e) {
        console.error("Simulation Pulse Failure:", e);
    }
}

// Start simulation loop
setInterval(tick, TICK_INTERVAL);
tick();
