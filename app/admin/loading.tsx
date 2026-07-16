import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        <SkeletonBlock className="h-7 w-32" />
      </h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 space-y-3">
            <SkeletonBlock className="w-10 h-10 rounded-lg" />
            <SkeletonBlock className="h-8 w-16" />
            <SkeletonBlock className="h-4 w-20" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-gray-50 p-6 space-y-3">
        <SkeletonBlock className="h-5 w-24" />
        {[1, 2, 3].map((i) => (
          <SkeletonBlock key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
