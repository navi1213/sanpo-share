"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { passwordResetTokens } from "@/db/passwordResetTokensSchema";
import { users } from "@/db/usersSchema";
import { passwordMatchSchema } from "@/validation/schemas";
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";

export const updatePassword = async ({
  token,
  password,
  passwordConfirm,
}: {
  token: string;
  password: string;
  passwordConfirm: string;
}) => {
  try {
    //パスワードの検証
    const passwordValidation = passwordMatchSchema.safeParse({
      password,
      passwordConfirm,
    });
    
    if (!passwordValidation.success) {
      return {
        error: true,
        message:
          passwordValidation.error.issues[0]?.message ?? "エラーが発生しました",
      };
    }
    
    //ログインしているかどうかの検証
    const session = await auth();
    if (!!session?.user?.id) {
      return {
        error: true,
        message:
          "すでにログインしています。パスワードをリセットするにはログアウトしてください。",
      };
    }
    
    //トークンが有効かどうかの検証
    if (!token) {
      return {
        error: true,
        message: "無効なトークンです",
      };
    }
    
    const [passwordResetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
      
    const now = Date.now();
    if (
      !passwordResetToken?.tokenExpiry ||
      now >= passwordResetToken.tokenExpiry.getTime()
    ) {
      return {
        error: true,
        message: "URLが無効か有効期限が切れています",
        tokenInvalid: true,
      };
    }

    const hashedPassword = await hash(password, 10);
    
    await db
      .update(users)
      .set({
        password: hashedPassword,
      })
      .where(eq(users.id, passwordResetToken.userId!));
      
    await db
      .delete(passwordResetTokens)
      .where(eq(passwordResetTokens.id, passwordResetToken.id));

    return {
      success: true,
      message: "パスワードが正常に更新されました",
    };
  } catch (error) {
    return {
      error: true,
      message: "パスワード更新中にエラーが発生しました",
    };
  }
};
