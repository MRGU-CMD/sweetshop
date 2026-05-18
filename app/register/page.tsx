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
    <div className="min-h-screen flex relative overflow-hidden bg-[#1a0e14]">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/anime-bg.png"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0e14]/80 via-[#1a0e14]/40 to-[#1a0e14]/65" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a0e14]/55 via-transparent to-transparent" />
        <div className="absolute top-0 right-1/4 w-1/2 h-full bg-gradient-to-l from-white/[0.04] via-white/[0.02] to-transparent -skew-x-12" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-gradient-to-r from-[#b87d93]/10 via-[#b87d93]/05 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center lg:justify-start lg:pl-16 xl:pl-28 px-4">
        <div className="w-full max-w-md">
          <div className="card-sakura p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold tracking-wide text-[#b87d93]">
                创建账号
              </h1>
              <p className="text-sm text-[#8a7a82] mt-1">加入SweetShop，发现动漫好物</p>
            </div>

            {/* Tab */}
            <div className="flex bg-[#faf5f7] rounded-xl p-1 mb-6">
              <button
                onClick={() => setTab("phone")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  tab === "phone"
                    ? "bg-white text-[#7d4a60] shadow-sm"
                    : "text-[#b8a0ab] hover:text-[#8a7a82]"
                }`}
              >
                手机注册
              </button>
              <button
                onClick={() => setTab("email")}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-300 ${
                  tab === "email"
                    ? "bg-white text-[#7d4a60] shadow-sm"
                    : "text-[#b8a0ab] hover:text-[#8a7a82]"
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
                      className="px-4 py-3 text-sm text-[#9a6078] bg-[#faf5f7] rounded-xl font-medium whitespace-nowrap hover:bg-[#f3e5eb] transition-colors"
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
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-sakura w-full disabled:opacity-60"
              >
                {loading ? "注册中..." : "注册"}
              </button>
            </form>

            <p className="text-center text-sm text-[#b8a0ab] mt-6">
              已有账号？{" "}
              <Link href="/login" className="text-[#9a6078] font-medium hover:text-[#7d4a60] transition-colors">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
