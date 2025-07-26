"use client";

import { useMemo } from "react";
import { Form } from "@/components/molecules/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import MapContainer from "@/components/organisms/Map/MapContainer";
import { RouteFormFields } from "@/components/molecules/RouteFormFields";
import { RouteActionButtons } from "@/components/molecules/RouteActionButtons";
import { useEditForm } from "@/hooks/useEditForm";
import { RouteData } from "@/types/components";
import { updateRoute } from "../actions";

interface EditFormProps {
  route: RouteData;
  params: {
    id: string;
  };
}

const LoadingSpinner = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
      <p className="text-gray-600">地図を読み込み中...</p>
    </div>
  </div>
);

const FormLoadingSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

export default function EditForm({ route, params }: EditFormProps) {
  // 新しいuseEditForm APIに合わせた修正
  const editFormHook = useEditForm({
    route,
    onUpdate: async (data) => {
      // データを正しい型に変換
      const updateData = {
        name: data.name || "",
        description: data.description || "",
        location: data.location || "",
        path: data.path || [],
        distance: data.distance || "0",
        routeId: params.id,
      };
      return await updateRoute(updateData);
    },
  });

  const {
    coordinates,
    distance,
    isDataReady,
    userDeleted,
    form,
    handleCoordinatesUpdate,
    handleDistanceUpdate,
    handleUserDelete,
    onSubmit,
    resetUserDeletedFlag,
  } = editFormHook;

  // 初期座標のメモ化
  const initialCoordinates = useMemo(() => {
    return route?.path || [];
  }, [route?.path]);

  const isMapReady = useMemo(() => {
    return isDataReady && coordinates.length >= 0;
  }, [isDataReady, coordinates.length]);

  const isFormValid = useMemo(() => {
    return form.formState.isValid && coordinates.length > 0;
  }, [form.formState.isValid, coordinates.length]);

  if (!isDataReady) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>ルート編集</CardTitle>
          </CardHeader>
          <CardContent>
            <FormLoadingSkeleton />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ルート編集</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* フォームフィールド */}
              <RouteFormFields control={form.control as any} />

              {/* 地図コンテナ */}
              <div className="w-full h-[500px] relative">
                {isMapReady ? (
                  <MapContainer
                    initialCoordinates={initialCoordinates}
                    onCoordinatesChange={handleCoordinatesUpdate}
                    onDistanceChange={handleDistanceUpdate}
                    onUserDelete={handleUserDelete}
                    height="500px"
                    width="100%"
                  />
                ) : (
                  <LoadingSpinner />
                )}
              </div>

              {/* アクションボタン */}
              <RouteActionButtons
                coordinates={coordinates}
                isFormValid={isFormValid}
                onReset={() => {
                  resetUserDeletedFlag();
                  return "フォームがリセットされました";
                }}
                onDeleteAll={() => {
                  handleUserDelete();
                }}
                onCancel={() => {
                  window.location.href = `/routes/${params.id}`;
                }}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
