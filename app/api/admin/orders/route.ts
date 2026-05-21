import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const status = searchParams.get("status");

  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { nickname: true, email: true, phone: true } }, items: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id, status, logisticsCompany, trackingNo } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const data: any = { status };
  if (logisticsCompany) data.logisticsCompany = logisticsCompany;
  if (trackingNo) data.trackingNo = trackingNo;
  if (status === "SHIPPED") data.shippedAt = new Date();

  const order = await prisma.order.update({ where: { id }, data });
  return NextResponse.json(order);
}
