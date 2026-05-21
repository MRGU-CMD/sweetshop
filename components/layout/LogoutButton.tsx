"use client";

import { useTransition } from "../TransitionProvider";
import { signOut } from "next-auth/react";

export default function LogoutButton({ className, label }: { className?: string; label?: string }) {
  const { startLoading } = useTransition();

  const handleLogout = () => {
    startLoading("正在退出...");
    signOut({ redirectTo: "/" });
  };

  return (
    <button
      onClick={handleLogout}
      className={className || "text-xs text-gray-400 hover:text-sakura-500 transition-colors"}
    >
      {label || "退出"}
    </button>
  );
}
