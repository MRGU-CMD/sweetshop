import Header from "@/components/layout/Header";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import FavoritesClient from "./FavoritesClient";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-lg font-bold text-gray-800 mb-4">❤️ 我的收藏</h2>
      <FavoritesClient favorites={favorites} />
    </div>
  );
}
