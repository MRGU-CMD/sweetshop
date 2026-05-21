import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const afterSales = await prisma.afterSale.findMany({
    where: { userId: session.user.id },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(afterSales);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, orderItemId, type, reason, refundAmount, images } = await req.json();
  if (!orderId || !orderItemId || !type) {
    return NextResponse.json({ error: "orderId, orderItemId, type required" }, { status: 400 });
  }

  // Verify order belongs to current user
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id },
  });
  if (!order) {
    return NextResponse.json({ error: "订单不存在" }, { status: 404 });
  }

  // Verify orderItemId belongs to the specified order
  const orderItem = await prisma.orderItem.findFirst({
    where: { id: orderItemId, orderId },
  });
  if (!orderItem) {
    return NextResponse.json({ error: "订单商品不属于该订单" }, { status: 400 });
  }

  const afterSale = await prisma.afterSale.create({
    data: {
      orderId,
      orderItemId,
      userId: session.user.id,
      type,
      reason,
      refundAmount,
      images: JSON.stringify(images || []),
    },
  });

  return NextResponse.json(afterSale, { status: 201 });
}
