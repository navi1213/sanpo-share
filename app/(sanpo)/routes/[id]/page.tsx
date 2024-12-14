import { fetchRouteById } from "./actions"; // actions.ts から特定のルートを取得する関数をインポート
import RouteMap from "./map";

type RouteProps = {
  params: {
    id: string; // 動的ルートで渡される ID
  };
};

export default async function RouteDetail({ params }: RouteProps) {
  const route = await fetchRouteById(params.id); // ID を使ってデータを取得
  if (!route) {
    return <div>ルートが見つかりません。</div>;
  }

  return (
    <main className="flex flex-col items-center min-h-screen">
      <RouteMap path={(route.path as { lat: number; lng: number }[]) || []} />
      <div className="w-[650px]">
        <h1 className="text-2xl font-bold">{route.name}</h1>
        <p className="text-gray-700">{route.description}</p>
        <p className="mt-2 text-sm text-gray-500">
          <span className="font-semibold">場所: </span>
          {route.location || "不明"}
        </p>
      </div>
    </main>
  );
}
