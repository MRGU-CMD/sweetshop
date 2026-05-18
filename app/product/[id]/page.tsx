import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/product/FavoriteButton";
import AddToCartButton from "@/components/product/AddToCartButton";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      reviews: {
        include: { user: { select: { id: true, nickname: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      _count: { select: { reviews: true, favorites: true } },
    },
  });

  if (!product) notFound();

  const session = await auth();
  let isFavorited = false;
  if (session?.user) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_productId: { userId: (session.user as any).id, productId: product.id } },
    });
    isFavorited = !!fav;
  }

  const imageList = JSON.parse(product.images || "[]") as string[];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-sakura-500">首页</Link>
          <span className="mx-2">/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-sakura-500">
            {product.category.name}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{product.name}</span>
        </div>

        <div className="flex gap-8">
          {/* Left: Image */}
          <div className="w-[480px] flex-shrink-0">
            <div className="aspect-square bg-gradient-to-br from-sakura-50 to-purple-50 rounded-2xl flex items-center justify-center text-8xl">
              {imageList[0] ? (
                <img src={imageList[0]} alt={product.name} className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="opacity-30">🧸</span>
              )}
            </div>
          </div>

          {/* Right: Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-800">{product.name}</h1>
            {product.source && (
              <p className="text-sm text-sakura-500 mt-1">作品来源：{product.source}</p>
            )}

            <div className="mt-6 bg-sakura-50/50 rounded-xl p-5">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-sakura-500">¥{product.price}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <>
                    <span className="text-lg text-gray-300 line-through">¥{product.originalPrice}</span>
                    <span className="bg-sakura-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {Math.round((1 - product.price / product.originalPrice) * 100)}%OFF
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-6 mt-3 text-xs text-gray-400">
                <span>已售 {product.sales.toLocaleString()}</span>
                <span>库存 {product.stock}</span>
                <span>{product._count.favorites} 人收藏</span>
              </div>
            </div>

            {/* Quantity & buttons */}
            <div className="mt-6">
              <div className="flex items-center gap-3 mb-3">
                <FavoriteButton productId={product.id} initialFavorited={isFavorited} />
              </div>
              <AddToCartButton productId={product.id} stock={product.stock} />
            </div>
          </div>
        </div>

        {/* Tabs: Desc / Specs / Reviews */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-50 overflow-hidden">
          <div className="flex border-b border-gray-50">
            <button className="px-6 py-3.5 text-sm font-semibold text-sakura-500 border-b-2 border-sakura-500">
              商品详情
            </button>
            <button className="px-6 py-3.5 text-sm text-gray-400 hover:text-gray-600">
              规格参数
            </button>
            <button className="px-6 py-3.5 text-sm text-gray-400 hover:text-gray-600">
              用户评价 ({product._count.reviews})
            </button>
          </div>

          <div className="p-8">
            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description || "暂无商品描述"}
            </p>

            {/* Reviews summary */}
            {product.reviews.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-50">
                <h3 className="text-base font-bold text-gray-700 mb-4">
                  用户评价 ({product._count.reviews})
                </h3>
                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sakura-100 rounded-full flex items-center justify-center text-sm">
                          {review.user.avatar || "🌸"}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            {review.user.nickname}
                          </span>
                          <div className="text-yellow-500 text-xs">
                            {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        <span className="text-xs text-gray-300 ml-auto">
                          {new Date(review.createdAt).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{review.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
