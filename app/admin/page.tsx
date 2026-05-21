import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function AdminDashboard() {
  const [productCount, orderCount, userCount, revenueResult] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: "CANCELLED" } } }),
  ]);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { nickname: true } } },
  });

  const stats = [
    { label: "商品总数", value: productCount, icon: "/images/icon-products.svg", color: "from-blue-50 to-blue-100" },
    { label: "订单总数", value: orderCount, icon: "/images/icon-orders.svg", color: "from-green-50 to-green-100" },
    { label: "用户总数", value: userCount, icon: "/images/icon-users.svg", color: "from-purple-50 to-purple-100" },
    { label: "总营收", value: `¥${(revenueResult._sum.totalAmount || 0).toFixed(2)}`, icon: "/images/icon-revenue.svg", color: "from-sakura-50 to-sakura-100" },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    PENDING: { label: "待付款", color: "text-orange-500" },
    PAID: { label: "已付款", color: "text-blue-500" },
    SHIPPED: { label: "运输中", color: "text-purple-500" },
    RECEIVED: { label: "已收货", color: "text-green-500" },
    COMPLETED: { label: "已完成", color: "text-gray-400" },
    CANCELLED: { label: "已取消", color: "text-gray-300" },
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">📊 仪表盘</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-xl p-5`}>
            <img src={s.icon} alt="" className="w-10 h-10" />
            <p className="text-2xl font-bold text-gray-800 mt-3">{s.value}</p>
            <p className="text-sm text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-700 flex items-center gap-2"><img src="/images/icon-recent-orders.svg" alt="" className="w-8 h-8" />最近订单</h2>
          <Link href="/admin/orders" className="text-sm text-sakura-500 hover:underline">查看全部</Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b border-gray-50">
              <th className="pb-3 font-medium">订单号</th>
              <th className="pb-3 font-medium">用户</th>
              <th className="pb-3 font-medium">金额</th>
              <th className="pb-3 font-medium">状态</th>
              <th className="pb-3 font-medium">时间</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => {
              const st = statusLabels[o.status] || { label: o.status, color: "text-gray-400" };
              return (
                <tr key={o.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 text-gray-600">{o.orderNo}</td>
                  <td className="py-3 text-gray-600">{o.user.nickname}</td>
                  <td className="py-3 text-sakura-500 font-medium">¥{o.totalAmount.toFixed(2)}</td>
                  <td className={`py-3 ${st.color}`}>{st.label}</td>
                  <td className="py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString("zh-CN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
