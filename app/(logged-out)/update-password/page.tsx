import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/db/drizzle";
import { passwordResetTokens } from "@/db/passwordResetTokensSchema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import UpdatePasswordForm from "./update-password-form";

export default async function UpdatePassword({
  searchParams,
}: {
  searchParams: {
    token?: string;
  };
}) {
  let tokenIsValid = false;

  const { token } = searchParams;
  if (token) {
    const [passwordResetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.token, token));
    const now = Date.now();
    if (
      !!passwordResetToken?.tokenExpiry &&
      now < passwordResetToken.tokenExpiry?.getTime()
    ) {
      tokenIsValid = true;
    }
  }
  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardHeader>
            <CardTitle>
              {tokenIsValid
                ? "パスワードを更新"
                : "パスワードをリセットするためのリンクが無効です"}
            </CardTitle>
          </CardHeader>
        </CardHeader>
        <CardContent>
          {tokenIsValid ? (
            <UpdatePasswordForm token={token ?? ""} />
          ) : (
            <Link className="underline" href="/password-reset">
              パスワード再設定リンクのリクエスト
            </Link>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
