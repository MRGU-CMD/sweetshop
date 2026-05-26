import { prisma } from "@/lib/prisma";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://www.sweetshop.com";

function lastmod(date: Date): string {
  return date.toISOString().split("T")[0];
}

export default async function sitemap() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where: { status: "ON" }, select: { id: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
  ]);

  const productUrls = products.map((p) => ({
    url: `${BASE_URL}/product/${p.id}`,
    lastModified: lastmod(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryUrls = categories.map((c) => ({
    url: `${BASE_URL}/category/${c.slug}`,
    lastModified: new Date().toISOString().split("T")[0],
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly" as const,
      priority: 0.3,
    },
    ...categoryUrls,
    ...productUrls,
  ];
}
