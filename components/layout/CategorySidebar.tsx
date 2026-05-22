import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function CategorySidebar() {
  const categories = await prisma.category.findMany({
    orderBy: { sort: "asc" },
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
            <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
              {cat.icon ? (
                /^https?:\/\//.test(cat.icon) ? (
                  <Image src={cat.icon} alt="" width={20} height={20} className="w-full h-full object-cover rounded" />
                ) : (
                  <span className="text-base">{cat.icon}</span>
                )
              ) : null}
            </span>
            <span>{cat.name}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
