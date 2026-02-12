"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { Button, Logo, GlassCard } from "@/components/ui";
import Link from "next/link";
import { useAuth } from "@/core/hooks";
import { useSearchParams } from "next/navigation";

/* ─────────────────────────────────────────────────────
   LOGIN PAGE
   One dominant action. Focused form.
   ───────────────────────────────────────────────────── */

export default function LoginPage() {
    const { signInWithOtp, signInWithGoogle } = useAuth();
    const searchParams = useSearchParams();
    const redirectTo = searchParams.get("redirectTo") || "/dashboard";

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || loading) return;

        setLoading(true);
        setError(null);

        try {
            const { error: authError } = await signInWithOtp(email, `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`);

            if (authError) {
                setError(authError.message);
                return;
            }

            setSent(true);
        } catch (err: any) {
            console.error("Login failed:", err);
            setError(err.message || "An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (googleLoading) return;
        setGoogleLoading(true);
        try {
            await signInWithGoogle(redirectTo);
        } catch (err: any) {
            console.error("Google login failed:", err);
            setError(err.message || "Login with Google failed.");
        } finally {
            // If we reach here, the browser didn't redirect or it's a slow transition
            setGoogleLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col items-center mb-10">
                <Logo className="h-14 mb-4" />
                <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
                <p className="text-sm text-muted-foreground mt-2">
                    Sign in to your BoxDrop account
                </p>
            </div>

            <GlassCard className="space-y-6">
                {sent ? (
                    <motion.div
                        className="text-center py-4 space-y-3"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="h-12 w-12 mx-auto rounded-full bg-success/10 flex items-center justify-center">
                            <Mail className="h-5 w-5 text-success" />
                        </div>
                        <h2 className="font-semibold">Check your email</h2>
                        <p className="text-sm text-muted-foreground">
                            We sent a login link to{" "}
                            <span className="text-foreground font-medium">{email}</span>
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSent(false)}
                            className="mt-2"
                        >
                            Try a different email
                        </Button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label
                                htmlFor="email"
                                className="text-sm font-medium text-foreground"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    autoFocus
                                    className="
                    w-full h-10 pl-10 pr-4
                    bg-muted/50 rounded-[var(--radius-md)]
                    text-sm text-foreground placeholder:text-muted-foreground
                    outline-none
                    transition-shadow duration-200
                    focus:shadow-[0_0_0_2px_hsl(var(--primary)/0.3)]
                  "
                                />
                            </div>
                        </div>

                        {error && (
                            <p className="text-xs text-destructive bg-destructive/5 p-2 rounded-[var(--radius-sm)]">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            loading={loading}
                            className="w-full gap-2"
                            size="lg"
                        >
                            Continue
                            <ArrowRight className="h-4 w-4" />
                        </Button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full h-px bg-gradient-to-r from-transparent via-foreground/5 to-transparent" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Or continue with
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full gap-3"
                            loading={googleLoading}
                            onClick={handleGoogleLogin}
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </Button>
                    </form>
                )}
            </GlassCard>

            <p className="text-center text-sm text-muted-foreground mt-6">
                Don&apos;t have an account?{" "}
                <Link
                    href="/signup"
                    className="text-foreground font-medium hover:underline underline-offset-4"
                >
                    Sign up
                </Link>
            </p>
        </>
    );
}
