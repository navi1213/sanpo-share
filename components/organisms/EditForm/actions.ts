"use server";

import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { routes, users } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { Coordinate } from "@/types";
import { revalidatePath, revalidateTag } from 'next/cache';

// 既存のルート取得
export const fetchRouteById = async (id: string) => {
  try {
    console.log('fetchRouteById (edit): 開始', { id, idType: typeof id, parsedId: parseInt(id) });
    
    const [route] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, parseInt(id)));

    console.log('fetchRouteById (edit): クエリ結果', { route, routeExists: !!route });

    if (!route) {
      console.log('fetchRouteById (edit): ルートが見つかりません');
      return null;
    }

    console.log('fetchRouteById (edit): ルート取得成功', {
      id: route.id,
      name: route.name,
      author: route.author,
      pathType: typeof route.path,
      pathContent: route.path
    });

    // pathをJSONパースして返す
    let parsedPath;
    try {
      // pathが既にオブジェクト配列の場合はそのまま使用
      if (typeof route.path === 'object' && Array.isArray(route.path)) {
        console.log('fetchRouteById (edit): pathは既にオブジェクト配列です');
        parsedPath = route.path;
      } else if (typeof route.path === 'string') {
        console.log('fetchRouteById (edit): pathを文字列から解析します');
        parsedPath = JSON.parse(route.path);
      } else {
        console.log('fetchRouteById (edit): 予期しないpath型', typeof route.path);
        parsedPath = [];
      }
      console.log('fetchRouteById (edit): パス解析成功', { pathLength: parsedPath.length });
    } catch (parseError) {
      console.error('fetchRouteById (edit): JSON解析エラー:', parseError);
      parsedPath = [];
    }

    // キャッシュを無効化
    revalidateTag(`route-${id}`);
    revalidatePath(`/routes/${id}/edit`);

    return {
      ...route,
      path: parsedPath
    };
  } catch (error) {
    console.error('fetchRouteById (edit): データベースエラー:', error);
    return null;
  }
};

export const updateRoute = async ({
  name,
  description,
  location,
  path,
  distance,
  routeId
}: {
  name: string;
  description?: string;
  location: string;
  path: Coordinate[];
  distance: string;
  routeId: string;
}) => {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
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

    // データベースに更新
    await db.update(routes).set({
      name,
      description,
      location,
      path: JSON.stringify(path),
      createdBy: user.username,
      distance,
      author: user.id,
    }).where(eq(routes.id, parseInt(routeId)));

    // キャッシュを無効化
    revalidateTag(`route-${routeId}`);
    revalidatePath(`/routes/${routeId}/edit`);
    revalidatePath(`/routes/${routeId}`); // 詳細ページも無効化
    revalidatePath('/routes'); // 一覧ページも無効化

    return { 
      success: true, 
      message: "ルートが更新されました" 
    };
  } catch (error) {
    return {
      error: true,
      message: "ルート更新中にエラーが発生しました",
    };
  }
};
