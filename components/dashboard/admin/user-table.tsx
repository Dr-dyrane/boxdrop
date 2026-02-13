"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Filter,
    MoreHorizontal,
    Shield,
    User as UserIcon,
    Store,
    Truck,
    LifeBuoy,
    Check
} from "lucide-react";
import { userService } from "@/core/services/user-service";
import { useMediaQuery } from "@/core/hooks";
import { Button, GlassCard, Skeleton } from "@/components/ui";
import type { Profile, UserRole } from "@/types/database";

const ROLE_ICONS: Record<UserRole, any> = {
    user: UserIcon,
    vendor: Store,
    courier: Truck,
    admin: Shield,
    support: LifeBuoy
};

const ROLE_COLORS: Record<UserRole, string> = {
    user: "text-muted-foreground",
    vendor: "text-blue-500",
    courier: "text-success",
    admin: "text-primary",
    support: "text-amber-500"
};

interface AdminUserTableProps {
    search?: string;
    roleFilter?: UserRole | "all";
}

export function AdminUserTable({ search: externalSearch, roleFilter: externalRoleFilter }: AdminUserTableProps) {
    const queryClient = useQueryClient();
    const [internalSearch, setInternalSearch] = useState("");
    const [internalRoleFilter, setInternalRoleFilter] = useState<UserRole | "all">("all");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const search = externalSearch ?? internalSearch;
    const roleFilter = externalRoleFilter ?? internalRoleFilter;
    const setSearch = setInternalSearch;
    const setRoleFilter = setInternalRoleFilter;

    const { data: users, isLoading } = useQuery({
        queryKey: ["admin", "users"],
        queryFn: () => userService.getAllProfiles(),
    });

    const mutation = useMutation({
        mutationFn: ({ userId, role }: { userId: string, role: UserRole }) =>
            userService.updateRole(userId, role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            setUpdatingId(null);
        }
    });

    const filteredUsers = users?.filter(u => {
        const matchesSearch =
            u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase());
        const matchesRole = roleFilter === "all" || u.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const isMobile = useMediaQuery("(max-width: 768px)");

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className={`w-full rounded-[2rem] ${isMobile ? 'h-32' : 'h-20'}`} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* ── Header & Filters (Desktop only, or optimized for mobile) ────────────────────────── */}
            {(!externalSearch && !externalRoleFilter) && (
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search units..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="
                                w-full h-12 pl-12 pr-4 bg-foreground/5 dark:bg-white/5 
                                rounded-2xl text-sm outline-none transition-shadow
                                focus:shadow-[0_0_0_2px_hsl(var(--primary)/0.1)]
                            "
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
                        {(["all", "admin", "vendor", "courier", "support", "user"] as const).map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`
                                    h-10 px-5 rounded-full text-[10px] font-black uppercase tracking-widest
                                    transition-all shrink-0
                                    ${roleFilter === role
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-foreground/5 dark:bg-white/5 text-muted-foreground hover:text-foreground"
                                    }
                                `}
                            >
                                {role === "all" ? "Every Unit" : role}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Table / Grid ────────────────────────────── */}
            <div className={`grid grid-cols-1 ${isMobile ? 'gap-4' : 'gap-3'}`}>
                <AnimatePresence mode="popLayout">
                    {filteredUsers?.map((user) => (
                        <motion.div
                            key={user.id}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="group relative overflow-hidden"
                        >
                            <div className={`
                                flex ${isMobile ? 'flex-col gap-4' : 'items-center justify-between'} p-6 
                                glass-heavy rounded-[2rem] border border-foreground/5 
                                transition-all hover:border-primary/20
                            `}>
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-foreground/5 flex items-center justify-center shrink-0">
                                        {user.avatar_url ? (
                                            <img src={user.avatar_url} alt="" className="h-full w-full object-cover rounded-2xl" />
                                        ) : (
                                            <ROLE_ICONS.user className="h-6 w-6 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-black text-base leading-none text-foreground truncate">
                                            {user.full_name || "Anonymous Unit"}
                                        </span>
                                        <span className="text-xs text-muted-foreground/60 font-medium truncate mt-1">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>

                                <div className={`flex items-center ${isMobile ? 'justify-between' : 'gap-6'}`}>
                                    {/* Role Badge / Switch */}
                                    <div className={`relative ${isMobile ? 'flex-1 mr-4' : ''}`}>
                                        <select
                                            value={user.role}
                                            disabled={updatingId === user.id}
                                            onChange={(e) => {
                                                setUpdatingId(user.id);
                                                mutation.mutate({ userId: user.id, role: e.target.value as UserRole });
                                            }}
                                            className={`
                                                appearance-none cursor-pointer
                                                pl-10 pr-10 h-11 rounded-2xl w-full
                                                text-[10px] font-black uppercase tracking-widest
                                                bg-foreground/5 border border-foreground/5
                                                hover:border-primary/20 outline-none transition-all
                                                ${ROLE_COLORS[user.role]}
                                            `}
                                        >
                                            <option value="user" className="bg-popover text-popover-foreground">Patron</option>
                                            <option value="vendor" className="bg-popover text-popover-foreground">Partner</option>
                                            <option value="courier" className="bg-popover text-popover-foreground">Unit</option>
                                            <option value="support" className="bg-popover text-popover-foreground">LifeBuoy</option>
                                            <option value="admin" className="bg-popover text-popover-foreground">Oversight</option>
                                        </select>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            {(() => {
                                                const Icon = ROLE_ICONS[user.role];
                                                return <Icon className={`h-3.5 w-3.5 ${ROLE_COLORS[user.role]}`} />;
                                            })()}
                                        </div>
                                        <MoreHorizontal className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30 pointer-events-none" />
                                    </div>

                                    {/* Status / Date */}
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="text-[9px] font-black tracking-widest text-muted-foreground opacity-40 uppercase">Enrolled</span>
                                        <span className="text-[11px] font-bold tabular-nums text-foreground">
                                            {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Loading Overlay */}
                            {updatingId === user.id && (
                                <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-[2rem] flex items-center justify-center z-10">
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
                                    />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredUsers?.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="h-16 w-16 bg-foreground/5 mx-auto rounded-full flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">No matching units found in network</p>
                </div>
            )}
        </div>
    );
}
