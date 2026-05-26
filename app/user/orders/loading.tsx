import { ListSkeleton } from "@/components/ui/Skeleton";

export default function OrdersLoading() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">📋 我的订单</h1>
      <ListSkeleton rows={4} />
    </div>
  );
}
