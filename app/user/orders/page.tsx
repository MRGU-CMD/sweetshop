export const dynamic = "force-dynamic";
import OrderActions from "@/components/order/OrderActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待付款", color: "text-orange-500" },
  PAID: { label: "已付款", color: "text-blue-500" },
  SHIPPED: { label: "运输中", color: "text-purple-500" },
  RECEIVED: { label: "已收货", color: "text-green-500" },
  COMPLETED: { label: "已完成", color: "text-gray-400" },
  CANCELLED: { label: "已取消", color: "text-gray-300" },
};

export default async function UserOrdersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">📋 我的订单</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-400">暂无订单</p>
          <Link href="/" className="text-sakura-500 text-sm mt-2 inline-block hover:underline">
            去逛逛
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const status = statusLabels[order.status] || { label: order.status, color: "text-gray-400" };
            return (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">订单号：{order.orderNo}</span>
                    <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
                  </div>
                  <span className="text-xs text-gray-300">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                </div>

                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item) => {
                    const imgList = JSON.parse(item.product.images || "[]") as string[];
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-sakura-50 to-purple-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                          {imgList[0] ? (
                            <img src={imgList[0]} alt="" className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <span className="opacity-40">🧸</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600 flex-1 truncate">
                          {item.product.name}
                        </span>
                        <span className="text-xs text-gray-400">×{item.quantity}</span>
                        <span className="text-sm text-sakura-500 font-medium">
                          ¥{(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                  {order.items.length > 3 && (
                    <p className="text-xs text-gray-400 pl-14">
                      还有 {order.items.length - 3} 件...
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
                  <span className="text-sm text-gray-500">
                    共 {order.items.length} 件 · 合计
                    <span className="text-sakura-500 font-bold ml-1">¥{order.totalAmount.toFixed(2)}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <OrderActions orderId={order.id} status={order.status} />
                    <Link
                      href={`/user/orders/${order.id}`}
                      className="btn-sakura-outline text-xs px-4 py-2"
                    >
                      查看详情
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
