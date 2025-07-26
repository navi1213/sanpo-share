"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavigationItem {
  href: string;
  label: string;
}

interface NavigationProps {
  items: NavigationItem[];
  className?: string;
}

export function Navigation({ items, className = "" }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={`flex items-center space-x-6 ${className}`}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`text-sm transition-colors ${
            pathname === item.href
              ? "text-blue-600 font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export const mainNavigationItems: NavigationItem[] = [
  { href: "/", label: "ホーム" },
  { href: "/routes", label: "ルート一覧" },
  { href: "/new", label: "投稿" },
]; 