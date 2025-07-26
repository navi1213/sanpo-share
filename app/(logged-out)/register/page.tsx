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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { registerUser } from "./actions";
import Link from "next/link";
import { userRegistrationSchema } from "@/validation/schemas";

const formSchema = userRegistrationSchema;
export default function Register() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    console.log('登録フォーム送信:', data);
    console.log('フォームエラー:', form.formState.errors);
    console.log('フォーム値の型確認:', {
      email: { value: data.email, type: typeof data.email, length: data.email?.length },
      username: { value: data.username, type: typeof data.username, length: data.username?.length },
      password: { value: '***', type: typeof data.password, length: data.password?.length },
      confirmPassword: { value: '***', type: typeof data.confirmPassword, length: data.confirmPassword?.length }
    });
    
    const response = await registerUser({
      email: data.email,
      username: data.username,
      password: data.password,
      passwordConfirm: data.confirmPassword, // ここは関数の引数名なのでpasswordConfirmのまま
    });
    
    console.log('登録レスポンス:', response);
    
    if (response?.error) {
      console.log('登録エラー:', response.message);
      form.setError("email", {
        message: response?.message,
      });
    }
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
                    name={"username"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ユーザー名</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                    name={"confirmPassword"}
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
                  <Button 
                    type="submit" 
                    className="mt-2" 
                    disabled={form.formState.isSubmitting}
                    onClick={() => {
                      console.log('通常の登録ボタンがクリックされました');
                      console.log('フォーム有効状態:', form.formState.isValid);
                      console.log('現在のエラー:', form.formState.errors);
                    }}
                  >
                    {form.formState.isSubmitting ? "登録中..." : "登録"}
                  </Button>
                  
                  {/* テスト用: 強制送信ボタン */}
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-2 w-full" 
                    onClick={() => {
                      console.log('強制送信ボタンがクリックされました');
                      const currentValues = form.getValues();
                      console.log('現在のフォーム値:', currentValues);
                      handleSubmit(currentValues);
                    }}
                    disabled={form.formState.isSubmitting}
                  >
                    強制送信（テスト用）
                  </Button>
                  
                  {/* デバッグ情報 */}
                  <div className="mt-2 text-xs text-gray-500 border p-2 rounded">
                    <div>フォーム有効: {form.formState.isValid ? "はい" : "いいえ"}</div>
                    <div>送信中: {form.formState.isSubmitting ? "はい" : "いいえ"}</div>
                    <div>エラー数: {Object.keys(form.formState.errors).length}</div>
                    
                    {/* 各フィールドのエラー詳細 */}
                    {Object.keys(form.formState.errors).length > 0 && (
                      <div className="mt-2">
                        <div className="font-bold">エラー詳細:</div>
                        {Object.entries(form.formState.errors).map(([field, error]) => (
                          <div key={field} className="text-red-500">
                            {field}: {error?.message || 'エラーあり'}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* フォーム値の確認 */}
                    <div className="mt-2">
                      <div className="font-bold">現在の値:</div>
                      <div>email: "{form.watch('email')}" (長さ: {form.watch('email')?.length || 0})</div>
                      <div>username: "{form.watch('username')}" (長さ: {form.watch('username')?.length || 0})</div>
                      <div>password: 長さ {form.watch('password')?.length || 0}</div>
                      <div>confirmPassword: 長さ {form.watch('confirmPassword')?.length || 0}</div>
                    </div>
                  </div>
                </fieldset>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex-col gap-2">
          <div className="text-muted-foreground text-xs">
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
