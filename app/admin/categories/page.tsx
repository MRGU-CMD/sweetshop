export const dynamic = "force-dynamic";
import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminCategoriesClient from "./AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/");

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sort: "asc" },
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">🏷️ 分类管理</h1>
      <AdminCategoriesClient categories={categories} />
    </div>
  );
}
