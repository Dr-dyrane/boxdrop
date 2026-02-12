import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserOrders, createOrder, fetchOrderById } from "@/core/services";
import { createClient } from "@/lib/supabase/client";
import type { Order } from "@/types/database";

/* ─────────────────────────────────────────────────────
   ORDER HOOKS
   ───────────────────────────────────────────────────── */

export function useOrders() {
    return useQuery<Order[]>({
        queryKey: ["orders"],
        queryFn: fetchUserOrders,
    });
}

export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
}

export function useOrder(id: string) {
    const queryClient = useQueryClient();

    return useQuery<Order | null>({
        queryKey: ["order", id],
        queryFn: async () => {
            const order = await fetchOrderById(id);

            // Subscribe to realtime updates for this specific order
            const supabase = createClient();
            supabase
                .channel(`order-updates-${id}`)
                .on(
                    "postgres_changes" as any,
                    {
                        event: "UPDATE",
                        schema: "public",
                        table: "orders",
                        filter: `id=eq.${id}`,
                    },
                    (payload: any) => {
                        queryClient.setQueryData(["order", id], payload.new);
                        queryClient.invalidateQueries({ queryKey: ["orders"] });
                    }
                )
                .subscribe();

            return order;
        },
        staleTime: Infinity, // Keep it alive while the subscription is active
    });
}
