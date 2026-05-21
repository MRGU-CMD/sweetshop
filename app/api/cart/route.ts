import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  const { productId, quantity, specInfo } = await request.json();

  if (!productId) {
    return NextResponse.json({ error: "缺少商品ID" }, { status: 400 });
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.status !== "ON") {
    return NextResponse.json({ error: "商品不存在或已下架" }, { status: 400 });
  }

  const existing = await prisma.cartItem.findFirst({
    where: { userId, productId, specInfo: specInfo || null },
  });

  if (existing) {
    const updated = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + (quantity || 1) },
    });
    return NextResponse.json(updated);
  }

  const item = await prisma.cartItem.create({
    data: {
      userId,
      productId,
      quantity: quantity || 1,
      specInfo: specInfo || null,
    },
  });

  return NextResponse.json(item);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  const { id, quantity } = await request.json();

  const item = await prisma.cartItem.findFirst({ where: { id, userId } });
  if (!item) {
    return NextResponse.json({ error: "购物车项不存在" }, { status: 404 });
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  }

  const updated = await prisma.cartItem.update({
    where: { id },
    data: { quantity },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (id) {
    await prisma.cartItem.deleteMany({ where: { id, userId } });
  } else {
    // Clear all
    await prisma.cartItem.deleteMany({ where: { userId } });
  }

  return NextResponse.json({ success: true });
}
