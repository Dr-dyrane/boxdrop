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
            <div className="w-full max-w-sm">{children}</div>
        </div>
    );
}
