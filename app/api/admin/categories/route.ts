import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sort: "asc" },
  });

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  if (!body.name || !body.slug) {
    return NextResponse.json({ error: "名称和标识不能为空" }, { status: 400 });
  }

  const existing = await prisma.category.findUnique({ where: { slug: body.slug } });
  if (existing) {
    return NextResponse.json({ error: "该标识已被使用" }, { status: 400 });
  }

  const category = await prisma.category.create({
    data: {
      name: body.name,
      slug: body.slug,
      icon: body.icon || null,
      sort: body.sort ?? 0,
      parentId: body.parentId || null,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
