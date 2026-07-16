import { SkeletonBlock, ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SkeletonBlock className="h-4 w-36 mb-4 rounded" />
      <SkeletonBlock className="h-12 rounded-xl mb-4" />
      <SkeletonBlock className="h-5 w-48 mb-4 rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
