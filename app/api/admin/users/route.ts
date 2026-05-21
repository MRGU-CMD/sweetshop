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
  const search = (searchParams.get("search") || "").slice(0, 100);

  const where: any = {};
  if (search) {
    where.OR = [
      { nickname: { contains: search, mode: "insensitive" as const } },
      { email: { contains: search, mode: "insensitive" as const } },
      { phone: { contains: search, mode: "insensitive" as const } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { id: true, nickname: true, email: true, phone: true, role: true, createdAt: true, _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return NextResponse.json({ users, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const currentUserId = session.user.id;
  const currentUserRole = session.user.role;

  const { id, role } = await req.json();
  if (!id || !role) return NextResponse.json({ error: "id and role required" }, { status: 400 });
  if (!["ADMIN", "USER"].includes(role)) return NextResponse.json({ error: "Invalid role" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: "用户不存在" }, { status: 404 });

  // No one can change OWNER's role
  if (target.role === "OWNER") {
    return NextResponse.json({ error: "无法修改站主的角色" }, { status: 403 });
  }

  // Can't change your own role
  if (id === currentUserId) {
    return NextResponse.json({ error: "不能修改自己的角色" }, { status: 400 });
  }

  // Only OWNER can demote an ADMIN to USER
  if (target.role === "ADMIN" && role === "USER" && currentUserRole !== "OWNER") {
    return NextResponse.json({ error: "只有站主才能取消管理员权限" }, { status: 403 });
  }

  const user = await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ id: user.id, role: user.role });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "OWNER") {
    return NextResponse.json({ error: "只有站主才能转交权限" }, { status: 403 });
  }

  const { targetId } = await req.json();
  if (!targetId) return NextResponse.json({ error: "targetId required" }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: targetId } });
  if (!target) return NextResponse.json({ error: "目标用户不存在" }, { status: 404 });
  if (target.role !== "ADMIN") {
    return NextResponse.json({ error: "只能转交给现有管理员" }, { status: 400 });
  }

  const currentUserId = session.user.id;

  // Transfer: OWNER → ADMIN, target → OWNER
  await Promise.all([
    prisma.user.update({ where: { id: currentUserId }, data: { role: "ADMIN" } }),
    prisma.user.update({ where: { id: targetId }, data: { role: "OWNER" } }),
  ]);

  return NextResponse.json({ success: true, newOwnerId: targetId });
}
