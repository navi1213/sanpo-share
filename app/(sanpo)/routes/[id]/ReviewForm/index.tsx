"use client";

import { FormProvider, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { submitReview } from "./actions";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

const formSchema = z.object({
  content: z.string().nonempty("レビューを入力してください"),
});

export default function ReviewForm({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const formMethods = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await submitReview({
        content: data.content,
        routeId: params.id,
      });
      toast({
        className: "bg-green-500 text-white",
        title: "レビューを投稿しました",
      });
      router.refresh(); // ページをリロード
      formMethods.reset(); // フォームをリセット
    } catch (error) {
      toast({
        title: "エラー",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="flex flex-col gap-4 p-4">
      <CardHeader>
        <CardTitle>レビューを追加</CardTitle>
      </CardHeader>
      <CardContent>
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(handleSubmit)}>
            <fieldset
              disabled={formMethods.formState.isSubmitting}
              className="flex flex-col gap-2"
            >
              {session ? (
                <>
                  <FormField
                    control={formMethods.control}
                    name={"content"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>レビュー</FormLabel>
                        <FormControl>
                          <textarea
                            {...field}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="レビューを入力してください..."
                            rows={4}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    レビューを投稿
                  </Button>
                </>
              ) : (
                <div className="p-4 border border-red-500 rounded-md">
                  <p className="text-red-500">
                    レビューを投稿するにはログインが必要です。
                  </p>
                  <Link href={`/login?redirect=routes/${params.id}`}>
                  <Button
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
                  >
                    ログイン
                  </Button>
                  </Link>
                </div>
              )}
            </fieldset>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
