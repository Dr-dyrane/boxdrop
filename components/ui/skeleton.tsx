/* ─────────────────────────────────────────────────────
   SKELETON
   Shimmer loader that matches content shape.
   Never use spinners. This is The BoxDrop Law.
   ───────────────────────────────────────────────────── */

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
    return <div className={`skeleton ${className}`} />;
}

/* Preset skeleton shapes */

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
                />
            ))}
        </div>
    );
}

export function SkeletonCard({ className = "" }: { className?: string }) {
    return (
        <div className={`glass rounded-[var(--radius-lg)] p-4 space-y-3 ${className}`}>
            <Skeleton className="h-40 w-full rounded-[var(--radius-md)]" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
        </div>
    );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeMap = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
    return <Skeleton className={`${sizeMap[size]} rounded-full`} />;
}
