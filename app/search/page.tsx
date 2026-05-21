export const dynamic = "force-dynamic";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const query = sp.q || "";
  const sort = sp.sort || "default";
  const page = parseInt(sp.page || "1");
  const limit = 20;

  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "price_asc": orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    case "sales": orderBy = { sales: "desc" }; break;
  }

  const where = query
    ? { status: "ON" as const, name: { contains: query, mode: "insensitive" as const } }
    : { status: "ON" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-sakura-500">首页</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">
            {query ? `搜索 "${query}" 的结果` : "全部商品"}
          </span>
        </div>

        {/* Sort bar */}
        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-4 border border-gray-50">
          <div className="flex items-center gap-1">
            {[
              { value: "default", label: "综合" },
              { value: "sales", label: "销量" },
              { value: "price_asc", label: "价格↑" },
              { value: "price_desc", label: "价格↓" },
            ].map((opt) => {
              const isActive = sort === opt.value;
              const params = new URLSearchParams();
              if (query) params.set("q", query);
              if (opt.value !== "default") params.set("sort", opt.value);
              return (
                <a
                  key={opt.value}
                  href={`/search?${params.toString()}`}
                  className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                    isActive
                      ? "bg-sakura-50 text-sakura-500 font-medium"
                      : "text-gray-500 hover:text-sakura-500"
                  }`}
                >
                  {opt.label}
                </a>
              );
            })}
          </div>
          {query && <span className="text-xs text-gray-400">共 {total} 件</span>}
        </div>

        {/* Results */}
        {products.length > 0 ? (
          <>
            {query && (
              <p className="text-sm text-gray-500 mb-4">
                搜索 &quot;{query}&quot; 共找到 {total} 件商品
              </p>
            )}
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
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const params = new URLSearchParams();
                  if (query) params.set("q", query);
                  params.set("page", String(p));
                  if (sort !== "default") params.set("sort", sort);
                  return (
                    <a
                      key={p}
                      href={`/search?${params.toString()}`}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm transition-colors ${
                        page === p
                          ? "bg-sakura-500 text-white"
                          : "bg-white text-gray-600 hover:bg-sakura-50"
                      }`}
                    >
                      {p}
                    </a>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-gray-400">
              {query ? `未找到与 "${query}" 相关的商品` : "暂无商品"}
            </p>
            {query && (
              <Link href="/" className="text-sakura-500 text-sm mt-2 inline-block hover:underline">
                返回首页继续逛逛
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
