"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [uploading, setUploading] = useState(false);
  const [nickname, setNickname] = useState(user.nickname);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(false);

  const [bindType, setBindType] = useState<string | null>(null);
  const [bindValue, setBindValue] = useState("");
  const [bindMsg, setBindMsg] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  const MAX_UPLOAD_SIZE = 3 * 1024 * 1024;

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    if (file.size > MAX_UPLOAD_SIZE) {
      toast(`图片过大（${(file.size / 1024 / 1024).toFixed(1)}MB），请压缩到 3MB 以内后重试`, "error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (res.ok && data.url) {
      setAvatar(data.url);
      await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: data.url }),
      });
      router.refresh();
    } else {
      toast(data.error || "上传失败", "error");
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        toast("保存失败", "error");
      }
    } catch {
      toast("网络错误，请重试", "error");
    }
    setSaving(false);
  };

  const handleBind = async () => {
    if (!bindValue) return;
    setBindMsg("");
    try {
      const res = await fetch("/api/user/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: bindType, identifier: bindValue }),
      });
      const data = await res.json();
      if (res.ok) {
        setBindMsg("绑定成功！");
        router.refresh();
      } else {
        setBindMsg(data.error || "绑定失败");
      }
    } catch {
      setBindMsg("网络错误，请重试");
    }
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
    try {
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
      if (res.ok) {
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setPwError("密码修改成功！");
      } else {
        setPwError(data.error || "修改失败");
      }
    } catch {
      setPwError("网络错误，请重试");
    }
    setPwSaving(false);
  };

  const providerLabels: Record<string, string> = {
    wechat: "微信", qq: "QQ", google: "Google", phone: "手机号", email: "邮箱",
  };

  const boundTypes = new Set(bindings.map((b) => b.type));
  if (user.phone) boundTypes.add("phone");
  if (user.email) boundTypes.add("email");

  return (
    <div className="space-y-4">
      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-50 p-6">
        <h3 className="text-sm font-bold text-gray-700 mb-4">👤 基本信息</h3>
        <div className="flex items-start gap-5">
          <div className="flex flex-col items-center gap-2">
            {avatar ? (
              <button
                onClick={() => setPreviewAvatar(true)}
                className="w-20 h-20 rounded-full bg-sakura-100 flex items-center justify-center text-2xl overflow-hidden text-sakura-600 font-bold relative cursor-pointer hover:ring-2 hover:ring-sakura-300 transition-all"
                title="查看头像大图"
              >
                <Image src={avatar} alt={user.nickname || "用户头像"} fill className="object-cover" unoptimized sizes="80px" />
              </button>
            ) : (
              <div className="w-20 h-20 rounded-full bg-sakura-100 flex items-center justify-center text-2xl overflow-hidden text-sakura-600 font-bold relative">
                {user.nickname?.[0] || "🌸"}
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="text-xs text-sakura-500 hover:underline"
            >
              {uploading ? "上传中..." : "更换头像"}
            </button>
            <span className="text-xs text-gray-400">不超过 3MB</span>
          </div>

          <div className="flex-1 max-w-sm space-y-3">
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
          {["phone", "email"].map((type) => {
            const label = providerLabels[type];
            const bound = boundTypes.has(type);
            const boundValue = type === "phone" ? user.phone : type === "email" ? user.email : "";
            return (
              <div key={type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{label}</span>
                {bound ? (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    ✓ 已绑定
                    <span className="text-gray-300">{boundValue || bindings.find((b) => b.type === type)?.identifier}</span>
                  </span>
                ) : bindType === type ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={bindValue}
                      onChange={(e) => setBindValue(e.target.value)}
                      className="input-sakura text-xs w-40 py-1"
                      placeholder={type === "phone" ? "输入手机号" : "输入邮箱"}
                    />
                    <button onClick={handleBind} className="text-xs text-sakura-500 bg-sakura-50 px-2 py-1 rounded hover:bg-sakura-100">确认</button>
                    <button onClick={() => { setBindType(null); setBindValue(""); setBindMsg(""); }} className="text-xs text-gray-400">取消</button>
                  </div>
                ) : (
                  <button onClick={() => setBindType(type)} className="text-xs text-sakura-500 hover:underline">绑定</button>
                )}
              </div>
            );
          })}
          {["wechat", "qq", "google"].map((type) => {
            const label = providerLabels[type];
            const b = bindings.find((b) => b.type === type);
            return (
              <div key={type} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-600">{label}</span>
                {b ? (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    ✓ 已绑定
                    <span className="text-gray-300">{b.identifier}</span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-300">登录后自动绑定</span>
                )}
              </div>
            );
          })}
        </div>
        {bindMsg && (
          <p className={`text-xs mt-2 ${bindMsg.includes("成功") ? "text-green-500" : "text-red-500"}`}>{bindMsg}</p>
        )}
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

      {/* Avatar preview modal */}
      {previewAvatar && avatar && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewAvatar(false)}
        >
          <button
            onClick={() => setPreviewAvatar(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white text-xl flex items-center justify-center transition-colors"
            aria-label="关闭"
          >
            ✕
          </button>
          <div className="relative max-w-2xl max-h-[80vh] w-full aspect-square" onClick={(e) => e.stopPropagation()}>
            <Image
              src={avatar}
              alt={user.nickname + "的头像"}
              fill
              className="object-contain"
              unoptimized
              sizes="(max-width: 768px) 90vw, 600px"
            />
          </div>
        </div>
      )}
    </div>
  );
}
