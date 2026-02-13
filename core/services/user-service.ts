import { createClient } from "@/lib/supabase/client";
import type { Profile, UserRole } from "@/types/database";

/* ─────────────────────────────────────────────────────
   USER SERVICE
   Administrative operations for user management.
   Requires appropriate RLS permissions (Admin only).
   ───────────────────────────────────────────────────── */

export const userService = {
    /**
     * Fetch all user profiles.
     * Only works if the authenticated user has 'admin' role.
     */
    async getAllProfiles(): Promise<Profile[]> {
        const supabase = createClient();
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
    },

    /**
     * Update a user's role.
     * Only works if the authenticated user has 'admin' role.
     */
    async updateRole(userId: string, role: UserRole): Promise<void> {
        const supabase = createClient();
        const { error } = await supabase
            .from("profiles")
            .update({ role, updated_at: new Date().toISOString() })
            .eq("id", userId);

        if (error) throw error;
    }
};
