import { z } from "zod";
import { passwordMatchSchema } from "./passwordMatchSchema";

export const userSchema = z.object({
    email: z.string().email("有効なメールアドレスを入力してください"),
    username: z.string().min(3, "ユーザー名は3文字以上で入力してください").max(50, "ユーザー名は50文字以下で入力してください")
}).and(passwordMatchSchema);