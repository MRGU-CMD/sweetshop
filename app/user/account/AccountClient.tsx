"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";
import { AccountIcon } from "@/components/user/UserIcons";
import { OrdersIcon, AftersaleIcon } from "@/components/admin/AdminIcons";
import { AddressesIcon, FavoritesIcon } from "@/components/user/UserIcons";

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

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwSaving, setPwSaving] = useState(false);

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
    try {
      const res = await fetch("/api/user/bind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: bindType, identifier: bindValue }),
      });
      const data = await res.json();
      if (res.ok) {
        toast("绑定成功！", "success");
        setBindType(null);
        setBindValue("");
        router.refresh();
      } else {
        toast(data.error || "绑定失败", "error");
      }
    } catch {
      toast("网络错误，请重试", "error");
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast("两次输入的新密码不一致", "error");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast("新密码至少6位", "error");
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
        toast("密码修改成功！", "success");
      } else {
        toast(data.error || "修改失败", "error");
      }
    } catch {
      toast("网络错误，请重试", "error");
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
    <div className="flex flex-col lg:flex-row gap-5">
      {/* Left column — Profile */}
      <div className="lg:w-72 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-50 p-6 text-center">
          <h3 className="text-sm font-bold text-gray-700 mb-5 flex items-center justify-center gap-2">
            <AccountIcon /> 基本信息
          </h3>

          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            {avatar ? (
              <button
                onClick={() => setPreviewAvatar(true)}
                className="w-24 h-24 rounded-full bg-sakura-100 flex items-center justify-center overflow-hidden cursor-pointer hover:ring-2 hover:ring-sakura-300 transition-all relative"
                title="查看头像大图"
              >
                <Image src={avatar} alt="" fill className="object-cover" unoptimized sizes="96px" />
              </button>
            ) : (
              <div className="w-24 h-24 rounded-full bg-sakura-100 flex items-center justify-center text-3xl text-sakura-600 font-bold">
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
          </div>

          {/* Nickname */}
          <div className="mt-5 text-left">
            <label className="text-xs text-gray-400 mb-1 block">昵称</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="input-sakura flex-1"
              />
              <button onClick={handleSaveProfile} disabled={saving} className="btn-sakura text-xs px-3 py-2 whitespace-nowrap">
                {saving ? "..." : "保存"}
              </button>
            </div>
            {saved && <p className="text-xs text-green-500 mt-1">已保存</p>}
          </div>

          {/* Meta */}
          <div className="mt-5 pt-4 border-t border-gray-50 text-xs text-gray-500 space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-gray-400">手机号</span>
              <span>{user.phone || "未绑定"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">邮箱</span>
              <span className="truncate ml-2 max-w-[140px]">{user.email || "未绑定"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">注册时间</span>
              <span>{new Date(user.createdAt).toLocaleDateString("zh-CN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">角色</span>
              <span className={user.role === "ADMIN" || user.role === "OWNER" ? "text-sakura-500 font-medium" : ""}>
                {user.role === "ADMIN" ? "管理员" : user.role === "OWNER" ? "超级管理员" : "用户"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right column */}
      <div className="flex-1 space-y-5">
        {/* Account bindings */}
        <div className="bg-white rounded-2xl border border-gray-50 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <OrdersIcon /> 账号绑定
          </h3>
          <div className="divide-y divide-gray-50">
            {["phone", "email"].map((type) => {
              const label = providerLabels[type];
              const bound = boundTypes.has(type);
              const boundValue = type === "phone" ? user.phone : type === "email" ? user.email : "";
              return (
                <div key={type} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-700">{label}</span>
                    {bound && (
                      <span className="text-xs text-gray-400">{boundValue || bindings.find((b) => b.type === type)?.identifier}</span>
                    )}
                  </div>
                  {bound ? (
                    <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">已绑定</span>
                  ) : bindType === type ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bindValue}
                        onChange={(e) => setBindValue(e.target.value)}
                        className="input-sakura text-xs w-36 py-1"
                        placeholder={type === "phone" ? "输入手机号" : "输入邮箱"}
                      />
                      <button onClick={handleBind} className="text-xs btn-sakura px-2 py-1">确认</button>
                      <button onClick={() => { setBindType(null); setBindValue(""); }} className="text-xs text-gray-400 hover:text-gray-600">取消</button>
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
                <div key={type} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <span className="text-sm text-gray-700">{label}</span>
                  {b ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">{b.identifier}</span>
                      <span className="text-xs text-green-500 bg-green-50 px-2 py-0.5 rounded-full">已绑定</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">登录后自动绑定</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl border border-gray-50 p-6">
          <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
            <AftersaleIcon /> 修改密码
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">当前密码</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="input-sakura"
                placeholder="输入当前密码"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">新密码</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input-sakura"
                placeholder="至少6位"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">确认新密码</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="input-sakura"
                placeholder="再次输入"
              />
            </div>
          </div>
          <button onClick={handleChangePassword} disabled={pwSaving} className="btn-sakura text-sm mt-4">
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
