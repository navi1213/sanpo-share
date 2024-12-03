import { z } from "zod";
export const passwordSchema = z
  .string()
  .min(5, "パスワードは少なくとも5文字以上にしてください");
