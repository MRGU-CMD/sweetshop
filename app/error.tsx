"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message =
    process.env.NODE_ENV === "development"
      ? error.message || "发生了未知错误"
      : "页面加载失败，请稍后重试";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf9f0]">
      <div className="text-center max-w-sm mx-auto px-4">
        <p className="text-5xl mb-4">😿</p>
        <h1 className="text-lg font-bold text-[#6b5010] mb-2">页面出错了</h1>
        <p className="text-sm text-[#a09880] mb-6">{message}</p>
        <button onClick={reset} className="btn-sakura text-sm">
          重新加载
        </button>
      </div>
    </div>
  );
}
