import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get("category");
  const sort = searchParams.get("sort") || "default";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = (searchParams.get("search") || "").slice(0, 100);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");

  const where: any = { status: "ON" };

  if (categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (category) {
      const childIds = (await prisma.category.findMany({
        where: { parentId: category.id },
        select: { id: true },
      })).map((c) => c.id);
      where.categoryId = { in: [category.id, ...childIds] };
    }
  }

  if (search) {
    where.name = { contains: search, mode: "insensitive" as const };
  }

  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = parseFloat(minPrice);
    if (maxPrice) where.price.lte = parseFloat(maxPrice);
  }

  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "price_asc": orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    case "sales": orderBy = { sales: "desc" }; break;
    case "newest": orderBy = { createdAt: "desc" }; break;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return NextResponse.json({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
