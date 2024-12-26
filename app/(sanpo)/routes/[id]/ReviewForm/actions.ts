"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { users, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
type reviews = {
  content: string;
  createdBy: string;
  routeId: number;
  author: number;
};
export const submitReview = async ({ content, routeId }) => {
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

  await db.insert(reviews).values({
    content,
    routeId: parseInt(routeId),
    createdBy: user.username,
    author: user.id,
  } as reviews);
};
