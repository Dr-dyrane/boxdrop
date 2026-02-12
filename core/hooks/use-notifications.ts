
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
}

let isNotificationsAvailable = true;

export function useNotifications() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            if (!isNotificationsAvailable) return [];

            try {
                const { data, error } = await (supabase
                    .from("notifications" as any) as any)
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) {
                    // PGRST205 = Table missing. Disable further attempts.
                    if (error.code === 'PGRST205' || error.message?.includes('not found')) {
                        console.warn("🔔 [Boxdrop] Notifications table not found in Supabase. Feature disabled.");
                        isNotificationsAvailable = false;
                        return [];
                    }
                    throw error;
                }
                return data || [];
            } catch (e) {
                isNotificationsAvailable = false;
                return [];
            }
        },
        // Only retry if we haven't confirmed it's a missing table
        enabled: isNotificationsAvailable
    });
}

export function useMarkAllRead() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            const { error } = await (supabase
                .from("notifications" as any) as any)
                .update({ read: true } as any)
                .eq("read", false);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
}

export function useDismissNotification() {
    const supabase = createClient();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            const { error } = await (supabase
                .from("notifications" as any) as any)
                .delete()
                .eq("id", id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });
}

