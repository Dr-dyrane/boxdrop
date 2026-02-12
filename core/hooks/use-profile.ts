"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";

export function useProfile(userId: string | undefined) {
    return useQuery<Profile | null>({
        queryKey: ["profile", userId],
        queryFn: async () => {
            if (!userId) return null;
            const supabase = createClient();
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", userId)
                .single();

            if (error) throw error;
            return data;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
