import { ListSkeleton } from "@/components/ui/Skeleton";

export default function UserLoading() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6 h-8 w-40">
        <span className="inline-block bg-gray-200 rounded-lg animate-skeleton w-32 h-full" />
      </h1>
      <ListSkeleton rows={4} />
    </div>
  );
}
