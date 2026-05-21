import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }
  const userId = session.user.id;

  const { type, identifier, code } = await request.json();
  if (!type || !identifier || !code) {
    return NextResponse.json({ error: "缺少参数" }, { status: 400 });
  }
  if (!["phone", "email"].includes(type)) {
    return NextResponse.json({ error: "不支持的绑定类型" }, { status: 400 });
  }

  // Validate format
  if (type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
    return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });
  }
  if (type === "phone" && !/^\d{11}$/.test(identifier)) {
    return NextResponse.json({ error: "手机号格式不正确" }, { status: 400 });
  }

  // Validate verification code
  const storedCode = await prisma.verificationCode.findFirst({
    where: { contact: identifier, code, used: false, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!storedCode) {
    return NextResponse.json({ error: "验证码无效或已过期" }, { status: 400 });
  }
  await prisma.verificationCode.update({ where: { id: storedCode.id }, data: { used: true } });

  // Check for duplicate
  const existing = await prisma.user.findFirst({
    where: type === "phone" ? { phone: identifier } : { email: identifier },
  });
  if (existing && existing.id !== userId) {
    return NextResponse.json({ error: `该${type === "phone" ? "手机号" : "邮箱"}已被其他账号使用` }, { status: 400 });
  }

  // Update user
  await prisma.user.update({
    where: { id: userId },
    data: type === "phone" ? { phone: identifier } : { email: identifier },
  });

  return NextResponse.json({ success: true });
}
