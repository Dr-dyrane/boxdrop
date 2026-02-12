"use client";

import { ScreenShell } from "@/components/layout/screen-shell";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Truck, Tag, Info, CheckCircle2, ChevronRight, X, CheckCheck } from "lucide-react";
import { GlassCard, Button, Skeleton } from "@/components/ui";
import { useNotifications, useMarkAllRead, useDismissNotification } from "@/core/hooks";
import { cn, timeAgo } from "@/core/utils";


/* ─────────────────────────────────────────────────────
   NOTIFICATIONS PAGE
   Alert center.
   Aggregates system messages and order updates.
   ───────────────────────────────────────────────────── */

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20, transition: { duration: 0.2 } }
};


export default function NotificationsPage() {
    const { data: notifications, isLoading } = useNotifications();
    const { mutate: markAllRead } = useMarkAllRead();
    const { mutate: dismiss } = useDismissNotification();


    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return Truck;
            case 'promo': return Tag;
            case 'system': return Info;
            default: return Bell;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'order': return 'text-primary bg-primary/10';
            case 'promo': return 'text-orange-500 bg-orange-500/10';
            case 'system': return 'text-blue-500 bg-blue-500/10';
            default: return 'text-zinc-500 bg-zinc-500/10';
        }
    };

    return (
        <ScreenShell>
            <motion.div
                className="space-y-12 pb-24 max-w-4xl mx-auto"
                variants={container}
                initial="hidden"
                animate="show"
            >
                <motion.div variants={item} className="flex items-end justify-between">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tighter hidden md:block">Notifications.</h1>
                        <p className="text-sm font-medium text-muted-foreground">
                            System alerts and logistics updates.
                        </p>
                    </div>
                    {notifications?.some(n => !n.read) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAllRead()}
                            className="h-12 w-12 rounded-full glass hover:bg-white/10 text-primary active:scale-95 transition-all"
                            title="Mark all as read"
                        >
                            <CheckCheck className="h-6 w-6" />
                        </Button>
                    )}

                </motion.div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {isLoading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <GlassCard key={i} className="p-8 rounded-[4rem] animate-pulse">
                                    <div className="flex gap-6">
                                        <div className="h-12 w-12 rounded-2xl bg-foreground/5" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-32 bg-foreground/5 rounded" />
                                            <div className="h-3 w-full bg-foreground/5 rounded" />
                                        </div>
                                    </div>
                                </GlassCard>
                            ))
                        ) : notifications && notifications.length > 0 ? (
                            notifications.map((notif) => {
                                const Icon = getIcon(notif.type);
                                const colorClass = getColor(notif.type);

                                return (
                                    <motion.div
                                        key={notif.id}
                                        variants={item}
                                        layout
                                        initial="hidden"
                                        animate="show"
                                        exit="exit"
                                        className={cn(
                                            "relative group p-6 rounded-[2rem] border transition-all duration-300",
                                            notif.read ? "glass opacity-60 hover:opacity-100 border-white/5" : "glass-heavy border-primary/20 bg-primary/5 shadow-xl shadow-primary/5"
                                        )}
                                    >
                                        <div className="flex gap-6">
                                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shrink-0", colorClass)}>
                                                <Icon className="h-5 w-5" />
                                            </div>

                                            <div className="flex-1 min-w-0 py-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className={cn("text-xs font-black uppercase tracking-widest", notif.read ? "text-muted-foreground" : "text-foreground")}>
                                                        {notif.title}
                                                    </p>
                                                    <span className="text-[10px] font-bold text-muted-foreground/50">{timeAgo(notif.created_at)}</span>
                                                </div>
                                                <p className={cn("text-sm font-medium leading-relaxed", notif.read ? "text-muted-foreground" : "text-foreground/90")}>
                                                    {notif.message}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => dismiss(notif.id)}
                                                className="self-start p-2 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </div>

                                        {!notif.read && (
                                            <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </motion.div>
                                );
                            })

                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-20 text-muted-foreground"
                            >
                                <div className="h-20 w-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="h-8 w-8 opacity-20" />
                                </div>
                                <p className="text-sm font-medium">All caught up.</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </ScreenShell>
    );
}
