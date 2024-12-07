"use server";

import { z } from "zod";
import { passwordSchema } from "@/validation/passwordSchema";
import { signIn } from "@/auth";
import db from "@/db/drizzle";
import { users } from "@/db/usersSchema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { CustomError } from "@/types";
export const loginWithCredential = async ({
  email,
  password,
  token,
}: {
  email: string;
  password: string;
  token?: string;
}) => {
  const loginSchema = z.object({
    email: z.string().email("正しい形式のメールアドレスを入力してください"),
    password: passwordSchema,
  });
  // safeParse は、データを検証し、期待通りのデータであればそのデータを返します。そうでなければ、エラーメッセージを出力します。
  const loginValidation = loginSchema.safeParse({
    email,
    password,
  });
  if (!loginValidation.success) {
    return {
      error: true,
      message:
        loginValidation.error?.issues[0]?.message ?? "エラーが発生しました",
    };
  }
  try {
    await signIn("credentials", {
      email,
      password,
      token,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof Error) {
      const customError = error as CustomError;
    
      let detailedMessage = "不明なエラーが発生しました";
    
      // ネストされたエラー（causeを確認）
      if (customError.cause?.err instanceof Error) {
        detailedMessage = customError.cause.err.message; // 詳細なエラーメッセージを取得
      }
    
      return {
        error: true,
        message: detailedMessage,
      };
    }
  }
};

export const preLoginCheck = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  // ユーザーが見つからなかった場合
  if (!user) {
    return {
      error: true,
      message: "パスワードまたはメールアドレスが間違ってます",
    };
  } else {
    const passwordCorrect = await compare(password, user.password!);
    if (!passwordCorrect) {
      return {
        error: true,
        message: "パスワードまたはメールアドレスが間違ってます",
      };
    }
  }
  return {
    twoFactorActivated: user.twoFactorActivated,
  };
};
