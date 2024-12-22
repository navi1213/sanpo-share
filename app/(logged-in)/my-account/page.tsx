import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import TwoFactorAuthForm from "./two-factor-auth-form";
import db from "@/db/drizzle";
import { users } from "@/db/usersSchema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export default async function MyAccount() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const [user] = await db
    .select({
      twoFactorActivated: users.twoFactorActivated,
      //(logged-in)/layout.tsxにセッションがなければloginに飛ばす処理を書いてるのでsession?.user?.id!としている。
    })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)));

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>My Account</CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Email Address</Label>
        <div className="text-muted-foreground">{session.user.email}</div>
        <TwoFactorAuthForm
          twoFactorActivated={user.twoFactorActivated ?? false}
        />
      </CardContent>
    </Card>
  );
}
