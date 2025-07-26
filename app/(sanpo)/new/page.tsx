"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import MapContainer from "@/components/organisms/Map/MapContainer";
import { registerRoute } from "./actions";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { routeCreateSchema, type RouteCreateData } from "@/validation/schemas";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Coordinate } from "@/types";

import { Textarea } from "@/components/ui/textarea";

const RouteCreatePage = () => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState<string>("0.00 km");
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<RouteCreateData>({
    resolver: zodResolver(routeCreateSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      path: [],
      distance: "",
    },
  });

  const handleCoordinatesUpdate = useCallback((newCoordinates: Coordinate[]) => {
    console.log('座標更新:', newCoordinates.length, '点');
    setCoordinates(newCoordinates);
    form.setValue("path", newCoordinates);
  }, [form]);

  const handleDistanceUpdate = useCallback((newDistance: string) => {
    console.log('距離更新:', newDistance);
    setDistance(newDistance);
    form.setValue("distance", newDistance);
  }, [form]);

  const onSubmit = async (data: RouteCreateData) => {
    try {
      console.log('フォーム送信データ:', data);
      
      const result = await registerRoute({
        name: data.name,
        description: data.description,
        location: data.location,
        path: coordinates,
        distance: distance,
      });

      if (result.error) {
        console.error('保存エラー:', result.message);
        toast({
          title: "エラー",
          description: result.message || "ルートの保存に失敗しました",
          variant: "destructive",
        });
        return;
      }

      console.log('保存成功');
      toast({
        title: "成功",
        description: "ルートが正常に保存されました",
      });

      // 成功時にルート一覧ページにリダイレクト
      router.push('/routes');
    } catch (error) {
      console.error('予期しないエラー:', error);
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました",
        variant: "destructive",
      });
    }
  };

  // MapContainerのメモ化
  const mapContainer = useMemo(() => (
    <MapContainer
      onCoordinatesChange={handleCoordinatesUpdate}
      onDistanceChange={handleDistanceUpdate}
    />
  ), [handleCoordinatesUpdate, handleDistanceUpdate]);

  return (
    <div className="flex flex-col gap-4">
      {/* 地図エリア */}
      <div className="w-full h-[500px]">
        {mapContainer}
      </div>

      {/* フォームエリア */}
      <Card>
        <CardHeader>
          <CardTitle>ルート情報を入力</CardTitle>
        </CardHeader>
        <CardContent>
          {/* データ表示 */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">座標数:</span>
                <span className="ml-2">{coordinates.length} 点</span>
              </div>
              <div>
                <span className="font-medium">距離:</span>
                <span className="ml-2">{distance}</span>
              </div>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ルート名</FormLabel>
                    <FormControl>
                      <Input placeholder="散歩のルート名を入力してください" {...field} />
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
                        placeholder="このルートの特徴や見どころを教えてください" 
                        className="resize-none"
                        rows={3}
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
                      <Input placeholder="地域や最寄り駅などを入力してください" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                disabled={coordinates.length === 0 || !form.formState.isValid}
                className="w-full"
              >
                ルートを保存
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RouteCreatePage;
