"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Package, Truck, CheckCircle, Zap, AlertTriangle, Play, Pause, RefreshCw } from "lucide-react";
import { GlassCard, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { triggerSimulationOrder } from "@/core/actions/admin-actions";
import { useMediaQuery } from "@/core/hooks";

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
            await triggerSimulationOrder();
            console.log("Simulation Drop Triggered successfully.");
        } catch (err) {
            console.error("Failed to trigger simulation:", err);
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

    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <GlassCard className={`p-6 overflow-hidden border-foreground/5 ${isMobile ? 'rounded-[2rem]' : ''}`}>
            <div className={`flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'} mb-6`}>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Activity className="w-5 h-5 text-emerald-500" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tighter text-foreground leading-none">Logistics Pulse</h3>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Real-time Activity</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={triggerRandomDrop}
                        disabled={isTriggering}
                        className={`h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-foreground/5 ${isTriggering ? 'opacity-50' : ''}`}
                    >
                        {isTriggering ? 'Simulating...' : 'Trigger Simulation'}
                    </Button>
                </div>
            </div>

            <div className={`space-y-3 ${isMobile ? 'max-h-[300px]' : 'max-h-[400px]'} overflow-y-auto pr-2 custom-scrollbar`}>
                <AnimatePresence initial={false} mode="popLayout">
                    {events.map((event) => (
                        <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group"
                        >
                            <div className="flex gap-4 p-4 rounded-2xl bg-foreground/[0.03] border border-transparent group-hover:border-foreground/5 transition-all">
                                <div className={`mt-1 p-2 rounded-xl bg-opacity-10 shrink-0 ${event.type === 'order' ? 'bg-blue-500 text-blue-500' :
                                        event.type === 'alert' ? 'bg-amber-500 text-amber-500' :
                                            'bg-purple-500 text-purple-500'
                                    }`}>
                                    {event.type === 'order' ? <Package className="w-3.5 h-3.5" /> :
                                        event.type === 'alert' ? <AlertTriangle className="w-3.5 h-3.5" /> :
                                            <Activity className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-foreground leading-relaxed">
                                        {event.message}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <span className="text-[10px] font-black tabular-nums text-muted-foreground opacity-60">
                                            {getRelativeTime(event.created_at)}
                                        </span>
                                        <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                        <span className="text-[9px] uppercase tracking-widest font-black text-muted-foreground/50">
                                            {event.type}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {events.length === 0 && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="p-4 rounded-full bg-foreground/5 mb-4">
                            <Activity className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground italic">Awaiting network signals...</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-foreground/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground leading-none">Status</span>
                        <span className="text-[11px] font-black text-emerald-500 mt-1">Operational</span>
                    </div>
                </div>
                <div className="text-[10px] font-medium text-muted-foreground/40 italic">
                    v1.0.4 Oversight
                </div>
            </div>
        </GlassCard>
    );
}
