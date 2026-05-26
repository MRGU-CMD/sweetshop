import Link from "next/link";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fdf9f0]">
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <p className="text-5xl mb-4">🚨</p>
          <h1 className="text-4xl font-bold text-[#6b5010] mb-2">404</h1>
          <p className="text-sm text-[#a09880] mb-6">
            beyond别太过分了宝贝，再搞我报警了！
          </p>
          <Link href="/" className="btn-sakura text-sm inline-block">
            返回首页
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
