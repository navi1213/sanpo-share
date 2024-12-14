"use server";
import { eq, InferModel } from "drizzle-orm"
import db from "@/db/drizzle";
import { routes, users } from "@/db/schema";
import { auth } from "@/auth";
import { z } from "zod";
type RouteInsert = InferModel<typeof routes, "insert">;
export const registerRoute = async ({
  name,
  description,
  location,
  path,
}: {
  name: string;
  description: string;
  location: string;
  path: { lat: number; lng: number }[];
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
      username:users.username
    })
    .from(users)
    .where(eq(users.email, session.user.email));
    if (!user) {
      return {
        error:true,
        message:"ユーザーが見つかりませんでした。"
      }
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
    await db.insert(routes).values({
      name,description,location,path:JSON.stringify(path),createdBy:user.username
    }as RouteInsert);

    return { success: true, message: "ルートが作成されました" };
  } catch (error) {
    return {
      error: true,
      message: error instanceof Error ? error.message : "エラーが発生しました",
    };
  }
};
