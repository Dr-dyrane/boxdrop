/* ─────────────────────────────────────────────────────
   UTILITY: Currency Formatter
   ───────────────────────────────────────────────────── */

export function formatCurrency(amount: number, currency = "NGN"): string {
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
    }).format(amount);
}

/* ─────────────────────────────────────────────────────
   UTILITY: Relative Time
   ───────────────────────────────────────────────────── */

export function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
}

/* ─────────────────────────────────────────────────────
   UTILITY: Class name merge
   ───────────────────────────────────────────────────── */

export function cn(...classes: (string | undefined | false)[]) {
    return classes.filter(Boolean).join(" ");
}

/* ─────────────────────────────────────────────────────
   UTILITY: Greeting based on time of day
   ───────────────────────────────────────────────────── */

export function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}
