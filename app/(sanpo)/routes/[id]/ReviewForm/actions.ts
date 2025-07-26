"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { users, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";

type ReviewData = {
  content: string;
  createdBy: string;
  routeId: number;
  author: number;
};

export const submitReview = async ({ 
  content, 
  routeId 
}: { 
  content: string; 
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

    await db.insert(reviews).values({
      content,
      routeId: parseInt(routeId),
      createdBy: user.username,
      author: user.id,
    } as ReviewData);

    return {
      success: true,
      message: "レビューが正常に投稿されました。",
    };
  } catch (error) {
    return {
      error: true,
      message: "レビュー投稿中にエラーが発生しました。",
    };
  }
};
