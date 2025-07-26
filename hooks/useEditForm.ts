"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { routeUpdateSchema, type RouteUpdateData } from "@/validation/schemas";
import type { RouteData } from "@/types/components";
import type { Coordinate } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface UseEditFormProps {
  route: RouteData;
  onUpdate: (data: RouteUpdateData) => Promise<{ success: boolean; error?: string }>;
}

interface UseEditFormReturn {
  form: ReturnType<typeof useForm<RouteUpdateData>>;
  coordinates: Coordinate[];
  distance: string;
  isDataReady: boolean;
  userDeleted: boolean;
  handleCoordinatesUpdate: (newCoordinates: Coordinate[]) => void;
  handleDistanceUpdate: (newDistance: string) => void;
  handleUserDelete: () => void;
  onSubmit: (data: RouteUpdateData) => Promise<void>;
  resetUserDeletedFlag: () => void;
}

export function useEditForm({ route, onUpdate }: UseEditFormProps): UseEditFormReturn {
  const { toast } = useToast();
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [distance, setDistance] = useState<string>("");
  const [isDataReady, setIsDataReady] = useState(false);
  const [userDeleted, setUserDeleted] = useState(false);
  const [globalDeleteFlag, setGlobalDeleteFlag] = useState(false);
  
  const isInitializedRef = useRef(false);

  const form = useForm<RouteUpdateData>({
    resolver: zodResolver(routeUpdateSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      path: [],
      distance: "0",
    },
  });

  // 初期データ設定 - initialState パターンの適用
  const initializeFormData = useCallback(() => {
    if (isInitializedRef.current || !route?.id) return;

    const initialState = {
      name: route.name || "",
      description: route.description || "",
      location: route.location || "",
      path: route.path || [],
      distance: route.distance || "0",
    };

    form.reset(initialState);
    setCoordinates(initialState.path);
    setDistance(initialState.distance);
    setIsDataReady(true);
    isInitializedRef.current = true;
  }, [route, form]);

  // ルートデータの変更を監視
  useEffect(() => {
    if (route?.id && !globalDeleteFlag) {
      initializeFormData();
    }
  }, [route?.id, initializeFormData, globalDeleteFlag]);

  // 座標更新処理
  const handleCoordinatesUpdate = useCallback((newCoordinates: Coordinate[]) => {
    setCoordinates(newCoordinates);
    
    if (userDeleted) {
      setCoordinates([]);
    }
    
    form.setValue("path", newCoordinates);
  }, [form, userDeleted]);

  // 距離更新処理
  const handleDistanceUpdate = useCallback((newDistance: string) => {
    setDistance(newDistance);
    form.setValue("distance", newDistance);
  }, [form]);

  // ユーザー削除処理 - 早期リターンパターンの適用
  const handleUserDelete = useCallback(() => {
    setUserDeleted(true);
    setGlobalDeleteFlag(true);
  }, []);

  const resetUserDeletedFlag = useCallback(() => {
    setGlobalDeleteFlag(false);
  }, []);

  // フォーム送信処理 - エラーハンドリングの改善
  const onSubmit = useCallback(async (data: RouteUpdateData) => {
    try {
      const result = await onUpdate(data);
      
      if (!result.success) {
        toast({
          title: "更新エラー",
          description: result.error || "ルートの更新に失敗しました",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "更新完了",
        description: "ルートが正常に更新されました",
      });
      
      setGlobalDeleteFlag(false);
    } catch (error) {
      toast({
        title: "エラー",
        description: "予期しないエラーが発生しました",
        variant: "destructive",
      });
    }
  }, [onUpdate, toast]);

  // userDeleted フラグ監視 - cleanup関数の改善
  useEffect(() => {
    if (userDeleted) {
      const timer = setTimeout(() => {
        setUserDeleted(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
    
    return () => {}; // 明示的なcleanup関数
  }, [userDeleted]);

  return {
    form,
    coordinates,
    distance,
    isDataReady,
    userDeleted,
    handleCoordinatesUpdate,
    handleDistanceUpdate,
    handleUserDelete,
    onSubmit,
    resetUserDeletedFlag,
  };
} 