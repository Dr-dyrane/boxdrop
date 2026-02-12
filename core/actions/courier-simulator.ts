"use server";

import { createClient } from "@/lib/supabase/server";

interface CourierSimulationState {
    status: string;
    courier_lat?: number;
    courier_lng?: number;
    progress?: number;
}

/**
 * ─────────────────────────────────────────────────────
 * COURIER SIMULATOR ACTION (LIVE SEEDING)
 * ─────────────────────────────────────────────────────
 * 
 * Advances the state of an order to simulate a live courier journey.
 * Each call performs a single atomic update.
 * 
 * Flow:
 * 1. Checks current order status.
 * 2. Determines the next logical step (status change or position update).
 * 3. Writes update to DB.
 * 4. Returns the new state for the client to confirm.
 */
export async function advanceOrderSimulation(
    orderId: string,
    currentStatus: string,
    vendorLocation: { lat: number, lng: number },
    deliveryLocation: { lat: number, lng: number },
    currentProgress: number = 0
): Promise<CourierSimulationState> {
    // Safety Fallbacks
    const vLoc = vendorLocation.lat ? vendorLocation : { lat: 33.747, lng: -116.971 };
    const dLoc = deliveryLocation.lat ? deliveryLocation : { lat: 33.74, lng: -116.95 };
    const supabase = await createClient();

    let nextStatus = currentStatus;
    let nextProgress = currentProgress;
    let nextLat: number | undefined;
    let nextLng: number | undefined;

    // 1. Pending -> Confirmed (Warm up)
    if (currentStatus === 'pending') {
        nextStatus = 'confirmed';
    }
    // 2. Confirmed -> Preparing (Vendor Activity)
    else if (currentStatus === 'confirmed') {
        nextStatus = 'preparing';
    }
    // 3. Preparing -> Picked Up (Courier Arrival)
    else if (currentStatus === 'preparing') {
        nextStatus = 'picked_up';
        nextProgress = 0;
        // Start simulated position at vendor
        nextLat = vLoc.lat;
        nextLng = vLoc.lng;
    }
    // 4. In Transit (Route Interpolation)
    else if (currentStatus === 'picked_up') {
        // Move courier 15% closer to destination for rapid testing
        nextProgress = Math.min(currentProgress + 0.15, 1);

        // Linear Interpolation
        nextLat = vLoc.lat + (dLoc.lat - vLoc.lat) * nextProgress;
        nextLng = vLoc.lng + (dLoc.lng - vLoc.lng) * nextProgress;

        if (nextProgress >= 1) {
            nextStatus = 'delivered';
        }
    }

    // 5. Update Database (Safe Strategy)
    const updatePayload: any = {
        status: nextStatus,
        progress: nextProgress
    };

    if (nextLat !== undefined && nextLng !== undefined) {
        updatePayload.courier_lat = nextLat;
        updatePayload.courier_lng = nextLng;
    }

    try {
        const { error } = await (supabase
            .from('orders') as any)
            .update(updatePayload)
            .eq('id', orderId);

        if (error) {
            console.error("📦 [Simulation] DB Update Failed:", error.message);
            // If the error is about missing columns, we still return the virtual state
            // so the UI can "pretend" to track while the dev fixes the schema.
        }
    } catch (e) {
        console.warn("📦 [Simulation] Unexpected error during DB write:", e);
    }

    // Return simulation state so client knows when to stop calling
    // This allows the simulation to run "virtually" even if the DB write fails
    return {
        status: nextStatus,
        courier_lat: nextLat,
        courier_lng: nextLng,
        progress: nextProgress
    };
}
