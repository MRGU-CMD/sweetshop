import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = getRateLimitKey(request);
    if (!(await rateLimit(`register:${ip}`, 5, 60_000))) {
      return NextResponse.json({ error: "请求过于频繁，请稍后再试" }, { status: 429 });
    }

    const body = await request.json();
    const { nickname, phone, email, password, code } = body;

    if (!nickname || !password) {
      return NextResponse.json({ error: "昵称和密码为必填项" }, { status: 400 });
    }
    if (nickname.length > 50) {
      return NextResponse.json({ error: "昵称过长" }, { status: 400 });
    }
    if (!phone && !email) {
      return NextResponse.json({ error: "手机号或邮箱至少填一项" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    // Validate verification code (email required for code delivery)
    if (!code) {
      return NextResponse.json({ error: "验证码不能为空" }, { status: 400 });
    }

    const verificationEmail = email || "";
    if (!verificationEmail) {
      return NextResponse.json({ error: "请提供邮箱以接收验证码" }, { status: 400 });
    }

    const storedCode = await prisma.verificationCode.findFirst({
      where: {
        contact: verificationEmail,
        code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!storedCode) {
      return NextResponse.json({ error: "验证码无效或已过期" }, { status: 400 });
    }

    if (phone) {
      const existing = await prisma.user.findUnique({ where: { phone } });
      if (existing) {
        return NextResponse.json({ error: "该手机号已被注册" }, { status: 400 });
      }
    }
    if (email) {
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        nickname,
        phone: phone || null,
        email: email || null,
        passwordHash,
      },
    });

    // Mark code as used
    await prisma.verificationCode.update({
      where: { id: storedCode.id },
      data: { used: true },
    });

    return NextResponse.json({ id: user.id, nickname: user.nickname });
  } catch (error) {
    console.error("Register error:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
