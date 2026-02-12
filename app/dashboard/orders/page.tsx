"use client";

import { motion } from "framer-motion";
import { ScreenShell } from "@/components/layout/screen-shell";
import { GlassCard, Skeleton, SkeletonCard, Button } from "@/components/ui";
import Link from "next/link";
import { useOrders } from "@/core/hooks";
import { formatCurrency, timeAgo, cn } from "@/core/utils";
import { ShoppingBag, Package, ChevronRight, Clock, CheckCircle2, AlertCircle, History } from "lucide-react";

/* ─────────────────────────────────────────────────────
   ORDERS PAGE — Transaction History
   Premium log of marketplace interactions.
   Refined cards with clear status hierarchy and 
   spatial clarity.
   ───────────────────────────────────────────────────── */

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const },
    },
} as const;

export default function OrdersPage() {
    const { data: orders, isLoading } = useOrders();

    if (isLoading) {
        return (
            <ScreenShell>
                <div className="space-y-10">
                    <div className="md:hidden h-2" />
                    <Skeleton className="h-12 w-64" />
                    <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} className="h-72 rounded-[3rem]" />
                        ))}
                    </div>
                </div>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell>
            <motion.div
                className="space-y-12 pb-24"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <div className="md:hidden h-2" />

                <motion.div variants={staggerItem} className="flex items-center justify-between px-1">
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter leading-tight">Order Logs.</h1>
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-3 opacity-40">
                            Transaction Intelligence / {orders?.length || 0} Successful Cycles
                        </p>
                    </div>
                    <div className="h-12 w-12 rounded-full glass flex items-center justify-center">
                        <History className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                </motion.div>

                {!orders || orders.length === 0 ? (
                    <motion.div
                        variants={staggerItem}
                        className="glass-heavy rounded-[3.5rem] p-24 flex flex-col items-center justify-center text-center space-y-8 border border-white/5"
                    >
                        <div className="h-24 w-24 rounded-[2.5rem] bg-primary/5 flex items-center justify-center relative">
                            <Package className="h-10 w-10 text-muted-foreground/20" />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute inset-0 rounded-[2.5rem] border border-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black tracking-tighter">No active logs</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mx-auto font-medium leading-relaxed">
                                Your order history is currently empty. Initiate a transaction in the marketplace to see your logistics trail here.
                            </p>
                        </div>
                        <Link href="/dashboard">
                            <Button className="h-14 px-8 rounded-full font-black text-xs uppercase tracking-widest">
                                Explore Discovery
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
                        {orders.map((order) => (
                            <motion.div key={order.id} variants={staggerItem} whileHover={{ y: -4 }}>
                                <Link href={`/dashboard/orders/${order.id}`}>
                                    <GlassCard
                                        interactive
                                        className="flex flex-col gap-8 p-8 rounded-[3rem] h-full group border border-transparent hover:border-white/10 shadow-2xl shadow-black/5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-center gap-5 min-w-0">
                                                <div className="h-16 w-16 rounded-[1.8rem] bg-primary/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                                    <Package className="h-7 w-7" />
                                                </div>
                                                <div className="min-w-0 space-y-1">
                                                    <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] opacity-40">
                                                        Log ID: {order.id.slice(0, 8)}
                                                    </p>
                                                    <h3 className="font-black text-xl truncate tracking-tighter">
                                                        Supply Dispatch
                                                    </h3>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3 text-muted-foreground/40" />
                                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                            {timeAgo(order.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>

                                        <div className="flex items-end justify-between pt-8 border-t border-white/5 mt-auto">
                                            <div className="space-y-1">
                                                <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-40">Settlement Total</p>
                                                <p className="text-2xl font-black tracking-tighter">
                                                    {formatCurrency(order.total)}
                                                </p>
                                            </div>

                                            <div className={cn(
                                                "px-5 py-2.5 rounded-2xl flex items-center gap-2 border shadow-xl",
                                                order.status === 'delivered'
                                                    ? 'bg-success/10 text-success border-success/20'
                                                    : order.status === 'pending'
                                                        ? 'bg-warning/10 text-warning border-warning/20'
                                                        : 'bg-primary/10 text-primary border-primary/20'
                                            )}>
                                                {order.status === 'delivered' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </GlassCard>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}

                <motion.div variants={staggerItem} className="glass p-8 rounded-[3rem] border border-white/5 opacity-40 flex flex-col md:flex-row items-center justify-between gap-6">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Transaction Registry v2.4</p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Tracking active for {orders?.filter(o => o.status !== 'delivered').length || 0} cycles</p>
                </motion.div>
            </motion.div>
        </ScreenShell>
    );
}
