export function Skeleton({ className = "" }) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-100/80 ${className}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]">
      <div className="flex items-start justify-between">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <Skeleton className="mt-6 h-4 w-24 rounded-md" />
      <Skeleton className="mt-3 h-9 w-20 rounded-lg" />
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <div className="flex items-center gap-4 border-b border-slate-100/80 px-5 py-4 last:border-0">
      <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
      {[...Array(cols - 1)].map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 rounded-md ${i === cols - 2 ? "ml-auto w-20" : i === 0 ? "w-1/4" : "w-1/5"}`}
        />
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-1/3 rounded-lg" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2.5">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-12 flex-1 rounded-xl" />
        <Skeleton className="h-12 flex-1 rounded-xl" />
      </div>
    </div>
  );
}

export function MemberCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-2/3 rounded-md" />
            <Skeleton className="h-3.5 w-1/2 rounded-md" />
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-5.5 w-16 rounded-full" />
          <Skeleton className="h-5.5 w-16 rounded-full" />
        </div>
      </div>
      <div className="mt-6 border-t border-slate-100/80 pt-4 flex items-center justify-between">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12 rounded-md" />
          <Skeleton className="h-4 w-8 rounded-md" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}

