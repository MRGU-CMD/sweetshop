import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.name || !body.phone || !body.detail) {
    return NextResponse.json({ error: "name, phone, detail required" }, { status: 400 });
  }

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      name: body.name,
      phone: body.phone,
      province: body.province || "",
      city: body.city || "",
      district: body.district || "",
      detail: body.detail,
      zipCode: body.zipCode || "",
      isDefault: body.isDefault || false,
    },
  });

  return NextResponse.json(address, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const body = await req.json();

  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId: session.user.id },
      data: { isDefault: false },
    });
  }

  const userId = session.user.id;
  const existing = await prisma.address.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Address not found" }, { status: 404 });

  const address = await prisma.address.update({
    where: { id },
    data: body,
  });

  return NextResponse.json(address);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.address.deleteMany({
    where: { id, userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
