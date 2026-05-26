"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export default function UserSidebarNav({ items }: { items: MenuItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="px-2 pb-2 flex flex-row lg:flex-col gap-0.5 overflow-x-auto lg:overflow-visible">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors whitespace-nowrap ${
              active
                ? "bg-sakura-50 text-sakura-500 font-medium"
                : "text-gray-600 hover:bg-sakura-50 hover:text-sakura-500"
            }`}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
