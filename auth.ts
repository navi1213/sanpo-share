import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "./db/drizzle";
import { users } from "./db/usersSchema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    jwt({token,user}) {
      if(user) {
        token.id = user.id
      }
      return token;
    },
    session({session,token}) {
      session.user.id = token.id as string;
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
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
            throw new Error("パスワードが間違っています");
          }
        }

        // 上のロジックを通ったらJWTトークンを構成するデータを返す
        return {
          id: user.id.toString(),
          email: user.email,
        };
      },
    }),
  ],
});
