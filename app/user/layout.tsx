import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";
import { OrdersIcon, AftersaleIcon } from "@/components/admin/AdminIcons";
import { FavoritesIcon, AddressesIcon, AccountIcon } from "@/components/user/UserIcons";
import UserSidebarAvatar from "@/components/user/UserSidebarAvatar";
import UserSidebarNav from "@/components/user/UserSidebarNav";

const menuItems = [
  { href: "/user/orders", label: "我的订单", icon: <OrdersIcon /> },
  { href: "/user/favorites", label: "我的收藏", icon: <FavoritesIcon /> },
  { href: "/user/after-sale", label: "售后管理", icon: <AftersaleIcon /> },
  { href: "/user/addresses", label: "收货地址", icon: <AddressesIcon /> },
  { href: "/user/account", label: "账号设置", icon: <AccountIcon /> },
];

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const avatar = session?.user?.id
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatar: true } }))?.avatar || null
    : null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6 flex-1" id="main-content">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-52 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-50 lg:sticky lg:top-20">
              <UserSidebarAvatar
                avatar={avatar}
                name={session.user.name || session.user.email || "用户"}
              />
              <UserSidebarNav items={menuItems} />
            </div>
          </aside>
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
      <Footer />
      <BackToTop />
    </div>
  );
}
