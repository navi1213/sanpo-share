"use client";
import { Form, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
const formSchema = z.object({
  content: z.string().nonempty(),
});
export default function ReviewForm({ params }) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await submitReview({
      content: data.content,
      routeId: params.id,
    });
  };
  return (
    <Card className="flex flex-col gap-4 p-4">
      <CardHeader>
        <CardTitle>レビューを追加</CardTitle>
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
              <Button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md">
                レビューを投稿
              </Button>
            </fieldset>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        {/* 投稿されたレビューリスト */}
        <div className="mt-4">
          <div className="text-sm">レビュー1: 良いルートでした！</div>
          <div className="text-sm">レビュー2: 楽しいコースでした！</div>
          {/* 実際にはデータをマッピングして表示 */}
        </div>
      </CardFooter>
    </Card>
  );
}
