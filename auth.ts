import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "./db/drizzle";
import { users } from "./db/usersSchema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { authenticator } from "otplib";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id as string;
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        token: {},
      },
      // ログインのロジックを定義
      async authorize(credentials) {
        // テーブルで見つかった最初の要素を返すようにする
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email as string));
        // ユーザーが見つからなかった場合
        if (!user) {
          throw new Error("メールアドレスで登録されたアカウントが存在しません");
        } else {
          const passwordCorrect = await compare(
            credentials.password as string,
            user.password!
          );
          if (!passwordCorrect) {
            throw new Error("メールアドレスまたはパスワードが間違っています");
          }
          if (user.twoFactorActivated) {
            const tokenValid = authenticator.check(
              credentials.token as string,
              user.twoFactorSecret ?? ""
            );
            if (!tokenValid) {
              throw new Error("ワンタイムパスワードが間違っています");
            }
          }
        }

        // 上のロジックを通ったらJWTトークンを構成するデータを返す
        return {
          id: user.id.toString(),
          email: user.email,
        };
      },
    }),
    Credentials({
      id: "guest-login",
      name: "Guest Login",
      credentials: {},
      async authorize() {
        // ゲストユーザーをデータベースから取得
        const [guestUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, "guest@example.com")); // 固定のゲストメール

        if (!guestUser) {
          throw new Error("ゲストユーザーが見つかりません。");
        }

        return {
          id: guestUser.id.toString(),
          email: guestUser.email,
        };
      },
    }),
  ],
});
