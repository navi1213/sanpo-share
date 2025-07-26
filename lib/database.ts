import db from "@/db/drizzle";
import { users, routes, reviews } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NewUser, NewRoute, NewReview, ParsedRoute } from "@/db/types";

// ユーザー関連のデータベース操作
export const userDb = {
  // ユーザー作成
  create: async (userData: NewUser) => {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  },

  // メールアドレスでユーザー検索
  findByEmail: async (email: string) => {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  },

  // ユーザー名でユーザー検索
  findByUsername: async (username: string) => {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  },

  // IDでユーザー検索
  findById: async (id: number) => {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  },

  // ユーザー更新
  update: async (id: number, userData: Partial<NewUser>) => {
    const [user] = await db.update(users).set(userData).where(eq(users.id, id)).returning();
    return user;
  },

  // ユーザー削除
  delete: async (id: number) => {
    await db.delete(users).where(eq(users.id, id));
  },
};

// ルート関連のデータベース操作
export const routeDb = {
  // ルート作成
  create: async (routeData: NewRoute) => {
    const [route] = await db.insert(routes).values(routeData).returning();
    return route;
  },

  // すべてのルート取得
  findAll: async () => {
    return await db.select().from(routes);
  },

  // IDでルート取得
  findById: async (id: number): Promise<ParsedRoute | null> => {
    const [route] = await db.select().from(routes).where(eq(routes.id, id));
    if (!route) return null;

    return {
      ...route,
      path: JSON.parse(route.path as string),
    };
  },

  // ユーザーのルート取得
  findByAuthor: async (authorId: number) => {
    return await db.select().from(routes).where(eq(routes.author, authorId));
  },

  // ルート更新
  update: async (id: number, routeData: Partial<NewRoute>) => {
    const [route] = await db.update(routes).set(routeData).where(eq(routes.id, id)).returning();
    return route;
  },

  // ルート削除
  delete: async (id: number) => {
    await db.delete(routes).where(eq(routes.id, id));
  },
};

// レビュー関連のデータベース操作
export const reviewDb = {
  // レビュー作成
  create: async (reviewData: NewReview) => {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    return review;
  },

  // ルートのレビュー取得
  findByRouteId: async (routeId: number) => {
    return await db.select().from(reviews).where(eq(reviews.routeId, routeId));
  },

  // ユーザーのレビュー取得
  findByAuthor: async (authorId: number) => {
    return await db.select().from(reviews).where(eq(reviews.author, authorId));
  },

  // レビュー更新
  update: async (id: number, reviewData: Partial<NewReview>) => {
    const [review] = await db.update(reviews).set(reviewData).where(eq(reviews.id, id)).returning();
    return review;
  },

  // レビュー削除
  delete: async (id: number) => {
    await db.delete(reviews).where(eq(reviews.id, id));
  },
}; 