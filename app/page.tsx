export const dynamic = "force-dynamic";
import Header from "@/components/layout/Header";
import CategorySidebar from "@/components/layout/CategorySidebar";
import ProductCard from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Home() {
  const products = await prisma.product.findMany({
    where: { status: "ON" },
    orderBy: { sales: "desc" },
    take: 8,
  });

  const banners = [
    { emoji: "🌸", title: "樱花季新品首发", subtitle: "春季限定手办 & 周边", color: "from-sakura-100 to-sakura-300" },
    { emoji: "🎀", title: "满299包邮", subtitle: "全场动漫好物随心选", color: "from-purple-100 to-sakura-100" },
    { emoji: "✨", title: "会员专享9折", subtitle: "注册即享首单优惠", color: "from-sakura-50 to-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left sidebar */}
          <CategorySidebar />

          {/* Main area */}
          <div className="flex-1 min-w-0">
            {/* Banner carousel */}
            <div className="flex gap-4 mb-8">
              <div className="flex-[2] h-56 bg-gradient-to-br from-sakura-200 to-sakura-400 rounded-2xl flex items-center px-10 relative overflow-hidden">
                <div>
                  <p className="text-white/80 text-sm mb-2">🌸 樱花季新品首发</p>
                  <h2 className="text-white text-2xl font-bold mb-3">春季限定手办 & 周边</h2>
                  <Link href="/category/figures" className="inline-block bg-white text-sakura-500 text-sm font-semibold px-5 py-2 rounded-xl hover:shadow-lg transition-shadow">
                    立即选购 →
                  </Link>
                </div>
                <div className="text-8xl absolute right-8 opacity-30">🌸</div>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex-1 bg-gradient-to-br from-purple-100 to-sakura-100 rounded-2xl p-5 relative overflow-hidden">
                  <p className="text-sakura-600 text-sm font-semibold">🎀 满299包邮</p>
                  <p className="text-sakura-400 text-xs mt-1">全场动漫好物随心选</p>
                </div>
                <div className="flex-1 bg-gradient-to-br from-sakura-50 to-purple-100 rounded-2xl p-5 relative overflow-hidden">
                  <p className="text-sakura-600 text-sm font-semibold">✨ 会员专享9折</p>
                  <p className="text-sakura-400 text-xs mt-1">注册即享首单优惠</p>
                </div>
              </div>
            </div>

            {/* Hot products */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">🔥 热销推荐</h2>
              <Link href="/search" className="text-sm text-sakura-500 hover:underline">
                查看更多 →
              </Link>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  originalPrice={p.originalPrice}
                  sales={p.sales}
                  images={p.images}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
