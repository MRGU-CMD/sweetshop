import Link from "next/link";
import Image from "next/image";
import { auth, isAdminRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SearchBox from "./SearchBox";
import LogoutButton from "./LogoutButton";
import CartLink from "./CartLink";

export default async function Header() {
  const session = await auth();
  const isAdmin = isAdminRole(session?.user?.role);
  const avatar = session?.user?.id
    ? (await prisma.user.findUnique({ where: { id: session.user.id }, select: { avatar: true } }))?.avatar || null
    : null;

  return (
    <header className="bg-white border-b border-sakura-50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-sakura-500 whitespace-nowrap flex-shrink-0">
          🌸 SweetShop
        </Link>

        {/* Search */}
        <div className="flex-1">
          <SearchBox />
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-2 text-sm flex-shrink-0">
          <CartLink />

          {session ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sakura-50 text-sakura-500 hover:bg-sakura-100 transition-colors"
                >
                  后台
                </Link>
              )}
              <Link
                href="/user"
                className="block w-8 h-8 rounded-full overflow-hidden flex-shrink-0 hover:ring-2 hover:ring-sakura-300 transition-all"
                title="个人中心"
              >
                {avatar ? (
                  <Image src={avatar} alt={session?.user?.name || "用户头像"} width={32} height={32} className="w-full h-full object-cover" unoptimized />
                ) : (
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
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
              </Link>
              <LogoutButton />
            </div>
          ) : (
            <Link href="/login" className="text-sakura-500 font-medium text-sm hover:underline">
              登录
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
