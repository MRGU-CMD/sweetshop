"use client";

import Link from "next/link";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message =
    process.env.NODE_ENV === "development"
      ? error.message
      : "商品页面加载失败";

  return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🧸</p>
      <p className="text-gray-500 mb-4">{message}</p>
      <div className="flex gap-3 justify-center">
        <button onClick={reset} className="text-sm text-sakura-500 hover:underline">
          重新加载
        </button>
        <Link href="/" className="text-sm text-gray-400 hover:underline">
          返回首页
        </Link>
      </div>
    </div>
  );
}
