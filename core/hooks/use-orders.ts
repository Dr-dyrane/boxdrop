import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchUserOrders, createOrder } from "@/core/services";
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
