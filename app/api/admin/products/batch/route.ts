import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  let where: Prisma.ProductWhereInput = {};

  if (body.selectAll) {
    // Delete by filter criteria — selects ALL matching products across pages
    if (body.search) {
      where.name = { contains: String(body.search), mode: "insensitive" };
    }
    if (body.categoryId) {
      where.categoryId = String(body.categoryId);
    }
  } else {
    // Delete by specific IDs
    const ids: string[] = body.ids;
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "请选择至少一个商品" }, { status: 400 });
    }
    where.id = { in: ids };
  }

  const result = await prisma.product.deleteMany({ where });

  return NextResponse.json({ success: true, deleted: result.count });
}
