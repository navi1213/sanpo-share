"use server";
import db from "@/db/drizzle";
import { routes, users } from "@/db/schema";
import { eq, InferModel } from "drizzle-orm";
import { auth } from "@/auth";
import { z } from "zod";

// 特定のルート取得
export const fetchRouteById = async (id: string) => {
  const [route] = await db
    .select()
    .from(routes)
    .where(eq(routes.id, parseInt(id)));

  return route || null; // 結果がなければ null を返す
};

type RouteInsert = InferModel<typeof routes, "insert">;
export const updateRoute = async ({
  name,
  description,
  location,
  path,
  distance,
}: {
  name: string;
  description: string;
  location: string;
  path: { lat: number; lng: number }[];
  distance: string;
}) => {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: true,
      message: "ログインしてください。",
    };
  }
  const [user] = await db
    .select({
      id: users.id,
      username: users.username,
    })
    .from(users)
    .where(eq(users.email, session.user.email));
  if (!user) {
    return {
      error: true,
      message: "ユーザーが見つかりませんでした。",
    };
  }
  try {
    const coordinateSchema = z.object({
      lat: z.number().min(-90).max(90), // 緯度の範囲
      lng: z.number().min(-180).max(180), // 経度の範囲
    });

    // フォームスキーマ全体
    const formSchema = z.object({
      name: z.string().min(1, "ルート名は必須です"),
      description: z.string(),
      location: z.string().min(1, "場所情報は必須です"),
      path: z.array(coordinateSchema).min(1, "少なくとも1つの座標が必要です"),
    });
    const newFormValidation = formSchema.safeParse({
      name,
      description,
      location,
      path,
    });
    if (!newFormValidation.success) {
      return {
        error: true,
        message:
          newFormValidation.error.issues[0]?.message ?? "エラーが発生しました",
      };
    }
    // データベースに挿入
    await db.update(routes).set({
      name,
      description,
      location,
      path: JSON.stringify(path),
      createdBy: user.username,
      distance,
      author: user.id,
    } as RouteInsert);

    return { success: true, message: "ルートが作成されました" };
  } catch (error) {
    return {
      error: true,
      message: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
};
