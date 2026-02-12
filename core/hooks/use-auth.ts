"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types/database";
import { authService } from "@/core/services/auth-service";

import { useProfile } from "./use-profile";

/* ─────────────────────────────────────────────────────
   USE AUTH HOOK
   Connects UI to auth service. Manages session state.
   ───────────────────────────────────────────────────── */

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loadingSession, setLoadingSession] = useState(true);
    const supabase = useMemo(() => createClient(), []);
    const router = useRouter();

    const { data: profile, isLoading: isLoadingProfile } = useProfile(user?.id);

    useEffect(() => {
        const getSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();
                setUser(session?.user ?? null);
            } catch (err) {
                console.error("Auth initialization error:", err);
            } finally {
                setLoadingSession(false);
            }
        };

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
            setUser(session?.user ?? null);
            setLoadingSession(false);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    const loading = loadingSession || isLoadingProfile;

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
