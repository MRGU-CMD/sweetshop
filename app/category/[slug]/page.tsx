import Header from "@/components/layout/Header";
import CategorySidebar from "@/components/layout/CategorySidebar";
import ProductCard from "@/components/product/ProductCard";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string; page?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: { children: true },
  });

  if (!category) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <p className="text-gray-400">分类不存在</p>
        </div>
      </div>
    );
  }

  const sort = sp.sort || "default";
  const page = parseInt(sp.page || "1");
  const minPrice = sp.minPrice;
  const maxPrice = sp.maxPrice;

  const childIds = category.children.map((c) => c.id);
  const categoryIds = [category.id, ...childIds];

  const where: any = {
    status: "ON",
    categoryId: { in: categoryIds },
  };
  if (minPrice) where.price = { ...where.price, gte: parseFloat(minPrice) };
  if (maxPrice) where.price = { ...where.price, lte: parseFloat(maxPrice) };

  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "price_asc": orderBy = { price: "asc" }; break;
    case "price_desc": orderBy = { price: "desc" }; break;
    case "sales": orderBy = { sales: "desc" }; break;
    case "newest": orderBy = { createdAt: "desc" }; break;
  }

  const limit = 20;
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);
  const sortOptions = [
    { value: "default", label: "综合" },
    { value: "sales", label: "销量" },
    { value: "price_asc", label: "价格↑" },
    { value: "price_desc", label: "价格↓" },
    { value: "newest", label: "最新" },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-400 mb-4">
          <Link href="/" className="hover:text-sakura-500">首页</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-600">{category.name}</span>
        </div>

        <div className="flex gap-6">
          <CategorySidebar />

          <div className="flex-1 min-w-0">
            {/* Sort bar */}
            <div className="flex items-center justify-between bg-white rounded-xl px-4 py-3 mb-4 border border-gray-50">
              <div className="flex items-center gap-1">
                {sortOptions.map((opt) => {
                  const isActive = sort === opt.value;
                  const href = `/category/${slug}?sort=${opt.value}${minPrice ? `&minPrice=${minPrice}` : ""}${maxPrice ? `&maxPrice=${maxPrice}` : ""}`;
                  return (
                    <a
                      key={opt.value}
                      href={href}
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
              <span className="text-xs text-gray-400">共 {total} 件</span>
            </div>

            {/* Product grid */}
            {products.length > 0 ? (
              <>
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      const params = new URLSearchParams();
                      params.set("page", String(p));
                      if (sort !== "default") params.set("sort", sort);
                      if (minPrice) params.set("minPrice", minPrice);
                      if (maxPrice) params.set("maxPrice", maxPrice);
                      return (
                        <a
                          key={p}
                          href={`/category/${slug}?${params.toString()}`}
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
              <div className="text-center py-20 text-gray-400">暂无商品</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
