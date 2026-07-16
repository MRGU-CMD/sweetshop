import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function CartLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <SkeletonBlock className="h-7 w-32 mb-6 rounded" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-50 p-4 flex items-center gap-4">
            <SkeletonBlock className="w-16 h-16 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-3/4" />
              <SkeletonBlock className="h-3 w-1/4" />
            </div>
            <SkeletonBlock className="h-6 w-16" />
            <SkeletonBlock className="h-6 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
