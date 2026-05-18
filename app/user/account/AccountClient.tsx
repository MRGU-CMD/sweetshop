"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  nickname: string;
  avatar: string | null;
  phone: string | null;
  email: string | null;
  role: string;
  createdAt: string;
}

interface Binding {
  id: string;
  type: string;
  identifier: string;
  verified: boolean;
}

export default function AccountClient({ user, bindings }: { user: User; bindings: Binding[] }) {
  const router = useRouter();
  const [nickname, setNickname] = useState(user.nickname);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  const handleSaveProfile = async () => {
    setSaving(true);
    await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    setPwError("");
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPwError("两次输入的新密码不一致");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPwError("新密码至少6位");
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/user", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        password: true,
      }),
    });
    const data = await res.json();
    setPwSaving(false);
    if (res.ok) {
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPwError("密码修改成功！");
    } else {
      setPwError(data.error || "修改失败");
    }
  };

  const providerLabels: Record<string, string> = {
    wechat: "微信",
    qq: "QQ",
    google: "Google",
    phone: "手机号",
    email: "邮箱",
  };

  return (
    <div className="space-y-4">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">👤 基本信息</h3>
        <div className="max-w-sm space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="input-sakura"
            />
          </div>
          <div className="flex gap-3 items-center">
            <button onClick={handleSaveProfile} disabled={saving} className="btn-sakura text-sm">
              {saving ? "保存中..." : "保存"}
            </button>
            {saved && <span className="text-green-500 text-sm">已保存</span>}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500 space-y-1">
          <p>手机号：{user.phone || "未绑定"}</p>
          <p>邮箱：{user.email || "未绑定"}</p>
          <p>注册时间：{new Date(user.createdAt).toLocaleDateString("zh-CN")}</p>
        </div>
      </div>

      {/* Account bindings */}
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">🔗 账号绑定</h3>
        <div className="space-y-3 max-w-sm">
          {["phone", "email", "wechat", "qq", "google"].map((type) => {
            const b = bindings.find((b) => b.type === type);
            const hasUser = type === "phone" ? user.phone : type === "email" ? user.email : null;
            const label = providerLabels[type];
            return (
              <div key={type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{label}</span>
                {b || (type === "phone" && user.phone) || (type === "email" && user.email) ? (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    ✓ 已绑定
                    <span className="text-gray-300">
                      {b?.identifier || (type === "phone" ? user.phone : type === "email" ? user.email : "")}
                    </span>
                  </span>
                ) : (
                  <button className="text-xs text-sakura-500 hover:underline">绑定</button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">🔒 修改密码</h3>
        <div className="max-w-sm space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">当前密码</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="input-sakura"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">新密码</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="input-sakura"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">确认新密码</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="input-sakura"
            />
          </div>
          {pwError && (
            <p className={`text-xs ${pwError.includes("成功") ? "text-green-500" : "text-red-500"}`}>{pwError}</p>
          )}
          <button onClick={handleChangePassword} disabled={pwSaving} className="btn-sakura text-sm">
            {pwSaving ? "修改中..." : "修改密码"}
          </button>
        </div>
      </div>
    </div>
  );
}
