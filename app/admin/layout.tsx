import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/layout/LogoutButton";
import BackToTop from "@/components/ui/BackToTop";
import { DashboardIcon, ProductsIcon, CategoriesIcon, OrdersIcon, AftersaleIcon, ReviewsIcon, UsersIcon } from "@/components/admin/AdminIcons";

const menuItems = [
  { href: "/admin", label: "仪表盘", icon: <DashboardIcon />, exact: true },
  { href: "/admin/products", label: "商品管理", icon: <ProductsIcon /> },
  { href: "/admin/categories", label: "分类管理", icon: <CategoriesIcon /> },
  { href: "/admin/orders", label: "订单管理", icon: <OrdersIcon /> },
  { href: "/admin/after-sale", label: "售后管理", icon: <AftersaleIcon /> },
  { href: "/admin/reviews", label: "评价管理", icon: <ReviewsIcon /> },
  { href: "/admin/users", label: "用户管理", icon: <UsersIcon /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/");

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/admin" className="font-bold text-gray-800 text-sm sm:text-base">
              🌸 SweetShop
            </Link>
            <span className="text-[10px] sm:text-xs bg-sakura-100 text-sakura-500 px-1.5 sm:px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <Link href="/" className="text-xs sm:text-sm text-gray-400 hover:text-sakura-500">
              返回前台
            </Link>
            <LogoutButton className="text-xs sm:text-sm text-gray-400 hover:text-sakura-500 transition-colors" label="退出登录" />
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="hidden md:block w-52 flex-shrink-0 min-h-[calc(100vh-56px)] bg-white border-r border-gray-50 p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-sakura-50 hover:text-sakura-500 transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>
        {/* Mobile nav bar */}
        <nav className="md:hidden w-full bg-white border-b border-gray-50 px-2 py-2 flex gap-1 overflow-x-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-sakura-50 hover:text-sakura-500 transition-colors whitespace-nowrap"
            >
              <span className="text-sm">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-4 sm:p-6 min-w-0">{children}</main>
      </div>
      <BackToTop />
    </div>
  );
}
