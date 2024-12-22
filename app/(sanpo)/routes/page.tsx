import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // ボタン用
import { fetchRoutes } from "./actions";
import Link from "next/link";

export default async function Routes() {
  const routes = await fetchRoutes();
  return (
    <main className="flex flex-col items-center min-h-screen gap-5">
      <div className="w-full max-w-[650px]">
        <h1 className="text-2xl font-bold text-left">散歩ルート一覧</h1> {/* 左寄せ */}
      </div>
      {routes.length > 0 ? (
        routes.map((route) => (
          <Card className="w-[650px]" key={route.id}>
            <CardHeader className="text-xl font-bold">{route.name}</CardHeader>
            <CardContent>
              <p className="text-gray-700">{route.description}</p>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-semibold">場所: </span>
                {route.location || "不明"}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                <span className="font-semibold">投稿者: </span>
                {route.createdBy || "不明"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Link href={`/routes/${route.id}`}>
              <Button variant="outline" className="text-blue-600 hover:bg-gray-100">
                {route.name}の詳細
              </Button>
              </Link>
            </CardFooter>
          </Card>
        ))
      ) : (
        <div>ルートが見つかりません。</div>
      )}
    </main>
  );
}

// キャッシュを無効化して毎回データを取得
export const revalidate = 0;