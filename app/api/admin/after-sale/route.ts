import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

function requireAdmin(session: any) {
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where: any = {};
  if (status) where.status = status;

  const [afterSales, total] = await Promise.all([
    prisma.afterSale.findMany({
      where,
      include: {
        user: { select: { id: true, nickname: true, email: true, phone: true } },
        order: { select: { id: true, orderNo: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.afterSale.count({ where }),
  ]);

  return NextResponse.json({ afterSales, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { id, action, reply } = await req.json();
  if (!id || !action) {
    return NextResponse.json({ error: "id and action required" }, { status: 400 });
  }

  const afterSale = await prisma.afterSale.findUnique({ where: { id } });
  if (!afterSale) {
    return NextResponse.json({ error: "售后单不存在" }, { status: 404 });
  }

  let newStatus = afterSale.status;
  if (action === "approve") {
    if (afterSale.status !== "PENDING") {
      return NextResponse.json({ error: "只能审批待处理的售后单" }, { status: 400 });
    }
    newStatus = "APPROVED";
  } else if (action === "reject") {
    if (afterSale.status !== "PENDING") {
      return NextResponse.json({ error: "只能审批待处理的售后单" }, { status: 400 });
    }
    newStatus = "REJECTED";
  } else if (action === "complete") {
    if (afterSale.status !== "APPROVED") {
      return NextResponse.json({ error: "只能完成已审批的售后单" }, { status: 400 });
    }
    newStatus = "COMPLETED";
  } else {
    return NextResponse.json({ error: "无效操作" }, { status: 400 });
  }

  const updated = await prisma.afterSale.update({
    where: { id },
    data: {
      status: newStatus,
      reason: reply ? `${afterSale.reason || ""}\n[客服回复]: ${reply}` : afterSale.reason,
    },
  });

  return NextResponse.json(updated);
}
