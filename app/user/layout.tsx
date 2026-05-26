import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BackToTop from "@/components/ui/BackToTop";

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

  const avatar = session?.user?.id
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatar: true } }))?.avatar || null
    : null;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-6 flex-1" id="main-content">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-48 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-50 p-4 lg:sticky lg:top-20">
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-50">
                <div className="w-10 h-10 rounded-full bg-sakura-100 flex items-center justify-center text-lg overflow-hidden flex-shrink-0">
                  {avatar ? (
                    <Image src={avatar} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7">
                      <circle cx="16" cy="16" r="16" fill="#fce4ec" />
                      <g fill="#fff" opacity="0.55">
                        <circle cx="16" cy="7.5" r="4.2" />
                        <circle cx="23.5" cy="12.5" r="4.2" />
                        <circle cx="20.6" cy="21.2" r="4.2" />
                        <circle cx="11.4" cy="21.2" r="4.2" />
                        <circle cx="8.5" cy="12.5" r="4.2" />
                      </g>
                      <circle cx="16" cy="16" r="5" fill="#f8bbd0" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {session.user.name || session.user.email || "用户"}
                  </p>
                </div>
              </div>
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-sakura-50 hover:text-sakura-500 transition-colors whitespace-nowrap"
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
      <Footer />
      <BackToTop />
    </div>
  );
}
