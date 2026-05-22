export const dynamic = "force-dynamic";
import OrderActions from "@/components/order/OrderActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { ORDER_STATUS } from "@/lib/constants";

export default async function UserOrdersPage(props: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const take = 10;
  const skip = (page - 1) * take;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.order.count({ where: { userId: session.user.id } }),
  ]);
  const totalPages = Math.ceil(total / take);

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
            const status = ORDER_STATUS[order.status] || { label: order.status, color: "text-gray-400" };
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
                        <div className="relative w-12 h-12 bg-gradient-to-br from-sakura-50 to-purple-50 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                          {imgList[0] ? (
                            <Image src={imgList[0]} alt="" fill className="object-cover rounded-lg" sizes="48px" />
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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              href={`/user/orders?page=${i + 1}`}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center ${
                page === i + 1
                  ? "bg-sakura-500 text-white"
                  : "bg-white text-gray-600 border border-gray-100 hover:border-sakura-300"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
