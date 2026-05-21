import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: { id, userId: session.user.id },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, nickname: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  return NextResponse.json(order);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const { id } = await params;
  const userId = session.user.id;

  const order = await prisma.order.findFirst({
    where: { id, userId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  const { action } = await request.json();

  if (action === "cancel") {
    if (!["PENDING", "PAID"].includes(order.status)) {
      return NextResponse.json({ error: "当前状态不可取消" }, { status: 400 });
    }

    // Restore stock for each item
    for (const item of order.items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: { increment: item.quantity },
          sales: { decrement: item.quantity },
        },
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    return NextResponse.json(updated);
  }

  if (action === "receive") {
    if (order.status !== "SHIPPED") {
      return NextResponse.json({ error: "当前状态不可确认收货" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "RECEIVED", receivedAt: new Date() },
    });

    return NextResponse.json(updated);
  }

  if (action === "complete") {
    if (order.status !== "RECEIVED") {
      return NextResponse.json({ error: "当前状态不可完成订单" }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "无效操作" }, { status: 400 });
}
