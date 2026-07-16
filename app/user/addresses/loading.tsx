import { SkeletonBlock } from "@/components/ui/Skeleton";

export default function AddressesLoading() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        <SkeletonBlock className="h-7 w-40" />
      </h1>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-50 p-4 space-y-2">
            <div className="flex justify-between">
              <SkeletonBlock className="h-4 w-20" />
              <SkeletonBlock className="h-5 w-12 rounded-full" />
            </div>
            <SkeletonBlock className="h-4 w-64" />
            <SkeletonBlock className="h-3 w-40" />
          </div>
        ))}
      </div>
    </div>
  );
}
