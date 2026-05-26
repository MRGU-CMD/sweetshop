import { ListSkeleton } from "@/components/ui/Skeleton";
import { OrdersIcon } from "@/components/user/UserIcons";

export default function OrdersLoading() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><OrdersIcon /> 我的订单</h1>
      <ListSkeleton rows={4} />
    </div>
  );
}
