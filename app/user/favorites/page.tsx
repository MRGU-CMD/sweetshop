export const dynamic = "force-dynamic";
import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import FavoritesClient from "./FavoritesClient";

export default async function FavoritesPage(props: { searchParams: Promise<{ page?: string }> }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const searchParams = await props.searchParams;
  const page = Math.max(1, parseInt(searchParams.page || "1"));
  const take = 12;
  const skip = (page - 1) * take;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: session.user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take,
      skip,
    }),
    prisma.favorite.count({ where: { userId: session.user.id } }),
  ]);
  const totalPages = Math.ceil(total / take);

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">❤️ 我的收藏</h2>
      <FavoritesClient favorites={favorites} />

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <a
              key={i}
              href={`/user/favorites?page=${i + 1}`}
              className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center ${
                page === i + 1
                  ? "bg-sakura-500 text-white"
                  : "bg-white text-gray-600 border border-gray-100 hover:border-sakura-300"
              }`}
            >
              {i + 1}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
