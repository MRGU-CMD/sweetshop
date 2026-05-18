import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { sort: "asc" },
    include: {
      children: { orderBy: { sort: "asc" } },
      _count: { select: { products: true } },
    },
  });
  return NextResponse.json(categories);
}
