/* ─────────────────────────────────────────────────────
   UTILITY: Currency Formatter
   ───────────────────────────────────────────────────── */

export function formatCurrency(amount: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
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

/* ─────────────────────────────────────────────────────
   UTILITY: Logistics Calculation
   ───────────────────────────────────────────────────── */

export function calculateDeliveryTime(distMeters: number | null | undefined): string {
    if (distMeters === undefined || distMeters === null) return "25-35m";
    // Avg speed 30km/h = 500m/min. + 10m prep time.
    const travelMins = Math.ceil(distMeters / 500);
    const totalMins = travelMins + 10;
    return `${totalMins}-${totalMins + 10}m`;
}

export function formatDistance(distMeters: number | null | undefined): string {
    if (distMeters === undefined || distMeters === null) return "Nearby";
    if (distMeters < 1000) return `${Math.round(distMeters)}m`;
    return `${(distMeters / 1000).toFixed(1)}km`;
}

