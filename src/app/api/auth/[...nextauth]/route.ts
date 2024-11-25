import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// シンプルにハンドラーをエクスポートするだけで十分です
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
