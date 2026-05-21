import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  const { cartItemIds, address, paymentMethod } = await request.json();

  if (!cartItemIds?.length || !address || !paymentMethod) {
    return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
  }

  const cartItems = await prisma.cartItem.findMany({
    where: { id: { in: cartItemIds }, userId },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return NextResponse.json({ error: "购物车商品不存在" }, { status: 400 });
  }

  let totalAmount = 0;
  const orderItems = cartItems.map((item) => {
    totalAmount += item.product.price * item.quantity;
    return {
      productId: item.product.id,
      quantity: item.quantity,
      unitPrice: item.product.price,
      productSnapshot: JSON.stringify({
        name: item.product.name,
        price: item.product.price,
      }),
    };
  });

  const orderNo = "SW" + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase();

  const order = await prisma.order.create({
    data: {
      orderNo,
      userId,
      totalAmount,
      paymentMethod,
      address: JSON.stringify(address),
      status: "PAID",
      paidAt: new Date(),
      items: {
        create: orderItems,
      },
    },
    include: { items: true },
  });

  // Clear purchased items from cart
  await prisma.cartItem.deleteMany({
    where: { id: { in: cartItemIds }, userId },
  });

  // Update product stock and sales
  for (const item of cartItems) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: { decrement: item.quantity },
        sales: { increment: item.quantity },
      },
    });
  }

  return NextResponse.json(order);
}
