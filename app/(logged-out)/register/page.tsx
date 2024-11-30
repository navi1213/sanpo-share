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
import { passwordMatchSchema } from "@/validation/passwordMatchSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerUser } from "./actions";
import Link from "next/link";

const formSchema = z
  .object({
    email: z.string().email(),
  })
  .and(passwordMatchSchema);
export default function Register() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await registerUser({
      email: data.email,
      password: data.password,
      passwordConfirm: data.passwordConfirm,
    });
    if (response?.error) {
      form.setError("email", {
        message: response?.message,
      });
    }
    // console.log(response);
  };
  return (
    <main className="flex justify-center items-center min-h-screen">
      {form.formState.isSubmitSuccessful ? (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>あなたのアカウントが作成されました。</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
                <Link href="/login">アカウントにログインする</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="w-[350px]">
          <CardHeader>
            <CardTitle>登録</CardTitle>
            <CardDescription>新しいアカウントを作成</CardDescription>
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
                  <FormField
                    control={form.control}
                    name={"password"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>パスワード</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={"passwordConfirm"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>パスワード確認</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="mt-2">登録</Button>
                </fieldset>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
          <div className="text-muted-foreground text-sm">
            すでにアカウントを持っていますか？{" "}
            <Link href="/login" className="underline">
              ログインする
            </Link>
          </div>
        </CardFooter>
        </Card>
      )}
    </main>
  );
}
