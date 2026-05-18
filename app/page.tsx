import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fce4ec]">
      <div className="text-center py-32">
        <h1 className="text-5xl font-bold text-sakura-500 mb-4">🌸 SweetShop</h1>
        <p className="text-xl text-sakura-400 mb-8">发现你喜爱的动漫周边好物</p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-sakura">
            登录
          </Link>
          <Link href="/register" className="btn-sakura-outline">
            注册
          </Link>
        </div>
      </div>
    </div>
  );
}
