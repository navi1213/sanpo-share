"use client";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import MapWithDrawing from "@/components/MapWithDrawing";
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
import { registerRoute } from "./actions"; // サーバー側処理をインポート
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
export default function New() {
  const [coordinates, setCoordinates] = useState<
    { lat: number; lng: number }[]
  >([]);
  const handleCoordinatesUpdate = (
    newCoordinates: { lat: number; lng: number }[]
  ) => {
    console.log("座標データ:", newCoordinates); // デバッグ用
    setCoordinates(newCoordinates);
  };
  const { toast } = useToast();
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
  /**
   *
   */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      path: coordinates.length > 0 ? coordinates : [{ lat: 0, lng: 0 }],
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    // サーバー側にデータを送信
    const response = await registerRoute({
      name: data.name,
      description: data.description,
      location: data.location,
      path: coordinates as { lat: number; lng: number }[],
    });
    if (response?.error) {
      // エラー処理
      form.setError("root", {
        message: response.message,
      });
    } else {
      console.log("正常に登録されました");
      toast({
        title: "ルートの登録",
        description: "散歩ルートが正常に登録されました",
        className: "bg-green-500 text-white",
      });
      setCoordinates([]);
      form.reset(); // フォームのリセット
    }
  };
  

  return (
    <div className="flex">
      <div className="w-1/2">
        <MapWithDrawing
          onCoordinatesChange={handleCoordinatesUpdate}
        />
      </div>
      <div>
        {coordinates.length !== 0 ? (
          coordinates.map((c, index) => (
            <div key={index}>
              緯度: {c.lat}, 経度: {c.lng}
            </div>
          ))
        ) : (
          <div>座標がありません</div>
        )}
      </div>
      <div className="w-1/2">
        <Card>
          <CardHeader>
            <CardTitle>新しい散歩ルートを作成</CardTitle>
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
                    name={"name"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ルート名</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 説明 */}
                  <FormField
                    control={form.control}
                    name={"description"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>説明</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                          {/* <Input {...field} type="text" /> */}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* 場所情報 */}
                  <FormField
                    control={form.control}
                    name={"location"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>場所情報</FormLabel>
                        <FormControl>
                          <Input {...field} type="text" />
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
                  <Button type="submit">ルートを登録</Button>
                </fieldset>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
