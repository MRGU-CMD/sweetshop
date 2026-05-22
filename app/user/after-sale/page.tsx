export const dynamic = "force-dynamic";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AfterSaleClient from "./AfterSaleClient";

export default async function AfterSalePage(props: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const take = 10;
  const skip = (page - 1) * take;

  const [afterSalesRaw, total] = await Promise.all([
    prisma.afterSale.findMany({
      where: { userId: session.user.id },
      include: { order: true },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.afterSale.count({ where: { userId: session.user.id } }),
  ]);
  const totalPages = Math.ceil(total / take);

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

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              href={`/user/after-sale?page=${i + 1}`}
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
