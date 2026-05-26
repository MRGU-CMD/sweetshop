import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">🌸 SweetShop</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              发现你喜爱的动漫周边好物 — 手办、服饰、漫画、游戏周边，尽在SweetShop
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">快速链接</h3>
            <div className="space-y-1.5">
              <Link href="/" className="block text-xs text-gray-400 hover:text-sakura-500 transition-colors">首页</Link>
              <Link href="/search" className="block text-xs text-gray-400 hover:text-sakura-500 transition-colors">全部商品</Link>
              <Link href="/user/orders" className="block text-xs text-gray-400 hover:text-sakura-500 transition-colors">我的订单</Link>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">服务保障</h3>
            <div className="space-y-1.5 text-xs text-gray-400">
              <p>✅ 正品保证</p>
              <p>🚚 满299包邮</p>
              <p>🔄 7天无理由退换</p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-50 mt-6 pt-4 text-center text-xs text-gray-300">
          © {new Date().getFullYear()} SweetShop. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
