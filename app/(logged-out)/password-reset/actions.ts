"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { passwordResetTokens } from "@/db/passwordResetTokensSchema";
import { users } from "@/db/usersSchema";
import { mailer } from "@/lib/email/email";
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
  const [user] = await db
    .select({
      id: users.id,
    })
    .from(users)
    .where(eq(users.email, emailAddress));

  if (!user) {
    //悪用防止であえてエラーメッセージは出さない
    return;
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
    html: passwordResetEmail(emailAddress,resetLink),
  });
};
