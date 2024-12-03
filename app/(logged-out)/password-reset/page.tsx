"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { passwordReset } from "./actions";
import { emailSchema } from "@/validation/emailSchema";

const formSchema = z.object({
  email: emailSchema,
});

export default function PasswordReset() {
  const searchParams = useSearchParams();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: decodeURIComponent(searchParams.get("email") ?? ""),
    },
  });
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    await passwordReset(data.email);
  };
  return (
    <main className="flex justify-center items-center min-h-screen">
      {form.formState.isSubmitSuccessful ? (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>
              メールを送信しました
            </CardTitle>
          </CardHeader>
          <CardContent>
            アカウントが存在すれば、{form.getValues("email")}にパスワードリセットのメールが届きます。
          </CardContent>
          </Card>
      ) : (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>パスワードをリセット</CardTitle>
            <CardDescription>
              パスワードをリセットするためにメールアドレスを入力
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <fieldset
                  disabled={form.formState.isSubmitting}
                  className="flex flex-col gap-2"
                >
                  <FormField
                    control={form.control}
                    name={"email"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!!form.formState.errors.root?.message && (
                    <FormMessage>
                      {form.formState.errors.root.message}
                    </FormMessage>
                  )}
                  <Button type="submit">送信</Button>
                </fieldset>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <div className="text-muted-foreground text-xs">
              パスワードを思い出しましたか?{" "}
              <Link href="/login" className="underline">
                ログイン
              </Link>
            </div>
            <div className="text-muted-foreground text-xs">
              アカウントを持っていませんか?{" "}
              <Link href="/register" className="underline">
                アカウントを作成
              </Link>
            </div>
          </CardFooter>
        </Card>
      )}
    </main>
  );
}
