import { z } from "zod";
export const emailSchema = z.string().email("正しい形式のメールアドレスを入力してください");