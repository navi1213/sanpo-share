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
import { passwordSchema } from "@/validation/passwordSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loginWithCredential } from "./actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
<<<<<<< HEAD
import { emailSchema } from "@/validation/emailSchema";

const formSchema = z.object({
  email: emailSchema,
=======

const formSchema = z.object({
  email: z.string().email(),
>>>>>>> 03bf1a321dad9fe1d55e22029f12345d06738c11
  password: passwordSchema,
});

export default function Login() {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await loginWithCredential({
      email: data.email,
      password: data.password,
    });
    if (response?.error) {
      form.setError("root", {
        message: response.message,
      });
    } else {
      router.push("/my-account");
    }
  };
<<<<<<< HEAD

  const email = form.getValues("email");

=======
>>>>>>> 03bf1a321dad9fe1d55e22029f12345d06738c11
  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
          <CardDescription>アカウントにログイン</CardDescription>
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
                {!!form.formState.errors.root?.message && (
                  <FormMessage>
                    {form.formState.errors.root.message}
                  </FormMessage>
                )}
                <Button type="submit">ログイン</Button>
              </fieldset>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
<<<<<<< HEAD
          <div className="text-muted-foreground text-xs">
=======
          <div className="text-muted-foreground text-sm">
>>>>>>> 03bf1a321dad9fe1d55e22029f12345d06738c11
            アカウントを持っていませんか？{" "}
            <Link href="/register" className="underline">
              アカウントを作成
            </Link>
          </div>
<<<<<<< HEAD
          <div className="text-muted-foreground text-xs">
            パスワードを忘れましたか？{" "}
            <Link href={`/password-reset${email ? `?email=${encodeURIComponent(email)}` : ""}`} className="underline">
=======
          <div className="text-muted-foreground text-sm">
            パスワードを忘れましたか？{" "}
            <Link href="/password-reset" className="underline">
>>>>>>> 03bf1a321dad9fe1d55e22029f12345d06738c11
              パスワードをリセット
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
