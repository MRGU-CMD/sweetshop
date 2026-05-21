export const dynamic = "force-dynamic";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AfterSaleClient from "./AfterSaleClient";

export default async function AfterSalePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const afterSalesRaw = await prisma.afterSale.findMany({
    where: { userId: session.user.id },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  const afterSales = afterSalesRaw.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
    order: { ...a.order, createdAt: a.order.createdAt.toISOString(), updatedAt: a.order.updatedAt.toISOString() },
  }));

  const ordersRaw = await prisma.order.findMany({
    where: { userId: session.user.id, status: { not: "CANCELLED" } },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const orders = ordersRaw.map((o) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">🔄 售后管理</h2>
      <AfterSaleClient afterSales={afterSales} orders={orders} />
    </div>
  );
}
