"use server";

<<<<<<< HEAD
import { z } from "zod";
=======
import db from "@/db/drizzle";
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { z } from "zod";
import { hash } from "bcryptjs";
import { users } from "@/db/schema";
>>>>>>> 03bf1a321dad9fe1d55e22029f12345d06738c11
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
<<<<<<< HEAD
    email: z.string().email("正しい形式のメールアドレスを入力してください"),
=======
    email: z.string().email(),
>>>>>>> 03bf1a321dad9fe1d55e22029f12345d06738c11
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
  }catch(e) {
    return {
      error:true,
      message:"メールアドレスまたはパスワードが間違ってます"
    }
  }

};
