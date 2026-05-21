import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, nickname: true, avatar: true, phone: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const userId = session.user.id;

  if (body.password) {
    if (!body.currentPassword || !body.newPassword) {
      return NextResponse.json({ error: "currentPassword and newPassword required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "No password set" }, { status: 400 });
    }

    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Current password incorrect" }, { status: 400 });

    const passwordHash = await bcrypt.hash(body.newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return NextResponse.json({ success: true });
  }

  if (body.nickname !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { nickname: body.nickname },
    });
  }

  if (body.avatar !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: body.avatar },
    });
  }

  return NextResponse.json({ success: true });
}
