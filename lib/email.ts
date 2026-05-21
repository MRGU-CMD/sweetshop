import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const emailFrom = process.env.EMAIL_FROM || "SweetShop <noreply@sweetshop.com>";

export async function sendVerificationCode(email: string, code: string): Promise<boolean> {
  // Always print code to console so it's available during development
  console.log(`\n📧 [验证码] ${code} → ${email}\n`);

  if (!resend) {
    return true;
  }

  try {
    await resend.emails.send({
      from: emailFrom,
      to: email,
      subject: "SweetShop 验证码 - " + code,
      html: emailTemplate(code),
    });
    console.log(`  ✅ Resend 已发送`);
    return true;
  } catch (err) {
    console.error("  ⚠️ Resend 发送失败:", (err as any).message || err);
    return true;
  }
}

function emailTemplate(code: string): string {
  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#fdf9f0;">
<div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
  <div style="height:4px;background:linear-gradient(90deg,#ebd9af,#b8942f,#ebd9af);"></div>
  <div style="padding:40px 32px;text-align:center;">
    <div style="font-size:24px;margin-bottom:8px;">🌸 SweetShop</div>
    <div style="color:#8b6914;font-size:14px;margin-bottom:28px;">动漫好物商城</div>
    <div style="font-size:15px;color:#4d380b;margin-bottom:8px;">你的验证码是</div>
    <div style="font-size:36px;font-weight:bold;color:#b8942f;letter-spacing:6px;margin-bottom:28px;">${code}</div>
    <div style="font-size:13px;color:#a09880;">有效期 10 分钟，请勿泄露给他人</div>
  </div>
  <div style="background:#fdf9f0;padding:20px;text-align:center;font-size:12px;color:#c4b898;">
    SweetShop 动漫商城 · 安全验证
  </div>
</div>
</body>
</html>`;
}
