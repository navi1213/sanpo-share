import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { NextAuthOptions } from "next-auth";
export const authOptions :NextAuthOptions= {
  debug:true,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // データベース接続
          await dbConnect();

          // ユーザーを検索
          const user = await User.findOne({ email: credentials?.email });
          if (!user) {
            throw new Error("No user found with this email");
          }

          // パスワードを検証
          const isValid = await bcrypt.compare(
            credentials?.password || "",
            user.hashedPassword
          );

          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          // 認証されたユーザーを返す
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authorization failed");
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // 環境変数を参照
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // セッションの有効期限（30日間）
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = token as any;
      return session;
    },
  },
};
