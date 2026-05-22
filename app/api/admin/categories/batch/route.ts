import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "请选择至少一个分类" }, { status: 400 });
  }

  // Check for categories that have products
  const blocked = await prisma.category.findMany({
    where: { id: { in: ids }, products: { some: {} } },
    select: { name: true },
  });

  if (blocked.length > 0) {
    return NextResponse.json(
      { error: `以下分类下有商品，无法删除：${blocked.map((c) => c.name).join("、")}` },
      { status: 400 }
    );
  }

  const result = await prisma.category.deleteMany({ where: { id: { in: ids } } });

  return NextResponse.json({ success: true, deleted: result.count });
}
