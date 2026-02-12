"use client";

import { ScreenShell } from "@/components/layout/screen-shell";
import { GlassCard, Skeleton, SkeletonCard, SkeletonText } from "@/components/ui";
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
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="glass-heavy p-4 rounded-[2rem] flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-[var(--radius-md)] shrink-0" />
                                <div className="flex-1 space-y-3">
                                    <div className="flex justify-between">
                                        <Skeleton className="h-4 w-1/3" />
                                        <Skeleton className="h-4 w-16 rounded-full" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton className="h-3 w-20" />
                                        <Skeleton className="h-3 w-12" />
                                    </div>
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
            <div className="space-y-6">
                <div className="md:hidden h-2" /> {/* Mobile spacer */}

                {!orders || orders.length === 0 ? (
                    <div className="glass rounded-[var(--radius-lg)] p-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium">No orders yet</p>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            When you place your first order, it will appear here with real-time tracking.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {orders.map((order) => (
                            <GlassCard
                                key={order.id}
                                interactive
                                className="flex items-center gap-4 cursor-pointer"
                            >
                                <div className="h-12 w-12 rounded-[var(--radius-md)] bg-primary/5 flex items-center justify-center shrink-0">
                                    <Package className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-medium truncate text-sm">
                                            Order #{order.id.slice(0, 8)}
                                        </p>
                                        <span className={`
                                            text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full
                                            ${order.status === 'delivered' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}
                                        `}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                            {timeAgo(order.created_at)}
                                        </p>
                                        <span className="text-muted-foreground/30 text-xs text-center">•</span>
                                        <p className="text-xs font-bold">
                                            {formatCurrency(order.total)}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            </GlassCard>
                        ))}
                    </div>
                )}
            </div>
        </ScreenShell>
    );
}
