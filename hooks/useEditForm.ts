import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Coordinate } from "@/types";
import { RouteData } from "@/types/components";
import { routeCreateSchema, type RouteCreateData } from "@/validation/schemas";

interface UseEditFormOptions {
  route: RouteData;
  routeId: string;
  updateRoute: (params: any) => Promise<any>;
}

export const useEditForm = ({ route, routeId, updateRoute }: UseEditFormOptions) => {
  // State管理
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState<string>("0");
  const [initialCoordinates, setInitialCoordinates] = useState<Coordinate[]>([]);
  const [userDeleted, setUserDeleted] = useState<boolean>(false);
  const [hasBeenDeleted, setHasBeenDeleted] = useState<boolean>(false);
  const [isDataReady, setIsDataReady] = useState<boolean>(false);

  const router = useRouter();
  const { toast } = useToast();

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

  // 共通のフォームデータ更新関数
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

    if (route.path) {
      console.log('📝 ルートデータで強制更新');
      updateFormData(route);
    }
  }, [route.id, route.path, route.distance, route.name, updateFormData, userDeleted, hasBeenDeleted, isDataReady]);

  // ハンドラー関数群
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

  const handleDistanceUpdate = useCallback((newDistance: string) => {
    console.log('📏 距離更新:', newDistance, 'km');
    setDistance(newDistance);
    form.setValue("distance", newDistance);
  }, [form]);

  const handleUserDelete = useCallback(() => {
    console.log('🗑️ ユーザーによる削除操作');
    setUserDeleted(true);
  }, []);

  const handleReset = useCallback(() => {
    setUserDeleted(false);
    setHasBeenDeleted(false);
    window.__routeDeleted = false;
    console.log('🌐 グローバル削除フラグをクリア（リセット）');
    
    updateFormData(route);
    return "フォームが初期状態に戻されました";
  }, [route, updateFormData]);

  const handleDeleteAll = useCallback(() => {
    form.setValue("path", []);
    form.setValue("distance", "0");
  }, [form]);

  // フォーム送信
  const handleSubmit = useCallback(async (data: RouteCreateData) => {
    try {
      console.log('📤 ルート更新開始:', data);
      
      const result = await updateRoute({
        name: data.name,
        description: data.description,
        location: data.location,
        path: coordinates,
        distance: distance,
        routeId: routeId,
      });

      if (result.error) {
        console.error('❌ ルート更新エラー:', result.message);
        toast({
          title: "エラー",
          description: result.message || "ルートの更新に失敗しました",
          variant: "destructive",
        });
        return;
      }

      console.log('✅ ルート更新成功');
      
      if (hasBeenDeleted) {
        window.__routeDeleted = false;
        console.log('🌐 グローバル削除フラグをクリア（更新成功）');
      }
      
      toast({
        title: "更新完了",
        description: "ルートが正常に更新されました",
      });

      // 詳細ページにリダイレクト（強制リロード）
      window.location.href = `/routes/${routeId}`;
    } catch (error) {
      console.error('❌ ルート更新エラー:', error);
      toast({
        title: "エラー",
        description: "ルートの更新に失敗しました",
        variant: "destructive",
      });
    }
  }, [coordinates, distance, routeId, updateRoute, hasBeenDeleted, toast]);

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
    isDataReady,
    form,
    
    // Handlers
    handleCoordinatesUpdate,
    handleDistanceUpdate,
    handleUserDelete,
    handleReset,
    handleDeleteAll,
    handleSubmit,
    
    // Utils
    isFormValid: form.formState.isValid,
    onCancel: () => router.push(`/routes/${routeId}`),
  };
}; 