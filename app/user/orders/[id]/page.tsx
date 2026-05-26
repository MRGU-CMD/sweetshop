export const dynamic = "force-dynamic";
import OrderActions from "@/components/order/OrderActions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { ORDER_STATUS } from "@/lib/constants";
import { PackageIcon, AddressesIcon, MoneyIcon, OrdersIcon } from "@/components/user/UserIcons";

function buildTimeline(order: any) {
  const items: { time: string; text: string; active: boolean }[] = [];

  items.push({
    time: new Date(order.createdAt).toLocaleString("zh-CN"),
    text: "订单已提交",
    active: true,
  });

  if (order.status === "CANCELLED") {
    items.push({ time: new Date(order.updatedAt).toLocaleString("zh-CN"), text: "订单已取消", active: true });
    return items;
  }

  if (order.paidAt) {
    items.push({
      time: new Date(order.paidAt).toLocaleString("zh-CN"),
      text: "已付款",
      active: true,
    });
  }

  if (order.shippedAt) {
    items.push({
      time: new Date(order.shippedAt).toLocaleString("zh-CN"),
      text: order.logisticsCompany
        ? `${order.logisticsCompany} 已揽件`
        : "已发货",
      active: true,
    });
  } else if (order.status === "SHIPPED" || order.status === "RECEIVED" || order.status === "COMPLETED") {
    items.push({ time: "", text: "等待发货...", active: false });
  }

  if (order.receivedAt) {
    items.push({
      time: new Date(order.receivedAt).toLocaleString("zh-CN"),
      text: "已确认收货",
      active: true,
    });
  }

  if (order.status === "COMPLETED") {
    items.push({ time: "", text: "订单已完成", active: true });
  }

  return items;
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: { include: { product: true } },
    },
  });

  if (!order) notFound();
  const status = ORDER_STATUS[order.status] || { label: order.status, color: "text-gray-400" };
  const address = JSON.parse(order.address || "{}");
  const timeline = buildTimeline(order);

  return (
    <div className="max-w-3xl mx-auto px-0 py-0">
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-sakura-500">首页</Link>
          <span className="mx-2">/</span>
          <Link href="/user/orders" className="hover:text-sakura-500">我的订单</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">订单详情</span>
        </div>

        <div className="bg-white rounded-2xl border border-gray-50 p-6 mb-4">
          <div className="flex items-center gap-3 mb-2">
            <PackageIcon className="w-6 h-6" />
            <span className="text-lg font-bold text-gray-800">{status.label}</span>
          </div>
          {order.status === "SHIPPED" && (
            <p className="text-sm text-gray-400">快递运输中，请耐心等待</p>
          )}
          {order.status === "PAID" && (
            <p className="text-sm text-gray-400">等待商家发货</p>
          )}

          {timeline.length > 1 && (
            <div className="mt-5 pl-2">
              {timeline.map((log, i) => (
                <div key={i} className="flex gap-3 pb-3 last:pb-0">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        log.active ? "bg-sakura-500" : "bg-gray-200"
                      }`}
                    />
                    {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-100" />}
                  </div>
                  <div>
                    <p className={`text-sm ${log.active ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                      {log.text}
                    </p>
                    {log.time && (
                      <p className={`text-xs ${log.active ? "text-gray-400" : "text-gray-300"}`}>
                        {log.time}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-50 p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5"><AddressesIcon className="w-4 h-4" /> 收货信息</h3>
          <p className="text-sm text-gray-600">
            {address.name} {address.phone}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {address.province} {address.city} {address.district} {address.detail}
          </p>
          {order.logisticsCompany && (
            <p className="text-xs text-gray-400 mt-2">
              快递：{order.logisticsCompany}
              {order.trackingNo && ` | 运单号：${order.trackingNo}`}
            </p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-50 p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5"><PackageIcon className="w-4 h-4" /> 商品信息</h3>
          {order.items.map((item) => {
            const imgList = JSON.parse(item.product.images || "[]") as string[];
            return (
              <div
                key={item.id}
                className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0"
              >
                <div className="relative w-14 h-14 bg-gradient-to-br from-sakura-50 to-purple-50 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  {imgList[0] ? (
                    <Image src={imgList[0]} alt="" fill className="object-cover rounded-lg" sizes="56px" />
                  ) : (
                    <span className="opacity-40">🧸</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${item.product.id}`}
                    className="text-sm text-gray-700 hover:text-sakura-500"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                </div>
                <span className="text-sm text-sakura-500 font-semibold">
                  ¥{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-gray-50 p-5 mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5"><MoneyIcon className="w-4 h-4" /> 金额明细</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>商品总额</span>
              <span>¥{order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>运费</span>
              <span className="text-green-500">免运费</span>
            </div>
          </div>
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-50">
            <span className="font-bold">实付金额</span>
            <span className="text-xl font-bold text-sakura-500">¥{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-50 p-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5"><OrdersIcon className="w-4 h-4" /> 订单信息</h3>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div>订单编号：{order.orderNo}</div>
            <div>支付方式：{order.paymentMethod === "wechat" ? "微信支付" : order.paymentMethod === "alipay" ? "支付宝" : order.paymentMethod || "—"}</div>
            <div>下单时间：{new Date(order.createdAt).toLocaleString("zh-CN")}</div>
            <div>支付时间：{order.paidAt ? new Date(order.paidAt).toLocaleString("zh-CN") : "—"}</div>
          </div>

          <div className="flex justify-end gap-3 mt-5 pt-5 border-t border-gray-50">
            <Link href="/user/after-sale" className="btn-sakura-outline text-xs px-4 py-2">
              申请售后
            </Link>
            <OrderActions orderId={order.id} status={order.status} />
          </div>
        </div>
    </div>
  );
}
