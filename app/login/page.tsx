"use client";

import { Suspense, useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "@/components/TransitionProvider";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startLoading } = useTransition();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [tab, setTab] = useState<"email" | "sms">("email");
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
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
    const targetEmail = account.trim();
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
        body: JSON.stringify({ email: targetEmail, purpose: "login" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "发送失败"); return; }
      setCodeCountdown(60);
    } finally {
      setCodeSending(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (tab === "email") {
      const result = await signIn("credentials", {
        account,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("账号或密码错误");
        setLoading(false);
      } else {
        const session = await getSession();
        const role = session?.user?.role;
        if (role === "ADMIN" || role === "OWNER") {
          startLoading("进入后台...");
          router.push("/admin");
        } else {
          startLoading("登录成功...");
          router.push(callbackUrl);
        }
      }
    } else {
      const result = await signIn("credentials", {
        account,
        code: smsCode,
        redirect: false,
      });
      if (result?.error) {
        setError("验证码无效或已过期");
        setLoading(false);
      } else {
        const session = await getSession();
        const role = session?.user?.role;
        if (role === "ADMIN" || role === "OWNER") {
          startLoading("进入后台...");
          router.push("/admin");
        } else {
          startLoading("登录成功...");
          router.push(callbackUrl);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-[#1a1304]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/anime-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
        {/* Lighting overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1304]/85 via-[#1a1304]/45 to-[#1a1304]/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1304]/60 via-transparent to-transparent" />
        {/* Light ray */}
        <div className="absolute top-0 right-1/4 w-1/2 h-full bg-gradient-to-l from-white/[0.04] via-white/[0.02] to-transparent -skew-x-12" />
        {/* Soft glow behind the card area */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-l from-[#b8942f]/10 via-[#b8942f]/05 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex items-center justify-center lg:justify-end lg:pr-16 xl:pr-28 px-4">
        <div className="w-full max-w-md">
          <div className="card-sakura p-8">
            {/* Back */}
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-[#c4b898] hover:text-[#8b6914] transition-colors mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              返回首页
            </Link>

            {/* Logo */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-wide text-[#b8942f]">
                SweetShop
              </h1>
              <p className="text-sm text-[#a09880] mt-1">发现你喜爱的动漫好物</p>
            </div>

            {/* Tab */}
            <div className="flex bg-[#fdf9f0] rounded-xl p-1 mb-6">
              <button
                onClick={() => setTab("email")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  tab === "email"
                    ? "bg-white text-[#6b5010] shadow-sm"
                    : "text-[#c4b898] hover:text-[#a09880]"
                }`}
              >
                邮箱登录
              </button>
              <button
                onClick={() => setTab("sms")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  tab === "sms"
                    ? "bg-white text-[#6b5010] shadow-sm"
                    : "text-[#c4b898] hover:text-[#a09880]"
                }`}
              >
                验证码登录
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              {tab === "email" ? (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="邮箱地址"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="input-sakura"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-sakura"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <input
                      type="text"
                      placeholder="邮箱地址"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      className="input-sakura"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="验证码"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      className="input-sakura flex-1"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={codeSending || codeCountdown > 0}
                      className="px-4 py-3 text-sm text-[#8b6914] bg-[#fdf9f0] rounded-xl font-medium whitespace-nowrap hover:bg-[#f7eed8] transition-colors disabled:opacity-50"
                    >
                      {codeCountdown > 0 ? `${codeCountdown}s` : codeSending ? "发送中..." : "获取验证码"}
                    </button>
                  </div>
                </>
              )}

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[#c4b898] cursor-pointer">
                  <input type="checkbox" className="accent-[#b8942f] rounded" />
                  记住我
                </label>
                <Link href="/reset-password" className="text-[#8b6914] hover:text-[#6b5010] transition-colors">
                  忘记密码？
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-sakura w-full mt-2 disabled:opacity-60"
              >
                {loading ? "登录中..." : "登录"}
              </button>
            </form>

            {/* Social login */}
            <div className="mt-6">
              <div className="relative text-center mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#ebe0c8]" />
                </div>
                <span className="relative bg-white px-4 text-xs text-[#c4b898]">
                  其他登录方式
                </span>
              </div>

              <div className="flex justify-center gap-6">
                <button
                  onClick={() => signIn("wechat")}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: "#2aa859" }}
                  title="微信登录"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                    <path d="M8.69 9.73c-.39 0-.7.31-.7.7 0 .39.31.7.7.7s.7-.31.7-.7-.31-.7-.7-.7zm3.09 0c-.39 0-.7.31-.7.7 0 .39.31.7.7.7s.7-.31.7-.7-.31-.7-.7-.7zM12 3C6.48 3 2 6.69 2 11.24c0 2.52 1.28 4.78 3.28 6.26l-.82 2.47 2.86-1.43c.86.24 1.75.37 2.68.37 5.52 0 10-3.69 10-8.24S17.52 3 12 3zm-3.31 8.24c-.39 0-.7-.31-.7-.7 0-.39.31-.7.7-.7s.7.31.7.7-.31.7-.7.7zm3.09 0c-.39 0-.7-.31-.7-.7 0-.39.31-.7.7-.7s.7.31.7.7-.31.7-.7.7zm4.53 0c-.39 0-.7-.31-.7-.7s.31-.7.7-.7.7.31.7.7-.31.7-.7.7zm-1.78 2.47c-.86 0-1.56-.7-1.56-1.56s.7-1.56 1.56-1.56 1.56.7 1.56 1.56-.7 1.56-1.56 1.56z" />
                  </svg>
                </button>
                <button
                  onClick={() => signIn("qq")}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110"
                  style={{ backgroundColor: "#3e9fcf" }}
                  title="QQ登录"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-.15 15.5c-1.93 0-3.5-1.12-3.5-2.5s1.57-2.5 3.5-2.5 3.5 1.12 3.5 2.5-1.57 2.5-3.5 2.5zm3.5-5.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-7 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                  </svg>
                </button>
                <button
                  onClick={() => signIn("google")}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-[#ebe0c8] transition-transform hover:scale-110"
                  title="Google登录"
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Register link */}
            <p className="text-center text-sm text-[#c4b898] mt-6">
              还没有账号？{" "}
              <Link href="/register" className="text-[#8b6914] font-medium hover:text-[#6b5010] transition-colors">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#1a1304]" />}>
      <LoginForm />
    </Suspense>
  );
}
