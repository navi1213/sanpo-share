"use server";
import { auth } from "@/auth";
import { fetchRouteById } from "../actions";
import RouteMap from "../map";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DeleteButton from "../DeleteButton";
export default async function ShowRoute({ params }) {
  const route = await fetchRouteById(params.id); // ID を使ってデータを取得
  const session = await auth();
  if (!route) {
    return <div>ルートが見つかりません。</div>;
  }
  const isAuthor = parseInt(session?.user?.id) === route.author;
  return (
    <>
      <RouteMap
        path={(route.path as { lat: number; lng: number }[]) || []}
        distance={route.distance}
      />
      {/* 左側：ルート説明 */}
      <Card className="w-[450px] flex flex-col gap-3">
        <CardHeader>
          <CardTitle>{route.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>詳細:{route.description}</p>
          <p>場所:{route.location}</p>
          {isAuthor ? (
            <>
              <Link href={`/routes/${params.id}/edit`}>
                <Button
                  variant="outline"
                  className="mt-2 mr-2 bg-blue-500 text-white"
                >
                  編集
                </Button>
              </Link>
              <DeleteButton routeId={params.id} />
            </>
          ) : (
            ""
          )}
        </CardContent>
        <CardFooter className="text-muted-foreground text-xs">
          投稿者: {route.createdBy}
        </CardFooter>
      </Card>
    </>
  );
}
