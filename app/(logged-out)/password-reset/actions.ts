"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { passwordResetTokens } from "@/db/passwordResetTokensSchema";
import { users } from "@/db/usersSchema";
import { mailer } from "@/lib/email";
import { passwordResetEmail } from "@/lib/email/template";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";

export const passwordReset = async (emailAddress: string) => {
  const session = await auth();

  if (!!session?.user?.id) {
    return {
      error: true,
      message: "すでにログインしています。",
    };
  }
  
  try {
    const [user] = await db
      .select({
        id: users.id,
      })
      .from(users)
      .where(eq(users.email, emailAddress));

    if (!user) {
      // 悪用防止であえてエラーメッセージは出さない
      return {
        success: true,
        message: "パスワードリセットメールを送信しました（該当するメールアドレスが存在する場合）。",
      };
    }

    const passwordResetToken = randomBytes(32).toString("hex");
    // 3600000ms = 1hour
    const tokenExpiry = new Date(Date.now() + 3600000);
    
    await db
      .insert(passwordResetTokens)
      .values({
        userId: user.id,
        token: passwordResetToken,
        tokenExpiry,
      })
      .onConflictDoUpdate({
        target: passwordResetTokens.userId,
        set: {
          token: passwordResetToken,
          tokenExpiry,
        },
      });
      
    const resetLink = `${process.env.SITE_BASE_URL}/update-password?token=${passwordResetToken}`;
    
    await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      subject: "パスワード再設定のご案内",
      to: emailAddress,
      html: passwordResetEmail(emailAddress, resetLink),
    });

    return {
      success: true,
      message: "パスワードリセットメールを送信しました。",
    };
  } catch (error) {
    return {
      error: true,
      message: "パスワードリセット処理中にエラーが発生しました。",
    };
  }
};
