import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function FavoritesLoading() {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">❤️ 我的收藏</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
