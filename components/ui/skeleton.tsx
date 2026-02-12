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

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
    return (
        <div className={`space-y-3 ${className}`}>
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
        <div className={`glass-heavy rounded-[2.5rem] p-3 space-y-3 ${className}`}>
            <Skeleton className="h-full w-full rounded-[2.2rem]" />
        </div>
    );
}

export function SkeletonPill({ className = "" }: { className?: string }) {
    return <Skeleton className={`h-10 w-28 rounded-full ${className}`} />;
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const sizeMap = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-14 w-14" };
    return <Skeleton className={`${sizeMap[size]} rounded-full`} />;
}

/** High-density bento skeleton for stats */
export function SkeletonBento({ className = "" }: { className?: string }) {
    return (
        <div className={`glass-heavy p-5 rounded-3xl space-y-4 ${className}`}>
            <Skeleton className="h-10 w-10 rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
            </div>
        </div>
    );
}
