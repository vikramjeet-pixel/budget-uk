import { cn } from "@/lib/utils";

// ── Primitive ─────────────────────────────────────────────────────────────────

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("shimmer rounded", className)}
    />
  );
}

// ── SpotCard-shaped skeleton (matches h-24 w-24 thumb + 2 text lines) ─────────

export function SpotCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex gap-4 p-4 items-start bg-[#fcfbf8] border border-passive rounded-2xl"
    >
      <Skeleton className="h-24 w-24 shrink-0 rounded-sm" />
      <div className="flex flex-col gap-2.5 flex-1 pt-1">
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

// ── Submission-card skeleton (matches community feed cards ~h-40) ─────────────

export function SubmissionCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-3 p-5 bg-[#fcfbf8] border border-passive rounded-2xl"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2 flex-1">
          <Skeleton className="h-5 w-2/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full shrink-0" />
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-5/6" />
    </div>
  );
}

// ── Leaderboard row skeleton ──────────────────────────────────────────────────

export function LeaderboardRowSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-4 px-5 py-4 border-b border-passive"
    >
      <Skeleton className="h-4 w-6 shrink-0" />
      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-12 shrink-0" />
      <Skeleton className="h-4 w-8 shrink-0" />
    </div>
  );
}
