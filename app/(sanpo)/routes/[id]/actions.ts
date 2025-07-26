"use server";
import { auth } from "@/auth";
import db from "@/db/drizzle";
import { reviews } from "@/db/reviewsSchema";
import { routes } from "@/db/routesSchema";
import { eq } from "drizzle-orm";
import { Coordinate } from "@/types";

// 型ガード関数
function isCoordinateArray(value: unknown): value is Coordinate[] {
  return Array.isArray(value) && 
    value.every(item => 
      typeof item === 'object' && 
      item !== null && 
      'lat' in item && 
      'lng' in item &&
      typeof item.lat === 'number' &&
      typeof item.lng === 'number'
    );
}

// 特定のルート取得
export const fetchRouteById = async (id: string) => {
  try {
    const [route] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, parseInt(id)));

    if (!route) {
      return null;
    }

    // pathをJSONパースして返す - 型安全な処理
    let parsedPath: Coordinate[] = [];
    
    try {
      if (isCoordinateArray(route.path)) {
        parsedPath = route.path;
      } else if (typeof route.path === 'string') {
        const parsed = JSON.parse(route.path);
        if (isCoordinateArray(parsed)) {
          parsedPath = parsed;
        }
      }
    } catch (parseError) {
      console.error('fetchRouteById: パス解析エラー', parseError);
      parsedPath = [];
    }

    const result = {
      ...route,
      path: parsedPath,
    };

    return result;
  } catch (error) {
    console.error('fetchRouteById: データベースエラー:', error);
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
