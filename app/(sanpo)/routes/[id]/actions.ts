"use server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { reviews } from "@/db/reviewsSchema";
import { routes } from "@/db/routesSchema";
import { eq } from "drizzle-orm";

// 特定のルート取得
export const fetchRouteById = async (id: string) => {
  const [route] = await db
    .select()
    .from(routes)
    .where(eq(routes.id, parseInt(id)));

  return route || null; // 結果がなければ null を返す
};

export const deleteRouteById = async (id: string) => {
  const session = await auth();
  if (!session) {
    return {
      error: true,
      message: "ログインしてください",
    };
  }
  const [route] = await db
    .select()
    .from(routes)
    .where(eq(routes.id, parseInt(id)));
  if (!route) {
    return {
      error: true,
      message: "ルートが見つかりません",
    };
  }
  if (parseInt(session?.user?.id) !== route.author) {
    return {
      error: true,
      message: "削除権限がありません",
    };
  }
  await db.delete(routes).where(eq(routes.id, parseInt(id)));
};

export const deleteReviewById = async (id: number) => {
  await db.delete(reviews).where(eq(reviews.id, id));
};
