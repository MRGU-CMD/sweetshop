"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"phone" | "email">("phone");
  const [nickname, setNickname] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname,
        phone: tab === "phone" ? phone : undefined,
        email: tab === "email" ? email : undefined,
        password,
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
    router.push("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fce4ec] relative overflow-hidden">
      <div className="absolute top-12 right-16 text-6xl opacity-30 select-none pointer-events-none">🎀</div>
      <div className="absolute bottom-16 left-16 text-5xl opacity-25 select-none pointer-events-none">🌸</div>
      <div className="absolute top-1/4 left-0 w-36 h-72 bg-sakura-200/20 rounded-r-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-44 h-56 bg-gradient-to-t from-purple-300/20 to-sakura-200/20 rounded-l-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl shadow-sakura-500/10 p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-sakura-500">🌸 创建账号</h1>
            <p className="text-sm text-gray-400 mt-1">加入SweetShop，发现动漫好物</p>
          </div>

          {/* Tab */}
          <div className="flex bg-sakura-50 rounded-xl p-1 mb-6">
            <button
              onClick={() => setTab("phone")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "phone"
                  ? "bg-white text-sakura-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              手机注册
            </button>
            <button
              onClick={() => setTab("email")}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
                tab === "email"
                  ? "bg-white text-sakura-500 shadow-sm"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              邮箱注册
            </button>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="昵称"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input-sakura"
                required
              />
            </div>

            {tab === "phone" ? (
              <>
                <div>
                  <input
                    type="tel"
                    placeholder="手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-sakura"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="短信验证码"
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
              </>
            ) : (
              <div>
                <input
                  type="email"
                  placeholder="邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-sakura"
                  required
                />
              </div>
            )}

            <div>
              <input
                type="password"
                placeholder="密码（至少6位）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-sakura"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="确认密码"
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
              {loading ? "注册中..." : "注册"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            已有账号？{" "}
            <Link href="/login" className="text-sakura-500 font-medium hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
