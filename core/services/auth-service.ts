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
        // Redirect through /auth/callback, which exchanges the code for a session.
        // The 'next' param tells the callback where to send the user afterwards.
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", redirectTo);

        return await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: callbackUrl.toString()
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
