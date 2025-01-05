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
import DeleteButton from "./DeleteRouteButton";
import ReviewForm from "./ReviewForm";
import { fetchReviewByRouteId } from "../actions";
import DeleteReviewButton from "./DeleteReviewButton";
type RouteProps = {
  params: {
    id: string; // 動的ルートで渡される ID
  };
};

export default async function RouteDetail({ params }: RouteProps) {
  const route = await fetchRouteById(params.id); // ID を使ってデータを取得
  const reviewList = await fetchReviewByRouteId(params.id);
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
      <div className="flex  justify-center">
        {/* 左側：ルート説明 */}
        <Card className="w-[450px] flex flex-col gap-3 break-words">
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
        {/* 右側：レビュー機能 */}
        <div className="flex flex-col justify-between w-[450px]">
          <ReviewForm params={params} />
          {reviewList.map((review) => (
            <Card key={review.id} className="mt-4 shadow-lg">
              <CardContent>
                <p className="text-lg font-semibold">{review.content}</p>
              </CardContent>
              {parseInt(session?.user?.id) === review.author && (
                <div className="flex justify-end p-2">
                  <DeleteReviewButton reviewId={review.id} />
                </div>
              )}
              <CardFooter className="text-muted-foreground text-xs">
                投稿者: {review.createdBy}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
export const revalidate = 0;
