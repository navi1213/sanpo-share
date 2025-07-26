import { InferModel } from "drizzle-orm";
import { users } from "./usersSchema";
import { routes } from "./routesSchema";
import { reviews } from "./reviewsSchema";
import { passwordResetTokens } from "./passwordResetTokensSchema";

// データベーススキーマから型を自動生成
export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

export type Route = InferModel<typeof routes>;
export type NewRoute = InferModel<typeof routes, "insert">;

export type Review = InferModel<typeof reviews>;
export type NewReview = InferModel<typeof reviews, "insert">;

export type PasswordResetToken = InferModel<typeof passwordResetTokens>;
export type NewPasswordResetToken = InferModel<typeof passwordResetTokens, "insert">;

// パース済みのルート型（pathフィールドをJSONとして解析）
export interface ParsedRoute extends Omit<Route, 'path'> {
  path: Array<{ lat: number; lng: number }>;
}

// ユーザー選択フィールドの型
export type UserSelect = {
  id: number;
  username: string;
  email: string | null;
  createdAt: Date;
  twoFactorActivated: boolean;
};

// ルート選択フィールドの型
export type RouteSelect = {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  path: string;
  distance: string;
  createdBy: string | null;
  author: number | null;
};

// レビュー選択フィールドの型
export type ReviewSelect = {
  id: number;
  content: string;
  createdBy: string | null;
  routeId: number | null;
  author: number | null;
}; 