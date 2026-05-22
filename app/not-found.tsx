import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdf9f0]">
      <div className="text-center max-w-sm mx-auto px-4">
        <p className="text-5xl mb-4">🔍</p>
        <h1 className="text-lg font-bold text-[#6b5010] mb-2">页面不存在</h1>
        <p className="text-sm text-[#a09880] mb-6">
          你访问的页面可能已被移除或地址有误
        </p>
        <Link href="/" className="btn-sakura text-sm inline-block">
          返回首页
        </Link>
      </div>
    </div>
  );
}
