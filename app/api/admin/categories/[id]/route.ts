import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();

  if (body.slug) {
    const conflict = await prisma.category.findUnique({ where: { slug: body.slug } });
    if (conflict && conflict.id !== id) {
      return NextResponse.json({ error: "该标识已被其他分类使用" }, { status: 400 });
    }
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      icon: body.icon,
      sort: body.sort ?? undefined,
      parentId: body.parentId ?? undefined,
    },
  });

  return NextResponse.json(category);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) {
    return NextResponse.json({ error: `该分类下有 ${count} 个商品，无法删除` }, { status: 400 });
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
