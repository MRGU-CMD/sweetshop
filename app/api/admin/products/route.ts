import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function requireAdmin(session: any) {
  if (!session?.user || !isAdminRole(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export async function GET(req: Request) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = (searchParams.get("search") || "").slice(0, 100);
  const categoryId = searchParams.get("categoryId") || "";

  const where: any = {};
  if (search) where.name = { contains: search, mode: "insensitive" as const };
  if (categoryId) where.categoryId = categoryId;

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({ products, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: Request) {
  const session = await auth();
  const err = requireAdmin(session);
  if (err) return err;

  const body = await req.json();
  const product = await prisma.product.create({
    data: {
      name: body.name,
      description: body.description || "",
      price: body.price,
      originalPrice: body.originalPrice || null,
      stock: body.stock || 0,
      status: body.status || "ON",
      images: JSON.stringify(body.images || []),
      specs: body.specs || null,
      source: body.source || null,
      categoryId: body.categoryId,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
