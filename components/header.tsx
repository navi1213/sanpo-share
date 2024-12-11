"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">散歩シェア</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-6 ml-6">
            <Link
              href="/"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              ホーム
            </Link>
            <Link
              href="/search"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              検索
            </Link>
            <Link
              href="/new"
              className="text-sm hover:text-gray-300 transition-colors"
            >
              投稿
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden xl:flex items-center space-x-4 ml-auto">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-white hover:text-gray-300"
              >
                ログイン
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-black hover:bg-gray-200">
                メンバー登録
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto xl:hidden" // ボタンを右端に配置
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="xl:hidden border-t border-gray-800">
            <nav className="flex flex-col space-y-4 py-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-sm hover:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <span>ホーム</span>
              </Link>
              <Link
                href="/search"
                className="flex items-center space-x-2 text-sm hover:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <Search className="h-4 w-4" />
                <span>検索</span>
              </Link>
              <Link
                href="/new"
                className="flex items-center space-x-2 text-sm hover:text-gray-300"
                onClick={() => setIsMenuOpen(false)}
              >
                <Upload className="h-4 w-4" />
                <span>投稿</span>
              </Link>
              <div className="flex flex-col space-y-2 pt-4 border-t border-gray-800">
                <Link href="/login">
                <Button
                  variant="ghost"
                  className="justify-start text-white hover:text-gray-300"
                >
                  ログイン
                </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-white text-black hover:bg-gray-200">
                    メンバー登録
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
