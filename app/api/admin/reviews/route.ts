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
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const rating = parseInt(searchParams.get("rating") || "0");

  const where: any = {};
  if (rating > 0) where.rating = rating;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, nickname: true, email: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return NextResponse.json({ reviews, total, page, totalPages: Math.ceil(total / limit) });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) {
    return NextResponse.json({ error: "评价不存在" }, { status: 404 });
  }

  await prisma.review.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
