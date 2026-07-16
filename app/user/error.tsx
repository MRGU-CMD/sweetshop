"use client";

export default function UserError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message =
    process.env.NODE_ENV === "development"
      ? error.message
      : "个人中心加载失败，请稍后重试";

  return (
    <div className="text-center py-16">
      <p className="text-3xl mb-3">🌸</p>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      <button onClick={reset} className="text-sm text-sakura-500 hover:underline">
        重新加载
      </button>
    </div>
  );
}
