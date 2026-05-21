import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/email";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const ip = getRateLimitKey(req);
  const { email, purpose } = await req.json();

  if (!email) return NextResponse.json({ error: "邮箱不能为空" }, { status: 400 });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 });

  // Rate limit: 1 per 60s per email
  if (!(await rateLimit(`send-code:${email}`, 1, 60_000))) {
    return NextResponse.json({ error: "发送太频繁，请60秒后再试" }, { status: 429 });
  }
  // IP rate limit
  if (!(await rateLimit(`send-code-ip:${ip}`, 10, 300_000))) {
    return NextResponse.json({ error: "请求过多，请稍后再试" }, { status: 429 });
  }

  // For register: check email not already in use
  if (purpose === "register") {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "该邮箱已被注册" }, { status: 400 });
  }

  // For login / reset: check email exists
  if (purpose === "login" || purpose === "reset") {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "该邮箱未注册" }, { status: 404 });
  }

  // Generate 6-digit code
  const code = String(Math.floor(100000 + Math.random() * 900000));

  // Store in DB, expire in 10 min
  await prisma.verificationCode.create({
    data: {
      contact: email,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const sent = await sendVerificationCode(email, code);
  if (!sent) {
    return NextResponse.json({ error: "邮件发送失败，请稍后再试" }, { status: 500 });
  }

  return NextResponse.json({ message: "验证码已发送" });
}
