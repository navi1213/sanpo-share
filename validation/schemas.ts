import { z } from "zod";
import { ERROR_MESSAGES } from "@/lib/errors";

// 座標スキーマ
export const coordinateSchema = z.object({
  lat: z.number().min(-90, "緯度は-90から90の範囲で入力してください").max(90, "緯度は-90から90の範囲で入力してください"),
  lng: z.number().min(-180, "経度は-180から180の範囲で入力してください").max(180, "経度は-180から180の範囲で入力してください"),
});

// パスワードスキーマ
export const passwordSchema = z
  .string()
  .min(8, ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "パスワードは大文字、小文字、数字を含む必要があります");

// パスワード確認スキーマ
export const passwordMatchSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH,
  path: ["confirmPassword"],
});

// ユーザー登録スキーマ
export const userRegistrationSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  username: z.string().min(3, "ユーザー名は3文字以上で入力してください").max(50, "ユーザー名は50文字以下で入力してください"),
}).and(passwordMatchSchema);

// ユーザーログインスキーマ
export const userLoginSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
  password: z.string().min(1, "パスワードを入力してください"),
  token: z.string().optional(),
});

// ルート作成スキーマ
export const routeCreateSchema = z.object({
  name: z.string().min(1, ERROR_MESSAGES.VALIDATION.ROUTE_NAME_REQUIRED).max(100, "ルート名は100文字以下で入力してください"),
  description: z.string().max(500, "説明は500文字以下で入力してください").optional(),
  location: z.string().min(1, ERROR_MESSAGES.VALIDATION.LOCATION_REQUIRED).max(200, "場所は200文字以下で入力してください"),
  path: z.array(coordinateSchema).min(1, ERROR_MESSAGES.VALIDATION.COORDINATES_REQUIRED),
  distance: z.string().min(1, "距離を入力してください"),
});

// ルート更新スキーマ
export const routeUpdateSchema = routeCreateSchema.partial();

// レビュー作成スキーマ
export const reviewCreateSchema = z.object({
  content: z.string().min(1, "レビュー内容を入力してください").max(1000, "レビューは1000文字以下で入力してください"),
  routeId: z.number().positive("有効なルートIDを入力してください"),
});

// レビュー更新スキーマ
export const reviewUpdateSchema = reviewCreateSchema.partial();

// パスワードリセット要求スキーマ
export const passwordResetRequestSchema = z.object({
  email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),
});

// パスワードリセット実行スキーマ
export const passwordResetExecuteSchema = z.object({
  token: z.string().min(1, "トークンを入力してください"),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH,
  path: ["confirmPassword"],
});

// 検索クエリスキーマ
export const searchQuerySchema = z.object({
  q: z.string().min(1, "検索キーワードを入力してください").max(100, "検索キーワードは100文字以下で入力してください"),
  location: z.string().optional(),
  minDistance: z.number().min(0).optional(),
  maxDistance: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// フィルタースキーマ
export const routeFilterSchema = z.object({
  location: z.string().optional(),
  minDistance: z.number().min(0).optional(),
  maxDistance: z.number().min(0).optional(),
  author: z.string().optional(),
  createdAfter: z.string().datetime().optional(),
  createdBefore: z.string().datetime().optional(),
  sortBy: z.enum(['name', 'distance', 'createdAt', 'author']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// 型エクスポート
export type UserRegistrationData = z.infer<typeof userRegistrationSchema>;
export type UserLoginData = z.infer<typeof userLoginSchema>;
export type RouteCreateData = z.infer<typeof routeCreateSchema>;
export type RouteUpdateData = z.infer<typeof routeUpdateSchema>;
export type ReviewCreateData = z.infer<typeof reviewCreateSchema>;
export type ReviewUpdateData = z.infer<typeof reviewUpdateSchema>;
export type PasswordResetRequestData = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetExecuteData = z.infer<typeof passwordResetExecuteSchema>;
export type SearchQueryData = z.infer<typeof searchQuerySchema>;
export type RouteFilterData = z.infer<typeof routeFilterSchema>;
export type Coordinate = z.infer<typeof coordinateSchema>; 