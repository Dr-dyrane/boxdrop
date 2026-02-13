"use client";

import { useAuth } from "@/core/hooks";
import { Shield, ArrowLeft, Activity, RefreshCw, UserPlus, Filter } from "lucide-react";
import Link from "next/link";
import { GlassCard, Button } from "@/components/ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AdminUserTable } from "@/components/dashboard/admin/user-table";
import { LogisticsPulse } from "@/components/admin/logistics-pulse";

export default function AdminDashboard() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push("/dashboard");
        }
    }, [isAdmin, loading, router]);

    if (loading || !isAdmin) return null;

    return (
        <div className="min-h-screen bg-black text-white p-6 pb-24 lg:p-12">
            {/* 1. Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Link href="/dashboard" className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors text-zinc-500 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Oversight Layer</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tighter">
                        Logistics <span className="text-zinc-500 italic font-medium">Command Center</span>
                    </h1>
                </div>
            </div>

            {/* 2. Oversight Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Real-time Logistics Pulse */}
                <div className="lg:col-span-12 xl:col-span-4">
                    <LogisticsPulse />
                </div>

                {/* Network Units Management */}
                <div className="lg:col-span-12 xl:col-span-8">
                    <GlassCard className="p-8 border-white/5 bg-black/40">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <Shield className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-white">Network Units</h2>
                                    <p className="text-zinc-500 italic text-sm">Active Logistics Entities</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" size="sm" className="border-white/10">
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filter
                                </Button>
                                <Button size="sm" className="bg-white text-black hover:bg-zinc-200">
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Provision
                                </Button>
                            </div>
                        </div>

                        <AdminUserTable />
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
