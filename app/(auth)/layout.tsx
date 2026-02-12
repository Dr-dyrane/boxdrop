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
                <Suspense fallback={<div className="h-20 flex items-center justify-center"><div className="h-6 w-6 border-2 border-primary border-t-transparent animate-spin rounded-full" /></div>}>
                    {children}
                </Suspense>
            </div>
        </div>
    );
}
