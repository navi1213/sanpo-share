"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { Navigation, mainNavigationItems } from "@/components/navigation/Navigation";
import { APP_CONFIG } from "@/lib/constants";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, update } = useSession();
  const currentPath = usePathname();

  const handleLogout = async () => {
    await signOut();
    await update();
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">{APP_CONFIG.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex ml-6">
            <Navigation items={mainNavigationItems} className="text-white" />
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4 ml-auto">
            {session ? (
              <>
                <Link href="/my-account">
                  <Button variant="ghost" className="text-white hover:text-gray-300">
                    マイアカウント
                  </Button>
                </Link>
                <Button size="sm" onClick={handleLogout}>
                  ログアウト
                </Button>
              </>
            ) : (
              <>
                <Link href={`/login?redirect=${encodeURI(currentPath)}`}>
                  <Button variant="ghost" className="text-white hover:text-gray-300">
                    ログイン
                  </Button>
                </Link>
                <Link href={`/register?redirect=${encodeURI(currentPath)}`}>
                  <Button className="bg-white text-black hover:bg-gray-200">
                    メンバー登録
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="ms-auto md:hidden"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800">
            <nav className="flex flex-col space-y-4 py-4">
              {mainNavigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm hover:text-gray-300 transition-colors"
                  onClick={toggleMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-gray-800 py-4">
              {session ? (
                <div className="flex flex-col space-y-2">
                  <Link href="/my-account">
                    <Button variant="ghost" className="text-white hover:text-gray-300 w-full">
                      マイアカウント
                    </Button>
                  </Link>
                  <Button size="sm" onClick={handleLogout} className="w-full">
                    ログアウト
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link href={`/login?redirect=${encodeURI(currentPath)}`}>
                    <Button variant="ghost" className="text-white hover:text-gray-300 w-full">
                      ログイン
                    </Button>
                  </Link>
                  <Link href={`/register?redirect=${encodeURI(currentPath)}`}>
                    <Button className="bg-white text-black hover:bg-gray-200 w-full">
                      メンバー登録
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
