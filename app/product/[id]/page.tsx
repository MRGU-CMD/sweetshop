export const dynamic = "force-dynamic";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import FavoriteButton from "@/components/product/FavoriteButton";
import AddToCartButton from "@/components/product/AddToCartButton";
import { ImageGallery, ProductTabs } from "@/components/product/ProductDetailClient";

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

  const isOnShelf = product.status === "ON";
  const session = await auth();
  let isFavorited = false;
  if (session?.user) {
    const fav = await prisma.favorite.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
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
          {/* Left: Image Gallery */}
          <div className="w-[480px] flex-shrink-0">
            <ImageGallery images={imageList} />
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
              {isOnShelf ? (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <FavoriteButton productId={product.id} initialFavorited={isFavorited} />
                  </div>
                  <AddToCartButton
                    productId={product.id}
                    stock={product.stock}
                    specs={(() => { try { return JSON.parse(product.specs || "[]"); } catch { return undefined; } })()}
                  />
                </>
              ) : (
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
                  <p className="text-sm text-gray-500">该商品已下架</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs: Desc / Specs / Reviews */}
        <ProductTabs
          description={product.description}
          specs={(() => { try { return JSON.parse(product.specs || "[]"); } catch { return []; } })()}
          reviews={product.reviews}
          reviewCount={product._count.reviews}
          productId={product.id}
          userId={session?.user ? session.user.id : undefined}
        />
      </div>
    </div>
  );
}
