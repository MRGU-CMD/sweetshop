import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        <SkeletonBlock className="h-7 w-32" />
      </h1>
      <div className="bg-white rounded-2xl border border-gray-50 p-6 space-y-5">
        <div className="flex items-start gap-5">
          <SkeletonBlock className="w-20 h-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <SkeletonBlock className="h-4 w-24" />
            <SkeletonBlock className="h-4 w-48" />
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between py-3">
            <div className="space-y-1">
              <SkeletonBlock className="h-3 w-16" />
              <SkeletonBlock className="h-5 w-40" />
            </div>
            <SkeletonBlock className="h-8 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
