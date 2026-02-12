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
        nextLat = vendorLocation.lat;
        nextLng = vendorLocation.lng;
    }
    // 4. In Transit (Route Interpolation)
    else if (currentStatus === 'picked_up') {
        // Move courier 5% closer to destination
        nextProgress = Math.min(currentProgress + 0.05, 1);

        // Linear Interpolation
        if (deliveryLocation && vendorLocation) {
            nextLat = vendorLocation.lat + (deliveryLocation.lat - vendorLocation.lat) * nextProgress;
            nextLng = vendorLocation.lng + (deliveryLocation.lng - vendorLocation.lng) * nextProgress;
        }

        if (nextProgress >= 1) {
            nextStatus = 'delivered';
        }
    }

    // 5. Update Database
    const updatePayload: any = { status: nextStatus };

    // Only update coords if we have new ones, otherwise keep existing
    if (nextLat !== undefined && nextLng !== undefined) {
        updatePayload.courier_lat = nextLat;
        updatePayload.courier_lng = nextLng;
    }

    const { error } = await (supabase
        .from('orders') as any)
        .update(updatePayload)
        .eq('id', orderId);

    if (error) {
        console.error("Simulation update failed:", error);
        throw new Error("Failed to advance simulation");
    }

    // Return simulation state so client knows when to stop calling
    return {
        status: nextStatus,
        courier_lat: nextLat,
        courier_lng: nextLng,
        progress: nextProgress
    };
}
