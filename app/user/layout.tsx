import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";
import UserSidebarAvatar from "@/components/user/UserSidebarAvatar";
import { OrdersIcon, FavoritesIcon, AftersaleIcon, AddressesIcon, AccountIcon } from "@/components/user/UserIcons";
import SakuraPetals from "@/components/user/SakuraPetals";

const menuItems = [
  { href: "/user/orders", label: "我的订单", Icon: OrdersIcon },
  { href: "/user/favorites", label: "我的收藏", Icon: FavoritesIcon },
  { href: "/user/after-sale", label: "售后管理", Icon: AftersaleIcon },
  { href: "/user/addresses", label: "收货地址", Icon: AddressesIcon },
  { href: "/user/account", label: "账号设置", Icon: AccountIcon },
];

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const avatar = session?.user?.id
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatar: true } }))?.avatar || null
    : null;

  const displayName = session.user.name || session.user.email || "用户";

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col relative">
      <SakuraPetals />
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6 relative z-10">
        {/* Mobile: compact user info + horizontal nav */}
        <div className="lg:hidden mb-4">
          <div className="flex items-center gap-3 bg-white rounded-xl border border-gray-50 p-3 mb-3">
            <UserSidebarAvatar avatar={avatar} name={displayName} />
            <p className="text-sm font-medium text-gray-700 truncate">{displayName}</p>
          </div>
          <nav className="flex gap-1 overflow-x-auto bg-white rounded-xl border border-gray-50 p-1.5">
            {menuItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-600 hover:bg-sakura-50 hover:text-sakura-500 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Icon />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex gap-8">
          <aside className="w-52 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl border border-gray-50 p-4 lg:sticky lg:top-20">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-50">
                <UserSidebarAvatar avatar={avatar} name={displayName} />
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {displayName}
                  </p>
                </div>
              </div>
              <nav className="space-y-1">
                {menuItems.map(({ href, label, Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-sakura-50 hover:text-sakura-500 transition-colors"
                  >
                    <Icon />
                    <span>{label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <div className="relative z-10"><Footer /></div>
      <BackToTop />
    </div>
  );
}
