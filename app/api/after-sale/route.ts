import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const afterSales = await prisma.afterSale.findMany({
    where: { userId: (session.user as any).id },
    include: { order: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(afterSales);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orderId, orderItemId, type, reason, refundAmount } = await req.json();
  if (!orderId || !orderItemId || !type) {
    return NextResponse.json({ error: "orderId, orderItemId, type required" }, { status: 400 });
  }

  const afterSale = await prisma.afterSale.create({
    data: {
      orderId,
      orderItemId,
      userId: (session.user as any).id,
      type,
      reason,
      refundAmount,
    },
  });

  return NextResponse.json(afterSale, { status: 201 });
}
