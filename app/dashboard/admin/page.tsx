"use client";

import { useAuth } from "@/core/hooks";
import { AdminUserTable } from "@/components/dashboard/admin/user-table";
import { Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminDashboardPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/dashboard");
        }
    }, [isAdmin, loading, router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="sm" className="gap-2 -ml-2 opacity-60 hover:opacity-100">
                            <ArrowLeft className="h-3 w-3" />
                            Return to Hub
                        </Button>
                    </Link>
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">Oversight Hub</h1>
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Manage network units and system privileges.</p>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase">System Integrity</span>
                        <span className="text-xs font-bold text-success">Verified Optimal</span>
                    </div>
                    <div className="h-8 w-px bg-foreground/5 hidden md:block" />
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black tracking-[0.2em] text-muted-foreground/40 uppercase">Current Session</span>
                        <span className="text-xs font-bold">Network Admin</span>
                    </div>
                </div>
            </div>

            {/* ── User Management ────────────────────────── */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black tracking-tight">Active Enrollment</h2>
                    <span className="text-[10px] bg-primary text-primary-foreground px-3 py-1 rounded-full font-black uppercase tracking-widest">
                        Authority Level 3
                    </span>
                </div>

                <AdminUserTable />
            </div>
        </div>
    );
}
