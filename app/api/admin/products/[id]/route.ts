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

  if (!body.price || body.price <= 0) {
    return NextResponse.json({ error: "价格必须大于0" }, { status: 400 });
  }

  const data = {
    name: body.name,
    description: body.description || "",
    price: body.price,
    originalPrice: body.originalPrice || null,
    stock: body.stock ?? 0,
    status: body.status || "ON",
    source: body.source || null,
    categoryId: body.categoryId,
    images: JSON.stringify(body.images || []),
    specs: body.specs || null,
  };

  const product = await prisma.product.update({ where: { id }, data });
  return NextResponse.json(product);
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
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
