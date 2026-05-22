export const dynamic = "force-dynamic";
import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ProductsIcon } from "@/components/admin/AdminIcons";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/");

  const categories = await prisma.category.findMany({ orderBy: { sort: "asc" } });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2"><ProductsIcon /> 商品管理</h1>
      <AdminProductsClient categories={categories} />
    </div>
  );
}
