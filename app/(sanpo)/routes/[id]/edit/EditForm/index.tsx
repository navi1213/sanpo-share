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
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className={`h-${i === 1 ? '20' : '10'} bg-gray-200 rounded`}></div>
      </div>
    ))}
  </div>
);

export default function EditForm({ route, params }: EditFormProps) {
  const {
    coordinates,
    distance,
    initialCoordinates,
    isDataReady,
    form,
    handleCoordinatesUpdate,
    handleDistanceUpdate,
    handleUserDelete,
    handleReset,
    handleDeleteAll,
    handleSubmit,
    isFormValid,
    onCancel,
  } = useEditForm({
    route,
    routeId: params.id,
    updateRoute,
  });

  console.log('📝 EditForm初期化:', {
    routeId: route.id,
    routeName: route.name,
    routePathLength: route.path?.length || 0,
    timestamp: new Date().toISOString()
  });

  // MapContainerのメモ化
  const mapContainer = useMemo(() => {
    console.log('🗺️ EditForm: MapContainer メモ化チェック:', {
      initialCoordinatesLength: initialCoordinates.length,
      coordinatesLength: coordinates.length,
      isDataReady: isDataReady
    });
    
    if (!isDataReady) {
      return <LoadingSpinner />;
    }
    
    return (
      <MapContainer
        onCoordinatesChange={handleCoordinatesUpdate}
        onDistanceChange={handleDistanceUpdate}
        initialCoordinates={initialCoordinates}
        onUserDelete={handleUserDelete}
      />
    );
  }, [initialCoordinates, handleCoordinatesUpdate, handleDistanceUpdate, handleUserDelete, isDataReady, coordinates.length]);

  return (
    <div className="flex flex-col gap-4">
      {/* 地図エリア */}
      <div className="w-full h-[500px]">{mapContainer}</div>

      {/* フォームエリア */}
      <Card>
        <CardHeader>
          <CardTitle>ルート情報</CardTitle>
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
                <span className="ml-2">{distance} km</span>
              </div>
            </div>
          </div>

          {isDataReady ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <RouteFormFields control={form.control} />
                <RouteActionButtons
                  coordinates={coordinates}
                  isFormValid={isFormValid}
                  onReset={handleReset}
                  onDeleteAll={handleDeleteAll}
                  onCancel={onCancel}
                />
              </form>
            </Form>
          ) : (
            <FormLoadingSkeleton />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
