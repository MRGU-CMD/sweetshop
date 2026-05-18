import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { type, contact, code, newPassword } = await request.json();

    if (!contact || !newPassword) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    // In production: verify SMS/email verification code here

    const where = type === "phone" ? { phone: contact } : { email: contact };
    const user = await prisma.user.findFirst({ where });

    if (!user) {
      return NextResponse.json({ error: "未找到该账号" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
