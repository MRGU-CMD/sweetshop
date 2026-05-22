import { auth, isAdminRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/layout/LogoutButton";

const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  ),
  products: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 8.5v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8.5" />
      <path d="M3 7.5L12 2l9 5.5" />
      <path d="M12 12v10" />
      <path d="M3 7.5L12 12l9-4.5" />
    </svg>
  ),
  categories: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  orders: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h4" />
      <path d="M8 17h7" />
      <path d="M8 9h1" />
    </svg>
  ),
  aftersale: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 2v4h-4" />
      <path d="M4 14v-2a8 8 0 0114.5-5.5L20 8" />
      <path d="M4 22v-4h4" />
      <path d="M20 10v2a8 8 0 01-14.5 5.5L4 16" />
    </svg>
  ),
  reviews: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
};

const menuItems = [
  { href: "/admin", label: "仪表盘", icon: icons.dashboard, exact: true },
  { href: "/admin/products", label: "商品管理", icon: icons.products },
  { href: "/admin/categories", label: "分类管理", icon: icons.categories },
  { href: "/admin/orders", label: "订单管理", icon: icons.orders },
  { href: "/admin/after-sale", label: "售后管理", icon: icons.aftersale },
  { href: "/admin/reviews", label: "评价管理", icon: icons.reviews },
  { href: "/admin/users", label: "用户管理", icon: icons.users },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) redirect("/");

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="font-bold text-gray-800">
              🌸 SweetShop 后台
            </Link>
            <span className="text-xs bg-sakura-100 text-sakura-500 px-2 py-0.5 rounded-full">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-sakura-500">
              返回前台
            </Link>
            <LogoutButton className="text-sm text-gray-400 hover:text-sakura-500 transition-colors" label="退出登录" />
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="w-52 flex-shrink-0 min-h-[calc(100vh-56px)] bg-white border-r border-gray-50 p-4">
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
        <main className="flex-1 p-6 min-w-0">{children}</main>
      </div>
    </div>
  );
}
