"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "@/components/TransitionProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { startLoading } = useTransition();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSending, setCodeSending] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);

  useEffect(() => {
    if (codeCountdown <= 0) return;
    const t = setTimeout(() => setCodeCountdown(codeCountdown - 1), 1000);
    return () => clearTimeout(t);
  }, [codeCountdown]);

  const handleSendCode = async () => {
    const targetEmail = email.trim();
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail)) {
      setError("请先输入有效的邮箱地址");
      return;
    }
    setError("");
    setCodeSending(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, purpose: "register" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "发送失败"); return; }
      setCodeCountdown(60);
      setError("");
    } finally {
      setCodeSending(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (password.length < 6) {
      setError("密码至少6位");
      return;
    }
    if (!smsCode) {
      setError("请输入验证码");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname,
        phone: tab === "phone" ? phone : undefined,
        email: email || undefined,
        password,
        code: smsCode,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "注册失败");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      account: tab === "phone" ? phone : email,
      password,
      redirect: false,
    });
    startLoading("注册成功...");
    router.push("/");
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#1a1304]">
      <div className="absolute inset-0 z-0">
        <img src="/images/anime-bg.png" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1304]/80 via-[#1a1304]/40 to-[#1a1304]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1304]/55 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-1/2 h-full bg-gradient-to-l from-white/[0.04] via-white/[0.02] to-transparent -skew-x-12" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-r from-[#b8942f]/10 via-[#b8942f]/05 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center lg:justify-start lg:pl-16 xl:pl-28 px-4">
        <div className="w-full max-w-md">
          <div className="card-sakura p-8">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#c4b898] hover:text-[#8b6914] transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              返回首页
            </Link>

            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-wide text-[#b8942f]">创建账号</h1>
              <p className="text-sm text-[#a09880] mt-1">加入SweetShop，发现动漫好物</p>
            </div>

            <div className="flex bg-[#fdf9f0] rounded-xl p-1 mb-6">
              <button onClick={() => setTab("phone")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${tab === "phone" ? "bg-white text-[#6b5010] shadow-sm" : "text-[#c4b898] hover:text-[#a09880]"}`}>
                手机注册
              </button>
              <button onClick={() => setTab("email")} className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${tab === "email" ? "bg-white text-[#6b5010] shadow-sm" : "text-[#c4b898] hover:text-[#a09880]"}`}>
                邮箱注册
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <input type="text" placeholder="昵称" value={nickname} onChange={(e) => setNickname(e.target.value)} className="input-sakura" required />
              </div>

              {tab === "phone" ? (
                <div>
                  <input type="tel" placeholder="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-sakura" required />
                </div>
              ) : null}

              <div>
                <input type="email" placeholder="邮箱 (接收验证码)" value={email} onChange={(e) => setEmail(e.target.value)} className="input-sakura" required />
              </div>

              <div className="flex gap-2">
                <input type="text" placeholder="验证码" value={smsCode} onChange={(e) => setSmsCode(e.target.value)} className="input-sakura flex-1" required />
                <button type="button" onClick={handleSendCode} disabled={codeSending || codeCountdown > 0}
                  className="px-4 py-3 text-sm text-[#8b6914] bg-[#fdf9f0] rounded-xl font-medium whitespace-nowrap hover:bg-[#f7eed8] transition-colors disabled:opacity-50">
                  {codeCountdown > 0 ? `${codeCountdown}s` : codeSending ? "发送中..." : "获取验证码"}
                </button>
              </div>

              <div>
                <input type="password" placeholder="密码（至少6位）" value={password} onChange={(e) => setPassword(e.target.value)} className="input-sakura" required />
              </div>
              <div>
                <input type="password" placeholder="确认密码" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-sakura" required />
              </div>

              {error && <p className="text-red-400 text-sm text-center">{error}</p>}

              <button type="submit" disabled={loading} className="btn-sakura w-full disabled:opacity-60">
                {loading ? "注册中..." : "注册"}
              </button>
            </form>

            <p className="text-center text-sm text-[#c4b898] mt-6">
              已有账号？{" "}
              <Link href="/login" className="text-[#8b6914] font-medium hover:text-[#6b5010] transition-colors">立即登录</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
