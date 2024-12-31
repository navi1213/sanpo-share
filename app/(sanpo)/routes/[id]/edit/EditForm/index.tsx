"use client";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import EditMapWithDrawing from "@/components/EditMapWithDrawing";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { updateRoute } from "../actions";
import { useRouter } from "next/navigation";
export default function EditForm({ route, params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [coordinates, setCoordinates] = useState<
    { lat: number; lng: number }[]
  >(route.path);
  const [distance, setDistance] = useState(null);
  const handleCoordinatesUpdate = (
    newCoordinates: { lat: number; lng: number }[]
  ) => {
    setCoordinates(newCoordinates);
  };
  const coordinateSchema = z.object({
    lat: z.number().min(-90).max(90), // 緯度の範囲
    lng: z.number().min(-180).max(180), // 経度の範囲
  });

  // フォームスキーマ全体
  const formSchema = z.object({
    name: z.string().min(1, "ルート名は必須です"),
    description: z.string(),
    location: z.string().min(1, "場所情報は必須です"),
    path: z.array(coordinateSchema).min(1, "少なくとも1つの座標が必要です"),
  });
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `${route.name}`,
      description: `${route.description}`,
      location: `${route.location}`,
      path: route.path,
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // サーバー側にデータを送信
    const response = await updateRoute({
      name: data.name,
      description: data.description,
      location: data.location,
      path: coordinates as { lat: number; lng: number }[],
      distance,
      routeId:route.id
    });
    if (response?.error) {
      // エラー処理
      form.setError("root", {
        message: response.message,
      });
    } else {
      toast({
        title: "ルートの登録",
        description: "散歩ルートが正常に登録されました",
        className: "bg-green-500 text-white",
      });
      setCoordinates([]);
      form.reset(); // フォームのリセット
    }
    router.push(`/routes/${params.id}`);
  };
  return (
    <div className="flex flex-col gap-4">
      {/* 地図エリア */}
      <div className="w-full h-[500px]">
        <EditMapWithDrawing
          onCoordinatesChange={handleCoordinatesUpdate}
          onDistanceChange={setDistance}
          initialCoordinates={route.path}
        />
      </div>

      {/* フォームエリア */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>散歩ルートを編集</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <fieldset
                  className="flex flex-col gap-4"
                  disabled={form.formState.isSubmitting}
                >
                  {/* ルート名 */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ルート名</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 説明 */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>説明</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 場所情報 */}
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>場所情報</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!!form.formState.errors.root?.message && (
                    <FormMessage>
                      {form.formState.errors.root?.message}
                    </FormMessage>
                  )}

                  <Button type="submit">ルートを更新</Button>
                </fieldset>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
