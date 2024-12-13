import { z } from "zod";
import { passwordMatchSchema } from "./passwordMatchSchema";
export const userSchema = z.object({
    email:z.string().email("正しい形式のメールアドレスを入力してください"),
    username:z.string().min(3,"ユーザー名は３文字以上にしてください")
}).and(passwordMatchSchema);