
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, CreditCard, Apple, CheckCircle2, Lock, ChevronRight } from "lucide-react";
import { Button, GlassCard } from "@/components/ui";
import { formatCurrency } from "@/core/utils";
import confetti from "canvas-confetti";

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    total: number;
}

export function CheckoutModal({ isOpen, onClose, onSuccess, total }: CheckoutModalProps) {
    const [step, setStep] = useState<"method" | "processing" | "success">("method");
    const [method, setMethod] = useState<"card" | "apple">("card");

    useEffect(() => {
        if (!isOpen) {
            setStep("method");
        }
    }, [isOpen]);

    const handlePay = () => {
        setStep("processing");
        // Simulate real transaction time
        setTimeout(() => {
            setStep("success");
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#ffffff", "#000000", "#22c55e"]
            });

            setTimeout(() => {
                onSuccess();
            }, 2000);
        }, 3000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-xl"
                    />

                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg glass-heavy rounded-[3rem] overflow-hidden shadow-[0_32px_128px_-16px_rgba(0,0,0,0.5)]"
                    >
                        <div className="p-8 sm:p-10 space-y-10">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Secure Settlement</p>
                                    <h2 className="text-3xl font-black tracking-tighter">
                                        {step === "success" ? "Payment Verified" : "Finalize Order"}
                                    </h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="h-10 w-10 rounded-full glass flex items-center justify-center hover:bg-foreground/5 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === "method" && (
                                    <motion.div
                                        key="method"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="bg-foreground/[0.02] p-6 rounded-[2rem] border border-foreground/5 space-y-4">
                                            <div className="flex justify-between items-end">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Total Amount</p>
                                                <p className="text-4xl font-black tracking-tighter">{formatCurrency(total)}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 px-1">Payment Method</p>

                                            <div className="grid grid-cols-1 gap-3">
                                                <button
                                                    onClick={() => setMethod("apple")}
                                                    className={`
                                                        w-full h-16 rounded-2xl flex items-center justify-between px-6 transition-all duration-300
                                                        ${method === "apple" ? "bg-foreground text-background" : "glass hover:bg-foreground/5"}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Apple className="h-5 w-5" />
                                                        <span className="text-sm font-black uppercase tracking-widest">Apple Pay</span>
                                                    </div>
                                                    {method === "apple" && <CheckCircle2 className="h-4 w-4" />}
                                                </button>

                                                <button
                                                    onClick={() => setMethod("card")}
                                                    className={`
                                                        w-full h-16 rounded-2xl flex items-center justify-between px-6 transition-all duration-300
                                                        ${method === "card" ? "bg-foreground text-background" : "glass hover:bg-foreground/5"}
                                                    `}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <CreditCard className="h-5 w-5" />
                                                        <span className="text-sm font-black uppercase tracking-widest">Credit Card</span>
                                                    </div>
                                                    {method === "card" && <CheckCircle2 className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {method === "card" && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                className="space-y-4 overflow-hidden"
                                            >
                                                <div className="h-14 glass rounded-2xl border border-foreground/5 flex items-center px-4 gap-4">
                                                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                                                    <input
                                                        disabled
                                                        placeholder="•••• •••• •••• 4242"
                                                        className="bg-transparent flex-1 text-sm font-bold placeholder:opacity-20"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="h-14 glass rounded-2xl border border-foreground/5 flex items-center px-4">
                                                        <input disabled placeholder="MM / YY" className="bg-transparent w-full text-sm font-bold placeholder:opacity-20" />
                                                    </div>
                                                    <div className="h-14 glass rounded-2xl border border-foreground/5 flex items-center px-4">
                                                        <input disabled placeholder="CVC" className="bg-transparent w-full text-sm font-bold placeholder:opacity-20" />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="pt-4 space-y-6">
                                            <Button
                                                onClick={handlePay}
                                                className="w-full h-16 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary/10"
                                            >
                                                Pay {formatCurrency(total)}
                                            </Button>

                                            <div className="flex items-center justify-center gap-2 text-muted-foreground/40">
                                                <Lock className="h-3 w-3" />
                                                <p className="text-[9px] font-black uppercase tracking-widest">End-to-end Encrypted Transaction</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {step === "processing" && (
                                    <motion.div
                                        key="processing"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 1.1 }}
                                        className="h-80 flex flex-col items-center justify-center space-y-8"
                                    >
                                        <div className="relative">
                                            <div className="h-20 w-20 rounded-[2rem] border-2 border-foreground/5 animate-spin duration-[3s]" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <ShieldCheck className="h-8 w-8 text-primary animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-sm font-black uppercase tracking-widest">Merchant Verification</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">Securing logistics tokens...</p>
                                        </div>
                                    </motion.div>
                                )}

                                {step === "success" && (
                                    <motion.div
                                        key="success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="h-80 flex flex-col items-center justify-center space-y-8"
                                    >
                                        <div className="h-24 w-24 rounded-[3rem] bg-success/10 flex items-center justify-center">
                                            <CheckCircle2 className="h-12 w-12 text-success" />
                                        </div>
                                        <div className="text-center space-y-2">
                                            <p className="text-2xl font-black tracking-tighter">Success!</p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Order logic initialized.</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
