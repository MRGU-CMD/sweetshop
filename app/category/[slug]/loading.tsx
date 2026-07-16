import { SkeletonBlock, ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SkeletonBlock className="h-4 w-36 mb-4 rounded" />
      <div className="flex gap-6">
        <aside className="hidden lg:block w-44 flex-shrink-0">
          <SkeletonBlock className="h-64 rounded-xl" />
        </aside>
        <div className="flex-1 min-w-0">
          <SkeletonBlock className="h-12 rounded-xl mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
