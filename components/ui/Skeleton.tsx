export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-skeleton rounded-lg ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-50">
      <SkeletonBlock className="aspect-square rounded-none" />
      <div className="p-3 space-y-2">
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
        <div className="flex items-baseline gap-2">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="h-4 w-12" />
        </div>
        <SkeletonBlock className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-50 p-5 flex items-center gap-4">
          <SkeletonBlock className="w-12 h-12 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4 w-3/4" />
            <SkeletonBlock className="h-3 w-1/4" />
          </div>
          <SkeletonBlock className="h-6 w-16" />
        </div>
      ))}
    </div>
  );
}
