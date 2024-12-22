import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { fetchRouteById } from "./actions"; // actions.ts から特定のルートを取得する関数をインポート
import RouteMap from "./map";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";
import Link from "next/link";

type RouteProps = {
  params: {
    id: string; // 動的ルートで渡される ID
  };
};

export default async function RouteDetail({ params }: RouteProps) {
  const route = await fetchRouteById(params.id); // ID を使ってデータを取得
  const session = await auth();
  if (!route) {
    return <div>ルートが見つかりません。</div>;
  }
  const isAuthor = parseInt(session?.user?.id) === route.author;
  return (
    <main className="flex flex-col  min-h-screen">
      <RouteMap
        path={(route.path as { lat: number; lng: number }[]) || []}
        distance={route.distance}
      />
      <div className="flex gap-8">
        {/* 左側：ルート説明 */}
        <Card className="w-[450px] flex flex-col gap-3">
          <CardHeader>
            <CardTitle>{route.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{route.description}</p>
            {isAuthor ? <>
            <Link href={`/routes/${params.id}/edit`}>
            <Button variant="outline" className="mt-2 mr-2 bg-blue-500 text-white">
              編集
            </Button>
            </Link>
            <Button variant="destructive">削除</Button>
            </>:""}
          </CardContent>
          <CardFooter className="text-muted-foreground text-xs">
            投稿者: {route.createdBy}
          </CardFooter>
        </Card>
        {/* 右側：レビュー機能 */}
        <div className="flex-1">
          <Card className="flex flex-col gap-4 p-4">
            <CardHeader>
              <CardTitle>レビューを追加</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="レビューを入力してください..."
                rows={4}
              />
              <Button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md">
                レビューを投稿
              </Button>
            </CardContent>
            <CardFooter>
              {/* 投稿されたレビューリスト */}
              <div className="mt-4">
                <div className="text-sm">レビュー1: 良いルートでした！</div>
                <div className="text-sm">レビュー2: 楽しいコースでした！</div>
                {/* 実際にはデータをマッピングして表示 */}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}
