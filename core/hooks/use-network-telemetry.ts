"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types/database";

export function useNetworkTelemetry() {
    const supabase = createClient();
    const [orders, setOrders] = useState<(Order & { vendors: { location: any } })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Initial Fetch of active orders with telemetry
        async function fetchTelemetry() {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select('*, vendors(location)')
                .not('status', 'in', '("delivered", "cancelled")');

            if (!error && data) {
                setOrders(data as any);
            }
            setLoading(false);
        }

        fetchTelemetry();

        // 2. Real-time Subscription to position changes
        const channel = supabase
            .channel('network_telemetry')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders'
            }, (payload) => {
                // If it's a new order or update, we might need a fresh fetch to get vendor relation
                // but for simplicity, we just refetch the active set when anything changes
                fetchTelemetry();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    return { orders, loading };
}
