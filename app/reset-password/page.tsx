"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"phone" | "email">("phone");
  const [contact, setContact] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Simulated: in production, send verification code
    setStep(2);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (newPassword.length < 6) {
      setError("密码至少6位");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: method,
        contact,
        code: smsCode,
        newPassword,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "重置失败");
      setLoading(false);
      return;
    }

    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fce4ec] relative overflow-hidden">
      <div className="absolute top-14 left-12 text-6xl opacity-30 select-none pointer-events-none">🌸</div>
      <div className="absolute bottom-20 right-14 text-5xl opacity-25 select-none pointer-events-none">🦋</div>
      <div className="absolute top-0 right-0 w-52 h-64 bg-gradient-to-bl from-sakura-200/20 to-transparent rounded-bl-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-sakura-500/10 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-sakura-500">🔑 找回密码</h1>
            <p className="text-sm text-gray-400 mt-1">
              {step === 1 ? "选择验证方式" : "设置新密码"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="flex bg-sakura-50 rounded-xl p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setMethod("phone")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    method === "phone"
                      ? "bg-white text-sakura-500 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  手机找回
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("email")}
                  className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    method === "email"
                      ? "bg-white text-sakura-500 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  邮箱找回
                </button>
              </div>

              <div>
                <input
                  type={method === "phone" ? "tel" : "email"}
                  placeholder={method === "phone" ? "已绑定的手机号" : "已绑定的邮箱"}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
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
                  className="px-4 py-3 text-sm text-sakura-500 bg-sakura-50 rounded-xl font-medium whitespace-nowrap hover:bg-sakura-100 transition-colors"
                >
                  获取验证码
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button type="submit" className="btn-sakura w-full">
                下一步
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="flex items-center gap-2 mb-2 px-3 py-2 bg-sakura-50 rounded-lg text-sm text-sakura-500">
                <span>
                  {method === "phone" ? "📱" : "📧"}
                </span>
                <span>
                  验证方式：{method === "phone" ? "手机 " : "邮箱 "}
                  {contact.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")}
                </span>
              </div>

              <div>
                <input
                  type="password"
                  placeholder="新密码（至少6位）"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-sakura"
                  required
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="确认新密码"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-sakura"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-sakura w-full disabled:opacity-60"
              >
                {loading ? "重置中..." : "重置密码"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            <Link href="/login" className="text-sakura-500 font-medium hover:underline">
              返回登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
