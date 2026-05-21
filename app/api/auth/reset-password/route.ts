import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getRateLimitKey(request);
    if (!(await rateLimit(`reset-password:${ip}`, 5, 60_000))) {
      return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    const { type, contact, code, newPassword } = await request.json();

    if (!contact || !newPassword || !code) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    // Validate verification code
    const storedCode = await prisma.verificationCode.findFirst({
      where: { contact, code, used: false, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (!storedCode) {
      return NextResponse.json({ error: "验证码错误或已过期" }, { status: 400 });
    }

    await prisma.verificationCode.update({
      where: { id: storedCode.id },
      data: { used: true },
    });

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
    console.error("Reset password error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
