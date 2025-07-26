"use server";

import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { routes, users } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { Coordinate } from "@/types";

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

export async function fetchRouteById(id: string) {
  try {
    const [route] = await db
      .select({
        id: routes.id,
        name: routes.name,
        description: routes.description,
        location: routes.location,
        path: routes.path,
        distance: routes.distance,
        createdBy: routes.createdBy,
        author: routes.author,
      })
      .from(routes)
      .where(eq(routes.id, parseInt(id)));

    if (!route) {
      throw new Error("ルートが見つかりません");
    }

    // パス解析 - 型安全な処理
    let parsedPath: Coordinate[] = [];
    
    if (isCoordinateArray(route.path)) {
      parsedPath = route.path;
    } else if (typeof route.path === 'string') {
      try {
        const parsed = JSON.parse(route.path);
        if (isCoordinateArray(parsed)) {
          parsedPath = parsed;
        }
      } catch {
        parsedPath = [];
      }
    }

    return {
      success: true,
      route: {
        ...route,
        path: parsedPath,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "ルートの取得に失敗しました",
    };
  }
}

export async function updateRoute({
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
}) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return {
        success: false,
        error: "ログインしてください。",
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
        success: false,
        error: "ユーザーが見つかりませんでした。",
      };
    }

    const coordinateSchema = z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    });

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
        success: false,
        error: newFormValidation.error.issues[0]?.message ?? "エラーが発生しました",
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
    revalidatePath(`/routes/${routeId}`);
    revalidatePath('/routes');

    return { 
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "ルート更新中にエラーが発生しました",
    };
  }
}
