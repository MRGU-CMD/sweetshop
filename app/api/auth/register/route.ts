import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { nickname, phone, email, password } = await request.json();

    if (!nickname || !password) {
      return NextResponse.json({ error: "昵称和密码为必填项" }, { status: 400 });
    }
    if (!phone && !email) {
      return NextResponse.json({ error: "手机号或邮箱至少填一项" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
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

    return NextResponse.json({ id: user.id, nickname: user.nickname });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
