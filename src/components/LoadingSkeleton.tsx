import { SKELETON_CARD_COUNT } from '@/constants';

function SkeletonCard() {
  return (
    <article
      className="overflow-hidden rounded-2xl border border-white/5 bg-bg-card"
      aria-hidden="true"
    >
      <div className="aspect-[2/3] animate-pulse bg-white/5" />
      <div className="space-y-3 p-4">
        <div className="h-5 w-3/4 animate-pulse rounded bg-white/5" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-white/5" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-white/5" />
          <div className="h-6 w-12 animate-pulse rounded bg-white/5" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-white/5" />
          <div className="h-3 w-full animate-pulse rounded bg-white/5" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-white/5" />
        </div>
        <div className="h-10 w-full animate-pulse rounded-lg bg-white/5" />
      </div>
    </article>
  );
}

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = SKELETON_CARD_COUNT }: LoadingSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading dramas"
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
      <span className="sr-only">Loading dramas…</span>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div role="status" aria-label="Loading drama details">
      <div className="aspect-[21/9] animate-pulse rounded-2xl bg-white/5" />
      <div className="mt-8 space-y-4">
        <div className="h-10 w-2/3 animate-pulse rounded bg-white/5" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-white/5" />
        <div className="h-32 w-full animate-pulse rounded-xl bg-white/5" />
      </div>
      <span className="sr-only">Loading drama details…</span>
    </div>
  );
}
