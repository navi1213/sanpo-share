import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
export default function HeroSection() {
  return (
    <section className="relative w-full h-[80vh] overflow-hidden">
      {/* 背景画像 */}
      <Image
        src="/mainCover.jpg" // 画像パス
        alt="散歩シェアの背景画像"
        layout="fill" // 親要素に完全フィット
        objectFit="cover" // カバー表示
        quality={90} // 画質（任意）
        className="opacity-80" // 少し透過
      />

      {/* コンテンツ */}
      <div className="absolute inset-0 flex flex-col justify-center items-start text-white pl-60">
        <h1 className="text-4xl md:text-6xl font-bold">散歩シェア</h1>
        <p className="text-lg md:text-2xl mt-4">散歩コースをシェアするアプリ</p>
        <div className="mt-6 flex space-x-4">
          {/* ボタン */}
          <Link href="/login">
            <Button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow">
              ログイン
            </Button>
          </Link>
          <Link href="/register">
            <Button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow">
              メンバー登録
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
