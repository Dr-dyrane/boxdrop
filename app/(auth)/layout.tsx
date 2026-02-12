import { Suspense } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Welcome",
};

/* ─────────────────────────────────────────────────────
   AUTH LAYOUT
   Clean. No tab bar. Centered content.
   ───────────────────────────────────────────────────── */

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-[100dvh] flex items-center justify-center px-4">
            <div className="w-full max-w-sm">
                <Suspense fallback={<div className="space-y-4 py-8"><div className="h-8 w-3/4 mx-auto skeleton" /><div className="h-12 skeleton" /><div className="h-12 skeleton" /></div>}>
                    {children}
                </Suspense>
            </div>
        </div>
    );
}
