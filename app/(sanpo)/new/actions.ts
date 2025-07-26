"use server";

import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { routes, users } from "@/db/schema";
import { auth } from "@/auth";
import { routeCreateSchema } from "@/validation/schemas";
import { handleError, ErrorFactory, ApiResponseHelper, ERROR_MESSAGES } from "@/lib/errors";
import { RouteCreateData, ApiResponse } from "@/types";
import { NewRoute } from "@/db/types";

export const registerRoute = async (data: RouteCreateData): Promise<ApiResponse> => {
  try {
    console.log('registerRoute: 開始', data);
    
    // セッション確認
    const session = await auth();
    console.log('registerRoute: セッション確認の詳細', {
      session: session,
      hasUser: !!session?.user,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      fullUser: session?.user
    });

    if (!session?.user?.id) {
      console.log('registerRoute: セッションエラー - ユーザーIDなし');
      return ApiResponseHelper.error(
        ErrorFactory.authentication(ERROR_MESSAGES.AUTHENTICATION.LOGIN_REQUIRED)
      );
    }

    // ゲストユーザーかどうかをチェック
    const isGuestUser = session.user.id === "guest";
    console.log('registerRoute: ゲストユーザーかどうか', isGuestUser);

    // バリデーション
    console.log('registerRoute: バリデーション開始');
    const validationResult = routeCreateSchema.safeParse(data);
    console.log('registerRoute: バリデーション結果', validationResult);
    if (!validationResult.success) {
      console.log('registerRoute: バリデーションエラー', validationResult.error);
      return ApiResponseHelper.error(
        ErrorFactory.validation(
          validationResult.error.issues[0]?.message || ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
        )
      );
    }

    const { name, description, location, path, distance } = validationResult.data;
    console.log('registerRoute: バリデーション済みデータ', { name, description, location, path: path.length, distance });

    let userData: { id: number | null; username: string };

    if (isGuestUser) {
      // ゲストユーザーの場合
      console.log('registerRoute: ゲストユーザーとして処理');
      userData = {
        id: null, // ゲストユーザーはauthorをnullに
        username: "ゲスト"
      };
    } else {
      // 通常ユーザーの場合
      if (!session.user.email) {
        console.log('registerRoute: セッションエラー - メールアドレスなし');
        return ApiResponseHelper.error(
          ErrorFactory.authentication("メールアドレスが見つかりません")
        );
      }

      // ユーザー情報取得
      console.log('registerRoute: ユーザー情報取得開始');
      const [user] = await db
        .select({
          id: users.id,
          username: users.username,
        })
        .from(users)
        .where(eq(users.email, session.user.email));

      console.log('registerRoute: ユーザー情報取得結果', user);
      if (!user) {
        console.log('registerRoute: ユーザーが見つからない');
        return ApiResponseHelper.error(
          ErrorFactory.notFound(ERROR_MESSAGES.NOT_FOUND.USER_NOT_FOUND)
        );
      }
      userData = user;
    }

    // ルートデータの作成
    const pathString = JSON.stringify(path);
    console.log('registerRoute: パス文字列化確認', {
      pathOriginal: path,
      pathStringified: pathString,
      pathLength: path.length,
      pathStringType: typeof pathString
    });

    const routeData: NewRoute = {
      name,
      description: description || null,
      location,
      path: pathString,
      distance,
      createdBy: userData.username,
      author: userData.id,
    };
    console.log('registerRoute: ルートデータ作成', {
      ...routeData,
      pathType: typeof routeData.path
    });

    // データベースに挿入
    console.log('registerRoute: データベース挿入開始');
    await db.insert(routes).values(routeData);
    console.log('registerRoute: データベース挿入完了');

    return ApiResponseHelper.success(
      { message: "ルートが正常に作成されました" },
      "ルートが作成されました"
    );
  } catch (error) {
    console.error('registerRoute: エラー', error);
    const appError = handleError(error);
    return ApiResponseHelper.error(appError);
  }
};

// ルート取得アクション
export const getRoutes = async (): Promise<ApiResponse> => {
  try {
    const routesData = await db
      .select()
      .from(routes)
      .orderBy(routes.createdBy);

    return ApiResponseHelper.success(routesData);
  } catch (error) {
    const appError = handleError(error);
    return ApiResponseHelper.error(appError);
  }
};

// 特定のルート取得アクション
export const getRouteById = async (id: number): Promise<ApiResponse> => {
  try {
    const [route] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, id));

    if (!route) {
      return ApiResponseHelper.error(
        ErrorFactory.notFound(ERROR_MESSAGES.NOT_FOUND.ROUTE_NOT_FOUND)
      );
    }

    return ApiResponseHelper.success(route);
  } catch (error) {
    const appError = handleError(error);
    return ApiResponseHelper.error(appError);
  }
};

// ルート更新アクション
export const updateRoute = async (
  id: number,
  data: Partial<RouteCreateData>
): Promise<ApiResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return ApiResponseHelper.error(
        ErrorFactory.authentication(ERROR_MESSAGES.AUTHENTICATION.LOGIN_REQUIRED)
      );
    }

    // ルートの存在確認と権限確認
    const [route] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, id));

    if (!route) {
      return ApiResponseHelper.error(
        ErrorFactory.notFound(ERROR_MESSAGES.NOT_FOUND.ROUTE_NOT_FOUND)
      );
    }

    // ユーザー情報取得
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!user || route.author !== user.id) {
      return ApiResponseHelper.error(
        ErrorFactory.authorization(ERROR_MESSAGES.AUTHORIZATION.ACCESS_DENIED)
      );
    }

    // 更新データの準備
    const updateData: Partial<NewRoute> = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.location) updateData.location = data.location;
    if (data.path) updateData.path = JSON.stringify(data.path);
    if (data.distance) updateData.distance = data.distance;

    // データベース更新
    await db
      .update(routes)
      .set(updateData)
      .where(eq(routes.id, id));

    return ApiResponseHelper.success(
      { message: "ルートが正常に更新されました" },
      "ルートが更新されました"
    );
  } catch (error) {
    const appError = handleError(error);
    return ApiResponseHelper.error(appError);
  }
};

// ルート削除アクション
export const deleteRoute = async (id: number): Promise<ApiResponse> => {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return ApiResponseHelper.error(
        ErrorFactory.authentication(ERROR_MESSAGES.AUTHENTICATION.LOGIN_REQUIRED)
      );
    }

    // ルートの存在確認と権限確認
    const [route] = await db
      .select()
      .from(routes)
      .where(eq(routes.id, id));

    if (!route) {
      return ApiResponseHelper.error(
        ErrorFactory.notFound(ERROR_MESSAGES.NOT_FOUND.ROUTE_NOT_FOUND)
      );
    }

    // ユーザー情報取得
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email));

    if (!user || route.author !== user.id) {
      return ApiResponseHelper.error(
        ErrorFactory.authorization(ERROR_MESSAGES.AUTHORIZATION.ACCESS_DENIED)
      );
    }

    // データベース削除
    await db.delete(routes).where(eq(routes.id, id));

    return ApiResponseHelper.success(
      { message: "ルートが正常に削除されました" },
      "ルートが削除されました"
    );
  } catch (error) {
    const appError = handleError(error);
    return ApiResponseHelper.error(appError);
  }
};
