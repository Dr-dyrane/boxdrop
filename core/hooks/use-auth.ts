"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { authService } from "@/core/services/auth-service";

/* ─────────────────────────────────────────────────────
   USE AUTH HOOK
   Connects UI to auth service. Manages session state.
   ───────────────────────────────────────────────────── */

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            setUser(session?.user ?? null);

            if (session?.user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();
                setProfile(data);
            }
            setLoading(false);
        };

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                const { data } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();
                setProfile(data);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const signOut = useCallback(async () => {
        await authService.signOut();
        router.push("/");
    }, [router]);

    const signInWithOtp = useCallback(
        (email: string, redirectTo?: string) =>
            authService.signInWithOtp(email, redirectTo || `${window.location.origin}/dashboard`),
        []
    );

    const signInWithGoogle = useCallback(
        (redirectTo?: string) =>
            authService.signInWithOAuth("google", redirectTo || "/dashboard"),
        []
    );

    const signUp = useCallback(
        (email: string, fullName: string, redirectTo?: string) =>
            authService.signUp(email, fullName, redirectTo || `${window.location.origin}/dashboard`),
        []
    );

    return { user, profile, loading, signOut, signInWithOtp, signInWithGoogle, signUp };
}
