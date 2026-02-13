"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Package, Truck, CheckCircle, Zap, AlertTriangle, Play, Pause, RefreshCw } from "lucide-react";
import { GlassCard, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

/* ─────────────────────────────────────────────────────
   HELPER: RELATIVE TIME
   Native alternative to date-fns.
   ───────────────────────────────────────────────────── */
function getRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    const minutes = Math.floor(diffInSeconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
}

/* ─────────────────────────────────────────────────────
   LOGISTICS PULSE COMPONENT
   Real-time oversight for the BoxDrop network.
   ───────────────────────────────────────────────────── */

interface PulseEvent {
    id: string;
    type: 'order' | 'system' | 'alert';
    title: string;
    message: string;
    status?: string;
    created_at: string;
}

export function LogisticsPulse() {
    const supabase = createClient();
    const [events, setEvents] = useState<PulseEvent[]>([]);
    const [isTriggering, setIsTriggering] = useState(false);

    // 1. Initial Fetch
    useEffect(() => {
        async function fetchInitial() {
            const { data } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);

            if (data) setEvents(data as any);
        }
        fetchInitial();
    }, []);

    // 2. Real-time Subscription
    useEffect(() => {
        const channel = supabase
            .channel('logistics_pulse')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications'
            }, (payload) => {
                setEvents(prev => [payload.new as PulseEvent, ...prev].slice(0, 15));
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const triggerRandomDrop = async () => {
        setIsTriggering(true);
        try {
            // This would call an API route or server action to trigger the seed logic
            // For now, we simulate the effect by hitting an edge case or specific endpoint if it existed
            console.log("Triggering Random Drop...");
            // In a real app, this would be: await fetch('/api/admin/trigger-drop', { method: 'POST' });
        } finally {
            setTimeout(() => setIsTriggering(false), 1000);
        }
    };

    const getStatusIcon = (status: string = 'order') => {
        switch (status) {
            case 'delivered': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'picked_up': return <Truck className="w-4 h-4 text-blue-400" />;
            case 'alert': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
            default: return <Package className="w-4 h-4 text-purple-400" />;
        }
    };

    return (
        <GlassCard className="p-6 overflow-hidden border-white/5 bg-black/40">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Activity className="w-5 h-5 text-emerald-400" />
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-white">Logistics Pulse</h3>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Network Vital Signs</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-zinc-400 hover:text-white"
                        onClick={triggerRandomDrop}
                        disabled={isTriggering}
                    >
                        <Zap className={`w-4 h-4 mr-2 ${isTriggering ? 'animate-bounce' : ''}`} />
                        Random Drop
                    </Button>
                    <div className="h-4 w-[1px] bg-white/10 mx-1" />
                    <Button variant="secondary" size="sm" className="border-white/10">
                        <Activity className="w-4 h-4 mr-2" />
                        Metrics
                    </Button>
                </div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence initial={false}>
                    {events.length === 0 ? (
                        <div className="py-12 text-center">
                            <RefreshCw className="w-8 h-8 text-zinc-700 mx-auto mb-3 animate-spin" />
                            <p className="text-sm text-zinc-500">Awaiting Signal...</p>
                        </div>
                    ) : (
                        events.map((event) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-start gap-4 p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] transition-colors"
                            >
                                <div className="mt-1 p-2 rounded-md bg-black/40 border border-white/10">
                                    {getStatusIcon(event.type === 'order' ? event.title.toLowerCase().split(' ').pop() : 'default')}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-white truncate">{event.title}</p>
                                        <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                                            {getRelativeTime(event.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-400 truncate">{event.message}</p>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-tighter">
                <span>Active Cycles: {events.length}</span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Engine Synchronized
                </span>
            </div>
        </GlassCard>
    );
}
