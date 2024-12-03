"use server";

import { z } from "zod";
import { passwordSchema } from "@/validation/passwordSchema";
import { signIn } from "@/auth";
export const loginWithCredential = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const loginSchema = z.object({
    email: z.string().email("正しい形式のメールアドレスを入力してください"),
    password: passwordSchema,
  });
  // safeParse は、データを検証し、期待通りのデータであればそのデータを返します。そうでなければ、エラーメッセージを出力します。
  const loginValidation = loginSchema.safeParse({
    email,password
  });
  if(!loginValidation.success) {
    return {
        error:true,
        message:loginValidation.error?.issues[0]?.message ?? "エラーが発生しました",
    }
  };
  try {
    await signIn("credentials",{
        email,
        password,
        redirect:false
    });
  }catch(_:unknown) {
    return {
      error:true,
      message:"メールアドレスまたはパスワードが間違ってます"
    }
  }

};
