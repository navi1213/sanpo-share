"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import MapContainer from "@/components/Map/MapContainer";
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
import { registerRoute } from "./actions";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { routeCreateSchema, RouteCreateData } from "@/validation/schemas";
import { Coordinate } from "@/types";

export default function New() {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState<string>("0");
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<RouteCreateData>({
    resolver: zodResolver(routeCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      path: [],
      distance: "0",
    },
  });

  const handleCoordinatesUpdate = (newCoordinates: Coordinate[]) => {
    setCoordinates(newCoordinates);
    form.setValue("path", newCoordinates);
  };

  const handleDistanceUpdate = (newDistance: string) => {
    setDistance(newDistance);
    form.setValue("distance", newDistance);
  };

  const handleSubmit = async (data: RouteCreateData) => {
    try {
      // デバッグ情報を出力
      console.log('フォームデータ:', data);
      console.log('座標:', coordinates);
      console.log('距離:', distance);
      console.log('フォームの状態:', form.formState);
      console.log('エラー:', form.formState.errors);

      const response = await registerRoute({
        ...data,
        path: coordinates,
        distance,
      });

      console.log('レスポンス:', response);

      if (!response.success) {
        toast({
          title: "エラー",
          description: response.error || "ルートの登録に失敗しました",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "成功",
        description: "散歩ルートが正常に登録されました",
      });

      setCoordinates([]);
      setDistance("0");
      form.reset();
      router.push("/routes");
    } catch (error) {
      console.error('エラーの詳細:', error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 地図エリア */}
      <div className="w-full h-[500px]">
        <MapContainer
          onCoordinatesChange={handleCoordinatesUpdate}
          onDistanceChange={handleDistanceUpdate}
          initialCoordinates={coordinates}
        />
      </div>

      {/* フォームエリア */}
      <div className="w-full">
        <Card>
          <CardHeader>
            <CardTitle>新しい散歩ルートを作成</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ルート名</FormLabel>
                      <FormControl>
                        <Input placeholder="散歩ルートの名前を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>説明</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="ルートの説明を入力（任意）"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>場所</FormLabel>
                      <FormControl>
                        <Input placeholder="場所を入力" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">
                      描画された距離: {distance} km
                    </p>
                    <p className="text-sm text-gray-500">
                      座標数: {coordinates.length} 点
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={coordinates.length === 0 || !form.formState.isValid}
                    className="flex-1"
                  >
                    ルートを保存
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCoordinates([]);
                      setDistance("0");
                      form.reset();
                    }}
                  >
                    リセット
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
