import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coordinate } from "@/types";
import { routeCreateSchema, type RouteCreateData } from "@/validation/schemas";

export interface RouteData {
  id: number;
  name: string;
  description: string | null;
  location: string;
  path: Coordinate[];
  distance: string;
  createdBy: string | null;
  author: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export const useEditFormState = (route: RouteData) => {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState<string>("0");
  const [initialCoordinates, setInitialCoordinates] = useState<Coordinate[]>([]);
  const [userDeleted, setUserDeleted] = useState<boolean>(false);
  const [hasBeenDeleted, setHasBeenDeleted] = useState<boolean>(false);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);

  // フォーム設定
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

  // フォームデータを設定する共通関数
  const updateFormData = useCallback((routeData: RouteData) => {
    const formData = {
      name: routeData.name || "",
      description: routeData.description || "",
      location: routeData.location || "",
      path: routeData.path || [],
      distance: routeData.distance || "0",
    };

    setCoordinates(routeData.path || []);
    setDistance(routeData.distance || "0");
    setInitialCoordinates(routeData.path || []);
    form.reset(formData);

    return formData;
  }, [form]);

  // 初期データ設定
  useEffect(() => {
    if (route.path && route.path.length > 0 && !isDataReady) {
      console.log('📝 初期データ設定:', {
        pathLength: route.path.length,
        distance: route.distance
      });
      
      updateFormData(route);
      setIsDataReady(true);
      console.log('✅ 初期データ設定完了');
    }
  }, [route, updateFormData, isDataReady]);

  // ルートデータ変更検出
  useEffect(() => {
    if (!isDataReady || userDeleted || hasBeenDeleted) return;

    console.log('📝 ルートデータ変更検出:', {
      routeId: route.id,
      newPathLength: route.path?.length || 0,
      currentPathLength: coordinates.length,
    });

    if (route.path) {
      console.log('📝 ルートデータで強制更新');
      updateFormData(route);
    }
  }, [route.id, route.path, route.distance, route.name, updateFormData, userDeleted, hasBeenDeleted, isDataReady, coordinates.length]);

  // 座標更新ハンドラー
  const handleCoordinatesUpdate = useCallback((newCoordinates: Coordinate[]) => {
    console.log('📍 座標更新:', newCoordinates.length, '点');
    setCoordinates(newCoordinates);
    
    if (newCoordinates.length === 0 && userDeleted) {
      console.log('🗑️ ユーザー削除により初期座標もクリア');
      setInitialCoordinates([]);
      setHasBeenDeleted(true);
    }
    
    form.setValue("path", newCoordinates);
  }, [userDeleted, form]);

  // 距離更新ハンドラー
  const handleDistanceUpdate = useCallback((newDistance: string) => {
    console.log('📏 距離更新:', newDistance, 'km');
    setDistance(newDistance);
    form.setValue("distance", newDistance);
  }, [form]);

  // ユーザー削除ハンドラー
  const handleUserDelete = useCallback(() => {
    console.log('🗑️ ユーザーによる削除操作');
    setUserDeleted(true);
  }, []);

  // リセットハンドラー
  const handleReset = useCallback(() => {
    setUserDeleted(false);
    setHasBeenDeleted(false);
    window.__routeDeleted = false;
    console.log('🌐 グローバル削除フラグをクリア（リセット）');
    
    updateFormData(route);
    return "フォームが初期状態に戻されました";
  }, [route, updateFormData]);

  // ユーザー削除フラグのリセット
  useEffect(() => {
    if (coordinates.length === 0 && userDeleted) {
      const timer = setTimeout(() => {
        console.log('🔄 ユーザー削除フラグをリセット');
        setUserDeleted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [coordinates.length, userDeleted]);

  return {
    // States
    coordinates,
    distance,
    initialCoordinates,
    userDeleted,
    hasBeenDeleted,
    isDataReady,
    form,
    
    // Handlers
    handleCoordinatesUpdate,
    handleDistanceUpdate,
    handleUserDelete,
    handleReset,
    
    // Utils
    updateFormData,
  };
}; 