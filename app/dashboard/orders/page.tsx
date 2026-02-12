"use client";

import { ScreenShell } from "@/components/layout/screen-shell";
import { GlassCard, Skeleton, SkeletonCard, SkeletonText } from "@/components/ui";
import Link from "next/link";
import { useOrders } from "@/core/hooks";
import { formatCurrency, timeAgo } from "@/core/utils";
import { ShoppingBag, Package, ChevronRight } from "lucide-react";

export default function OrdersPage() {
    const { data: orders, isLoading } = useOrders();

    if (isLoading) {
        return (
            <ScreenShell>
                <div className="space-y-6">
                    <div className="md:hidden h-2" />
                    <Skeleton className="h-8 w-32 ml-1" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="glass-heavy p-6 rounded-[2.5rem] flex flex-col gap-4">
                                <div className="flex items-center gap-4">
                                    <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-2/3" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-foreground/5 flex justify-between items-center">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ScreenShell>
        );
    }

    return (
        <ScreenShell>
            <div className="space-y-8">
                <div className="md:hidden h-2" /> {/* Mobile spacer */}

                <div className="flex items-center justify-between px-1">
                    <h1 className="text-2xl font-black tracking-tight">Your Orders</h1>
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">{orders?.length || 0} total</p>
                </div>

                {!orders || orders.length === 0 ? (
                    <div className="glass rounded-[2rem] p-12 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-2xl bg-muted/20 flex items-center justify-center">
                            <ShoppingBag className="h-7 w-7 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-bold text-lg">No orders yet</p>
                            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                                When you place your first order, it will appear here with real-time tracking.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {orders.map((order) => (
                            <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                                <GlassCard
                                    interactive
                                    className="flex flex-col gap-5 p-6 rounded-[2.5rem] h-full"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center shrink-0">
                                                <Package className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-bold truncate text-sm">
                                                    Order #{order.id.slice(0, 8)}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                                                    {timeAgo(order.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-20" />
                                    </div>

                                    <div className="mt-auto pt-5 border-t border-foreground/5 flex items-center justify-between">
                                        <p className="text-sm font-black">
                                            {formatCurrency(order.total)}
                                        </p>
                                        <span className={`
                                            text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full
                                            ${order.status === 'delivered'
                                                ? 'bg-success/10 text-success'
                                                : order.status === 'pending'
                                                    ? 'bg-warning/10 text-warning'
                                                    : 'bg-primary text-background'}
                                        `}>
                                            {order.status}
                                        </span>
                                    </div>
                                </GlassCard>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </ScreenShell>
    );
}
