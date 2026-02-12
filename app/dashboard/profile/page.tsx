"use client";

import Image from "next/image";
import { ScreenShell } from "@/components/layout/screen-shell";
import { GlassCard, Button } from "@/components/ui";
import { useThemeStore } from "@/core/store";
import { useAuth } from "@/core/hooks";
import { User, Moon, Sun, LogOut, ChevronRight } from "lucide-react";
import { SkeletonAvatar } from "@/components/ui/skeleton";

export default function ProfilePage() {
    const { theme, setTheme } = useThemeStore();
    const { profile, user, loading, signOut } = useAuth();

    if (loading) {
        return (
            <ScreenShell loading>
                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 glass rounded-[var(--radius-lg)]">
                        <SkeletonAvatar size="lg" />
                        <div className="space-y-2">
                            <div className="h-4 w-32 skeleton" />
                            <div className="h-3 w-48 skeleton" />
                        </div>
                    </div>
                </div>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell>
            <div className="space-y-6">
                <div className="md:hidden h-2" /> {/* Mobile spacer */}

                {/* ── User Card ──────────────────────────────── */}
                <GlassCard className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        {profile?.avatar_url ? (
                            <Image
                                src={profile.avatar_url}
                                alt={profile.full_name || "Profile"}
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-6 w-6 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold">{profile?.full_name || user?.email || "User"}</p>
                        <p className="text-sm text-muted-foreground truncate">{user?.email || "No email"}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </GlassCard>

                {/* ── Settings ───────────────────────────────── */}
                <div className="space-y-2">
                    <h2 className="text-sm font-medium text-muted-foreground px-1">
                        Preferences
                    </h2>

                    <GlassCard
                        interactive
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() =>
                            setTheme(theme === "dark" ? "light" : "dark")
                        }
                    >
                        <div className="flex items-center gap-3">
                            {theme === "dark" ? (
                                <Moon className="h-4 w-4 text-muted-foreground" />
                            ) : (
                                <Sun className="h-4 w-4 text-muted-foreground" />
                            )}
                            <span className="text-sm font-medium">
                                {theme === "dark" ? "Dark Mode" : "Light Mode"}
                            </span>
                        </div>
                        <div className="h-5 w-9 rounded-full bg-primary/20 relative">
                            <div
                                className={`
                  absolute top-0.5 h-4 w-4 rounded-full bg-foreground
                  transition-transform duration-200
                  ${theme === "dark" ? "translate-x-4" : "translate-x-0.5"}
                `}
                            />
                        </div>
                    </GlassCard>
                </div>

                {/* ── Sign Out ───────────────────────────────── */}
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive"
                    onClick={signOut}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </ScreenShell>
    );
}
