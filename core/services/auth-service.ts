import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────────────────
   AUTH SERVICE
   Pure logic for auth operations.
   No UI, no hooks.
   ───────────────────────────────────────────────────── */

export const authService = {
    async signInWithOtp(email: string, redirectTo: string) {
        const supabase = createClient();
        return await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectTo
            }
        });
    },

    async signInWithOAuth(provider: "google" | "github", redirectTo: string) {
        const supabase = createClient();
        return await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo
            }
        });
    },

    async signUp(email: string, fullName: string, redirectTo: string) {
        const supabase = createClient();
        return await supabase.auth.signUp({
            email,
            password: Math.random().toString(36).slice(-12), // OTP-based fallback
            options: {
                data: {
                    full_name: fullName
                },
                emailRedirectTo: redirectTo
            }
        });
    },

    async signOut() {
        const supabase = createClient();
        return await supabase.auth.signOut();
    }
};
