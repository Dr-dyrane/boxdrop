"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Shield, Mail, User, UserPlus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { provisionSystemMember } from "@/core/actions/admin-actions";
import { useMediaQuery } from "@/core/hooks";
import type { UserRole } from "@/types/database";

interface ProvisionUserModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProvisionUserModal({ isOpen, onClose }: ProvisionUserModalProps) {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [role, setRole] = useState<UserRole>("user");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await provisionSystemMember({ email, fullName, role });
            onClose();
            // Reset form
            setEmail("");
            setFullName("");
            setRole("user");
        } catch (err: any) {
            setError(err.message || "Failed to provision member");
        } finally {
            setLoading(false);
        }
    };

    const modalVariants: Variants = isMobile ? {
        initial: { y: "100%", opacity: 1 },
        animate: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", damping: 25, stiffness: 200 }
        },
        exit: {
            y: "100%",
            opacity: 1,
            transition: { type: "spring", damping: 25, stiffness: 200 }
        }
    } : {
        initial: { opacity: 0, scale: 0.95, y: 20 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 20 }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-md"
                    />

                    {/* Modal/Drawer Container */}
                    <motion.div
                        variants={modalVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className={`
                            relative z-[101] w-full 
                            ${isMobile
                                ? "mt-auto rounded-t-[2.5rem] p-0"
                                : "max-w-md p-0"
                            }
                            focus:outline-none
                        `}
                    >
                        {/* Content Card */}
                        <div className={`
                            glass-heavy border-foreground/5 overflow-hidden
                            ${isMobile
                                ? "rounded-t-[2.5rem] border-t"
                                : "rounded-[2.5rem] border shadow-2xl"
                            }
                        `}>
                            {/* Drag Indicator for Mobile */}
                            {isMobile && (
                                <div className="flex justify-center pt-4">
                                    <div className="w-12 h-1.5 rounded-full bg-foreground/10" />
                                </div>
                            )}

                            {/* Header */}
                            <div className={`${isMobile ? "p-8 pb-4" : "p-10 pb-4"}`}>
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20">
                                        <Shield className="w-5 h-5 text-primary" />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">Security Protocol</span>
                                </div>
                                <h2 className="text-3xl font-black tracking-tighter text-foreground">
                                    Provision <span className="text-muted-foreground italic font-medium">New Unit</span>
                                </h2>
                                <p className="text-xs text-muted-foreground/60 mt-2 font-medium">Enroll new network entity into oversight.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className={`${isMobile ? "p-8 pt-4 pb-12" : "p-10 pt-4"} space-y-6`}>
                                {error && (
                                    <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-xs font-bold">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="group relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none">
                                            <Mail className="w-4 h-4" />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="System Identifier (Email)"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full h-14 pl-12 pr-4 bg-foreground/5 border border-foreground/5 rounded-2xl text-sm transition-all focus:bg-foreground/10 focus:border-primary/20 outline-none placeholder:text-muted-foreground/40 text-foreground"
                                        />
                                    </div>

                                    <div className="group relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary pointer-events-none">
                                            <Shield className="w-4 h-4" />
                                        </div>
                                        <div className="relative">
                                            <select
                                                value={role}
                                                onChange={(e) => setRole(e.target.value as UserRole)}
                                                className="w-full h-14 pl-12 pr-4 bg-foreground/5 border border-foreground/5 rounded-2xl text-sm transition-all focus:bg-foreground/10 focus:border-primary/20 outline-none appearance-none cursor-pointer text-foreground"
                                            >
                                                <option value="user" className="bg-popover text-popover-foreground">Patron</option>
                                                <option value="vendor" className="bg-popover text-popover-foreground">Partner</option>
                                                <option value="courier" className="bg-popover text-popover-foreground">Unit (Courier)</option>
                                                <option value="support" className="bg-popover text-popover-foreground">LifeBuoy</option>
                                                <option value="admin" className="bg-popover text-popover-foreground">Oversight</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-15 rounded-2xl bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all"
                                    >
                                        {loading ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                                className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full"
                                            />
                                        ) : "Confirm Provision"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={onClose}
                                        className="w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
                                    >
                                        Abort Request
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
