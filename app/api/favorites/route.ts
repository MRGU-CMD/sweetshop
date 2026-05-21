import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { productId } = await req.json();
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_productId: {
        userId: session.user.id,
        productId,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      productId,
    },
  });

  return NextResponse.json(favorite, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 });

  await prisma.favorite.deleteMany({
    where: {
      userId: session.user.id,
      productId,
    },
  });

  return NextResponse.json({ success: true });
}
