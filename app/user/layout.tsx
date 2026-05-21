import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";

const menuItems = [
  { href: "/user/orders", label: "我的订单", icon: "📋" },
  { href: "/user/favorites", label: "我的收藏", icon: "❤️" },
  { href: "/user/after-sale", label: "售后管理", icon: "🔄" },
  { href: "/user/addresses", label: "收货地址", icon: "📍" },
  { href: "/user/account", label: "账号设置", icon: "⚙️" },
];

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="w-48 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-50 p-4 sticky top-20">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-sakura-100 flex items-center justify-center text-lg">
                  {session.user.name?.charAt(0) || "👤"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {session.user.name || session.user.email || "用户"}
                  </p>
                </div>
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-sakura-50 hover:text-sakura-500 transition-colors"
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
