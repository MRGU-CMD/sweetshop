import Link from "next/link";
import { auth, isAdminRole } from "@/lib/auth";
import SearchBox from "./SearchBox";
import LogoutButton from "./LogoutButton";
import CartLink from "./CartLink";

export default async function Header() {
  const session = await auth();
  const isAdmin = isAdminRole(session?.user?.role);

  return (
    <header className="bg-white border-b border-sakura-50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-sakura-500 whitespace-nowrap">
          🌸 SweetShop
        </Link>

        {/* Category nav */}
        <nav className="hidden lg:flex items-center gap-1 text-sm">
          <Link href="/category/figures" className="px-3 py-2 text-gray-600 hover:text-sakura-500 rounded-lg hover:bg-sakura-50 transition-colors">
            手办
          </Link>
          <Link href="/category/clothing" className="px-3 py-2 text-gray-600 hover:text-sakura-500 rounded-lg hover:bg-sakura-50 transition-colors">
            服饰
          </Link>
          <Link href="/category/manga" className="px-3 py-2 text-gray-600 hover:text-sakura-500 rounded-lg hover:bg-sakura-50 transition-colors">
            漫画
          </Link>
          <Link href="/category/games" className="px-3 py-2 text-gray-600 hover:text-sakura-500 rounded-lg hover:bg-sakura-50 transition-colors">
            游戏
          </Link>
          <Link href="/category/cosmetics" className="px-3 py-2 text-gray-600 hover:text-sakura-500 rounded-lg hover:bg-sakura-50 transition-colors">
            化妆品
          </Link>
          <Link href="/category/digital" className="px-3 py-2 text-gray-600 hover:text-sakura-500 rounded-lg hover:bg-sakura-50 transition-colors">
            数码
          </Link>
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-xl">
          <SearchBox />
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3 text-sm">
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
                className="p-2 text-gray-500 hover:text-sakura-500 transition-colors"
              >
                👤
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
