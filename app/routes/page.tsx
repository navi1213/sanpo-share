import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { fetchRoutes } from "./actions";

export default async function Routes() {
  // サーバーコンポーネントなので fetchRoutes() を直接呼び出し
  const routes = await fetchRoutes();

  return (
    <main className="flex flex-col justify-center items-center min-h-screen gap-3">
      {routes.length > 0 ? (
        routes.map((route, index) => (
            <Card className="w-[550px]" key={route.id}>
                <CardHeader>{route.name}</CardHeader>
                <CardContent>{route.description}</CardContent>
                <CardFooter className="flex-col gap-2">
                </CardFooter>
            </Card>
        ))
      ) : (
        <div>ルートが見つかりません。</div>
      )}
    </main>
  );
}
