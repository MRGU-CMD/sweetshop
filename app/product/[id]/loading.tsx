import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <SkeletonBlock className="h-4 w-48 mb-6 rounded" />
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-[480px] flex-shrink-0">
          <SkeletonBlock className="aspect-square rounded-2xl" />
          <div className="flex gap-2 mt-3">
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="w-16 h-16 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-4">
          <SkeletonBlock className="h-8 w-3/4" />
          <SkeletonBlock className="h-4 w-24" />
          <div className="bg-sakura-50/50 rounded-xl p-5 space-y-3">
            <SkeletonBlock className="h-10 w-32" />
            <div className="flex gap-6">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-4 w-24" />
            </div>
          </div>
          <SkeletonBlock className="h-12 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
