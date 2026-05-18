import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") redirect("/");

  const categories = await prisma.category.findMany({ orderBy: { sort: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">📦 商品管理</h1>
      <AdminProductsClient categories={categories} />
    </div>
  );
}
