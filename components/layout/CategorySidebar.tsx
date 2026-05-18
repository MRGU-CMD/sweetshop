import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CategorySidebar() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { sort: "asc" },
    include: {
      children: { orderBy: { sort: "asc" } },
    },
  });

  return (
    <aside className="w-44 flex-shrink-0 bg-white rounded-xl border border-gray-50 overflow-hidden">
      <div className="px-4 py-3 text-sm font-semibold text-sakura-500 border-b border-sakura-50">
        全部分类
      </div>
      <nav className="py-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/category/${cat.slug}`}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-600 hover:text-sakura-500 hover:bg-sakura-50 transition-colors"
          >
            <span className="text-base">{cat.icon}</span>
            <span>{cat.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
