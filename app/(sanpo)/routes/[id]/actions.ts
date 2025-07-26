"use server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { reviews } from "@/db/reviewsSchema";
import { routes } from "@/db/routesSchema";
import { eq } from "drizzle-orm";
import { Coordinate } from "@/types";

// 特定のルート取得
export const fetchRouteById = async (id: string) => {
  try {
    console.log('fetchRouteById: 開始', { id, idType: typeof id, parsedId: parseInt(id) });
    
    const [route] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, parseInt(id)));

    console.log('fetchRouteById: クエリ結果', { route, routeExists: !!route });

    if (!route) {
      console.log('fetchRouteById: ルートが見つかりません');
      return null;
    }

    console.log('fetchRouteById: ルート取得成功', {
      id: route.id,
      name: route.name,
      pathType: typeof route.path,
      pathContent: route.path
    });

    // pathをJSONパースして返す
    let parsedPath;
    try {
      // pathが既にオブジェクト配列の場合はそのまま使用
      if (typeof route.path === 'object' && Array.isArray(route.path)) {
        console.log('fetchRouteById: pathは既にオブジェクト配列です');
        parsedPath = route.path;
      } else if (typeof route.path === 'string') {
        console.log('fetchRouteById: pathを文字列から解析します');
        parsedPath = JSON.parse(route.path);
      } else {
        console.log('fetchRouteById: 予期しないpath型', typeof route.path);
        parsedPath = [];
      }
      console.log('fetchRouteById: パス解析成功', { pathLength: parsedPath.length });
    } catch (parseError) {
      console.error('fetchRouteById: パス解析エラー', parseError);
      parsedPath = [];
    }

    const result = {
      ...route,
      path: parsedPath as Coordinate[],
    };

    console.log('fetchRouteById: 返却データ', {
      id: result.id,
      name: result.name,
      pathLength: result.path.length
    });

    return result;
  } catch (error) {
    console.error('fetchRouteById: エラー', error);
    return null;
  }
};

export const deleteRouteById = async (id: string) => {
  try {
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
    
    if (!session?.user?.id || parseInt(session.user.id) !== route.author) {
      return {
        error: true,
        message: "削除権限がありません",
      };
    }
    
    await db.delete(routes).where(eq(routes.id, parseInt(id)));
    
    return {
      success: true,
      message: "ルートが削除されました",
    };
  } catch (error) {
    return {
      error: true,
      message: "ルート削除中にエラーが発生しました",
    };
  }
};

export const deleteReviewById = async (id: number) => {
  try {
    await db.delete(reviews).where(eq(reviews.id, id));
    
    return {
      success: true,
      message: "レビューが削除されました",
    };
  } catch (error) {
    return {
      error: true,
      message: "レビュー削除中にエラーが発生しました",
    };
  }
};
