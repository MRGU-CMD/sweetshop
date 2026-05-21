import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, nickname: true, avatar: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.review.count({ where: { productId } }),
  ]);

  return NextResponse.json({ reviews, total });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  const { productId, orderId, rating, content } = await request.json();

  if (!productId || !rating || !content) {
    return NextResponse.json({ error: "缺少必要参数" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "评分范围为1-5" }, { status: 400 });
  }
  if (content.length > 500) {
    return NextResponse.json({ error: "评价内容不能超过500字" }, { status: 400 });
  }

  // Verify user purchased this product
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: { not: "CANCELLED" } },
    },
  });

  if (!orderItem) {
    return NextResponse.json({ error: "您尚未购买该商品，无法评价" }, { status: 403 });
  }

  // Prevent duplicate reviews for same product from same user
  const existing = await prisma.review.findFirst({
    where: { userId, productId },
  });
  if (existing) {
    return NextResponse.json({ error: "您已评价过该商品" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      userId,
      productId,
      orderItemId: orderItem.id,
      rating: Number(rating),
      content: content.slice(0, 500),
    },
    include: { user: { select: { id: true, nickname: true, avatar: true } } },
  });

  return NextResponse.json(review, { status: 201 });
}
