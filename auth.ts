import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import db from "./db/drizzle";
import { users } from "./db/usersSchema";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { authenticator } from "otplib";
import { handleError, ErrorFactory, ERROR_MESSAGES } from "@/lib/errors";
import { userLoginSchema } from "@/validation/schemas";
import { SessionUser, AuthSession } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        // userオブジェクトがusernameプロパティを持つかチェック
        token.username = (user as any).username || user.name || "";
      }
      return token;
    },
    session({ session, token }): AuthSession {
      return {
        user: {
          id: token.id as string,
          email: token.email as string | null,
          username: token.username as string,
        },
        expires: session.expires,
      };
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
        token: {},
      },
      async authorize(credentials) {
        try {
          // バリデーション
          const validationResult = userLoginSchema.safeParse({
            email: credentials.email,
            password: credentials.password,
            token: credentials.token,
          });

          if (!validationResult.success) {
            throw ErrorFactory.validation(
              validationResult.error.issues[0]?.message || ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD
            );
          }

          const { email, password, token } = validationResult.data;

          // ユーザー検索
          const [user] = await db.select().from(users).where(eq(users.email, email));

          if (!user) {
            throw ErrorFactory.authentication(ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS);
          }

          // パスワード検証
          const isPasswordCorrect = await compare(password, user.password);
          if (!isPasswordCorrect) {
            throw ErrorFactory.authentication(ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS);
          }

          // 2FA検証
          if (user.twoFactorActivated) {
            if (!token) {
              throw ErrorFactory.authentication("ワンタイムパスワードが必要です");
            }

            const tokenValid = authenticator.check(token, user.twoFactorSecret ?? "");
            if (!tokenValid) {
              throw ErrorFactory.authentication(ERROR_MESSAGES.AUTHENTICATION.INVALID_TOKEN);
            }
          }

          // 認証成功
          return {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
          };
        } catch (error) {
          const appError = handleError(error);
          throw new Error(appError.message);
        }
      },
    }),
    Credentials({
      id: "guest-login",
      name: "Guest Login",
      credentials: {},
      async authorize() {
        try {
          // ゲストユーザーとして認証
          return {
            id: "guest",
            email: null,
            username: "ゲスト",
          };
        } catch (error) {
          const appError = handleError(error);
          throw new Error(appError.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});
