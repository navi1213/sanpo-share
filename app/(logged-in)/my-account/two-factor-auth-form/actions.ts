"use server";

import { auth } from "@/auth";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { authenticator } from "otplib";
export const get2faSecret = async () => {
  const session = await auth();
  //ログインしているかどうかチェック
  if (!session?.user?.id) {
    return {
      error: true,
      message: "ログインしてください",
    };
  }

  const [user] = await db
    .select({
      twoFactorSecret: users.twoFactorSecret,
    })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)));
  //該当するユーザーが見つからなかったらエラーを返す
  if (!user) {
    return {
      error: true,
      message: "ユーザーが見つかりませんでした",
    };
  }
  const twoFactorSecret = user.twoFactorSecret ?? "";
  //ユーザーに二段階認証の秘密鍵がなければ生成してDBに保存
  if (!twoFactorSecret) {
    const generatedTwoFactorSecret = authenticator.generateSecret();
    await db
      .update(users)
      .set({
        // @ts-expect-error: 2fa_secretは存在する
        twoFactorSecret: generatedTwoFactorSecret,
      })
      .where(eq(users.id, parseInt(session.user.id)));
  }
  //googleのauthenticatorで表示するサイト名と名前と秘密鍵をkeyuriにわたす
  return {
    twoFactorSecret: authenticator.keyuri(
      session.user.email ?? "",
      "散歩シェア",
      twoFactorSecret
    ),
  };
};

export const activate2fa = async (token: string) => {
  const session = await auth();
  //ログインしているかどうかチェック
  if (!session?.user?.id) {
    return {
      error: true,
      message: "ログインしてください",
    };
  }
  const [user] = await db
    .select({
      twoFactorSecret: users.twoFactorSecret,
    })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)));

  if (!user) {
    return {
      error: true,
      message: "ユーザーが見つかりませんでした",
    };
  }
  if (user.twoFactorSecret) {
    const tokenValid = authenticator.check(token, user.twoFactorSecret);
    if (!tokenValid) {
      return {
        error: true,
        message: "ワンタイムパスワードが間違ってます",
      };
    }
    await db
      .update(users)
      .set({
        //@ts-expect-error: 2fa_activatedは存在する
        twoFactorActivated: true,
      })
      .where(eq(users.id, parseInt(session.user.id)));
  }
};
export const disable2fa = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      error: true,
      message: "ログインしてください",
    };
  }
  const [user] = await db
    .select({
      twoFactorSecret: users.twoFactorSecret,
    })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)));
  if (!user) {
    return {
      error: true,
      message: "ユーザーが見つかりませんでした",
    };
  }
  await db
    .update(users)
    .set({
      // @ts-expect-error: 2fa_activatedは存在する
      twoFactorActivated: false,
    })
    .where(eq(users.id, parseInt(session.user.id)));
};
