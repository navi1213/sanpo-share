"use client";

import { useState, useCallback, useRef } from "react";
import { Coordinate } from "@/types";

// グローバル追跡システム（メモリリーク対策）
let globalPolylineTracker: google.maps.Polyline[] = [];

const getPolylineTracker = () => globalPolylineTracker;
const addToPolylineTracker = (polyline: google.maps.Polyline) => {
  globalPolylineTracker.push(polyline);
};

const removeFromPolylineTracker = (polyline: google.maps.Polyline) => {
  const index = globalPolylineTracker.indexOf(polyline);
  if (index > -1) {
    globalPolylineTracker.splice(index, 1);
  }
};

const clearPolylineTracker = () => {
  globalPolylineTracker = [];
};

// ポリラインデータ構造
export interface PolylineData {
  coordinates: Coordinate[];
  instance?: google.maps.Polyline;
}

interface UseMapDrawingOptions {
  onCoordinatesChange?: (coordinates: Coordinate[]) => void;
  onDistanceUpdate?: (distance: string) => void;
  onUserDelete?: () => void;
  initialCoordinates?: Coordinate[];
  mapInstance?: google.maps.Map | null;
  globalDeleteFlag?: boolean;
}

export const useMapDrawing = ({
  onCoordinatesChange,
  onDistanceUpdate,
  onUserDelete,
  initialCoordinates = [],
  mapInstance,
  globalDeleteFlag = false,
}: UseMapDrawingOptions) => {
  // 基本状態管理
  const [isDrawing, setIsDrawing] = useState(false);
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);
  const [polylineDataList, setPolylineDataList] = useState<PolylineData[]>([]);
  const [incompletePolyline, setIncompletePolyline] = useState<google.maps.Polyline | null>(null);
  const [currentGuideline, setCurrentGuideline] = useState<google.maps.Polyline | null>(null);
  const [previewPolyline, setPreviewPolyline] = useState<google.maps.Polyline | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Refs for persistent data
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const drawingCoordinatesRef = useRef<Coordinate[]>([]);
  const mouseMoveListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // Update map instance
  const updateMapInstance = useCallback((map: google.maps.Map | null) => {
    mapInstanceRef.current = map;
  }, []);

  // 効率的なポリライン削除
  const deletePolylineEfficiently = useCallback((polyline: google.maps.Polyline, label = "ポリライン") => {
    try {
      polyline.setMap(null);
      polyline.setVisible(false);
      const path = polyline.getPath();
      if (path) {
        path.clear();
      }
      google.maps.event.clearInstanceListeners(polyline);
      removeFromPolylineTracker(polyline);
    } catch (error) {
      console.error(`${label}削除エラー:`, error);
    }
  }, []);

  // グローバル追跡のクリーンアップ
  const cleanupGlobalTracking = useCallback(() => {
    const tracker = getPolylineTracker();
    tracker.forEach(polyline => {
      try {
        polyline.setMap(null);
        google.maps.event.clearInstanceListeners(polyline);
      } catch (error) {
        // Silent cleanup
      }
    });
    clearPolylineTracker();
  }, []);

  // ガイドライン管理
  const setupGuideline = useCallback((mousePosition: google.maps.LatLng) => {
    if (!mapInstanceRef.current || drawingCoordinatesRef.current.length === 0) return;

    // 既存ガイドライン削除
    if (currentGuideline) {
      currentGuideline.setMap(null);
    }

    // 新しいガイドライン作成
    const lastCoordinate = drawingCoordinatesRef.current[drawingCoordinatesRef.current.length - 1];
    const guideline = new google.maps.Polyline({
      path: [lastCoordinate, { lat: mousePosition.lat(), lng: mousePosition.lng() }],
      strokeColor: '#FF0000',
      strokeOpacity: 0.5,
      strokeWeight: 2,
      map: mapInstanceRef.current,
    });

    setCurrentGuideline(guideline);

    // マウス移動リスナー設定
    if (mouseMoveListenerRef.current) {
      google.maps.event.removeListener(mouseMoveListenerRef.current);
    }

    mouseMoveListenerRef.current = google.maps.event.addListener(
      mapInstanceRef.current,
      'mousemove',
      (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          guideline.setPath([lastCoordinate, { lat: event.latLng.lat(), lng: event.latLng.lng() }]);
        }
      }
    );
  }, [currentGuideline]);

  const removeGuideline = useCallback(() => {
    if (currentGuideline) {
      currentGuideline.setMap(null);
      setCurrentGuideline(null);
    }

    if (mouseMoveListenerRef.current) {
      google.maps.event.removeListener(mouseMoveListenerRef.current);
      mouseMoveListenerRef.current = null;
    }
  }, [currentGuideline]);

  // 座標追加
  const addCoordinate = useCallback((coordinate: Coordinate) => {
    if (!isDrawing) {
      return;
    }

    const newCoordinates = [...drawingCoordinatesRef.current, coordinate];
    drawingCoordinatesRef.current = newCoordinates;
    
    onCoordinatesChange?.(newCoordinates);

    // ガイドライン設定
    if (newCoordinates.length >= 1) {
      setupGuideline(new google.maps.LatLng(coordinate.lat, coordinate.lng));
    }
  }, [isDrawing, onCoordinatesChange, setupGuideline]);

  // 描画座標クリア
  const clearDrawingCoordinates = useCallback(() => {
    drawingCoordinatesRef.current = [];
  }, []);

  // プレビューポリライン更新
  const updatePreviewPolyline = useCallback(() => {
    if (!mapInstanceRef.current) return;

    // 既存プレビュー削除
    if (previewPolyline) {
      previewPolyline.setMap(null);
    }

    // 新しいプレビュー作成
    if (drawingCoordinatesRef.current.length >= 2) {
      const preview = new google.maps.Polyline({
        path: drawingCoordinatesRef.current,
        strokeColor: '#0066FF',
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map: mapInstanceRef.current,
      });
      setPreviewPolyline(preview);
    }
  }, [previewPolyline]);

  // カスタム描画リスナー設定
  const setupCustomDrawingListener = useCallback(() => {
    if (!mapInstanceRef.current) {
      return;
    }

    // 既存リスナー削除
    if (mapInstanceRef.current.get('customDrawingListener')) {
      google.maps.event.removeListener(mapInstanceRef.current.get('customDrawingListener'));
    }

    // 新しいリスナー設定
    const listener = google.maps.event.addListener(
      mapInstanceRef.current,
      'click',
      (event: google.maps.MapMouseEvent) => {
        if (!isDrawing || !event.latLng) {
          return;
        }

        const coordinate: Coordinate = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };

        addCoordinate(coordinate);
      }
    );

    mapInstanceRef.current.set('customDrawingListener', listener);
  }, [isDrawing, addCoordinate]);

  // 地図上のポリライン強制削除
  const forceDeleteAllPolylinesOnMap = useCallback(() => {
    if (!mapInstanceRef.current) {
      return;
    }

    // 管理下ポリライン削除
    polylines.forEach((polyline, index) => {
      deletePolylineEfficiently(polyline, `管理下ポリライン ${index + 1}`);
    });
    setPolylines([]);

    // 未完成ポリライン削除
    if (incompletePolyline) {
      deletePolylineEfficiently(incompletePolyline, "未完成ポリライン");
      setIncompletePolyline(null);
    }

    // ガイドライン削除
    removeGuideline();

    // DrawingManager のクリーンアップ
    if (drawingManager) {
      try {
        drawingManager.setDrawingMode(null);
        drawingManager.setMap(null);
        google.maps.event.clearInstanceListeners(drawingManager);
        setDrawingManager(null);
      } catch (error) {
        console.error('DrawingManager クリーンアップエラー:', error);
      }
    }

    // 地図の強制再描画
    try {
      google.maps.event.trigger(mapInstanceRef.current, 'resize');
    } catch (error) {
      console.error('地図再描画エラー:', error);
    }
  }, [polylines, incompletePolyline, removeGuideline, drawingManager, deletePolylineEfficiently]);

  // 未完成描画のクリーンアップ
  const cleanupIncompleteDrawing = useCallback(() => {
    if (incompletePolyline) {
      try {
        incompletePolyline.setMap(null);
      } catch (error) {
        console.error('未完成ポリライン削除エラー:', error);
      }
      setIncompletePolyline(null);
    }
  }, [incompletePolyline]);

  // カスタム描画リスナー削除
  const removeCustomDrawingListener = useCallback(() => {
    if (!mapInstanceRef.current) return;

    const listener = mapInstanceRef.current.get('customDrawingListener');
    if (listener) {
      google.maps.event.removeListener(listener);
      mapInstanceRef.current.set('customDrawingListener', null);
    }
  }, []);

  // 完全なクリーンアップ
  const completeCleanup = useCallback(() => {
    cleanupIncompleteDrawing();
    removeCustomDrawingListener();
    removeGuideline();
    clearDrawingCoordinates();

    if (previewPolyline) {
      previewPolyline.setMap(null);
      setPreviewPolyline(null);
    }
  }, [cleanupIncompleteDrawing, removeCustomDrawingListener, removeGuideline, clearDrawingCoordinates, previewPolyline]);

  // 初期座標設定
  const setupInitialCoordinates = useCallback(() => {
    if (!initialCoordinates?.length || !mapInstanceRef.current) return;

    if (globalDeleteFlag) {
      return;
    }

    if (isDrawing) {
      return;
    }

    drawingCoordinatesRef.current = [...initialCoordinates];

    // 初期座標のポリライン作成
    const initialPolyline = new google.maps.Polyline({
      path: initialCoordinates,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: mapInstanceRef.current,
    });

    // グローバル追跡に登録
    addToPolylineTracker(initialPolyline);
    setPolylines(prev => [...prev, initialPolyline]);

    // PolylineDataListに追加
    const initialPolylineData: PolylineData = {
      coordinates: initialCoordinates,
      instance: initialPolyline,
    };

    setPolylineDataList(prev => {
      if (prev.length === 0) {
        return [initialPolylineData];
      }
      return prev;
    });

    if (initialCoordinates.length === 0 && polylines.length === 0) {
      // 状態クリア
      setPolylineDataList([]);
      if (previewPolyline) {
        previewPolyline.setMap(null);
        setPreviewPolyline(null);
      }
      clearDrawingCoordinates();
    }
  }, [initialCoordinates, globalDeleteFlag, isDrawing, polylines.length, previewPolyline, clearDrawingCoordinates]);

  // 描画状態変更の監視
  const handleDrawingStateChange = useCallback(() => {
    if (isDrawing && mapInstanceRef.current) {
      setupCustomDrawingListener();
    } else {
      removeCustomDrawingListener();
    }
  }, [isDrawing, setupCustomDrawingListener, removeCustomDrawingListener]);

  // Drawing Manager のリセット
  const resetDrawingManager = useCallback(() => {
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
  }, [drawingManager]);

  // カスタム描画開始
  const startDrawing = useCallback(() => {
    if (!mapInstanceRef.current) {
      console.error('地図インスタンスがありません');
      return;
    }

    if (isDrawing) {
      return;
    }

    clearDrawingCoordinates();
    onCoordinatesChange?.([]);

    setIsDrawing(true);

    // 地図カーソル変更
    try {
      mapInstanceRef.current.setOptions({ draggableCursor: 'crosshair' });
    } catch (error) {
      console.error('地図カーソル変更エラー:', error);
    }
  }, [isDrawing, clearDrawingCoordinates, onCoordinatesChange]);

  // ポリライン描画完了処理
  const completePolyline = useCallback((finalCoordinates: Coordinate[]) => {
    if (!mapInstanceRef.current || finalCoordinates.length < 2) return null;

    const newPolyline = new google.maps.Polyline({
      path: finalCoordinates,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2,
      map: mapInstanceRef.current,
    });

    // 新しいポリラインをリストに追加
    const newPolylineData: PolylineData = {
      coordinates: finalCoordinates,
      instance: newPolyline,
    };

    setPolylineDataList(prev => [...prev, newPolylineData]);
    setPolylines(prev => [...prev, newPolyline]);
    addToPolylineTracker(newPolyline);

    // 描画モード終了
    setIsDrawing(false);
    mapInstanceRef.current.setOptions({ draggableCursor: '' });

    return newPolyline;
  }, []);

  // カスタム描画保存と完了
  const saveAndCompleteDrawing = useCallback(() => {
    removeGuideline();

    if (drawingCoordinatesRef.current.length >= 2) {
      const finalPolyline = completePolyline(drawingCoordinatesRef.current);
      
      if (finalPolyline) {
        onCoordinatesChange?.(drawingCoordinatesRef.current);
      }
    }

    completeCleanup();
  }, [removeGuideline, completePolyline, onCoordinatesChange, completeCleanup]);

  // 最後の座標を削除
  const undoLastCoordinate = useCallback(() => {
    if (drawingCoordinatesRef.current.length === 0) {
      return;
    }

    const newCoordinates = drawingCoordinatesRef.current.slice(0, -1);
    drawingCoordinatesRef.current = newCoordinates;

    // ガイドライン再設定または削除
    if (newCoordinates.length >= 1) {
      const lastCoord = newCoordinates[newCoordinates.length - 1];
      setupGuideline(new google.maps.LatLng(lastCoord.lat, lastCoord.lng));
    } else {
      removeGuideline();
    }

    // プレビューポリライン更新
    updatePreviewPolyline();

    if (newCoordinates.length === 0) {
      if (previewPolyline) {
        previewPolyline.setMap(null);
        setPreviewPolyline(null);
      }
    }
  }, [setupGuideline, removeGuideline, updatePreviewPolyline, previewPolyline]);

  // 最後のポリラインを削除
  const undoLastPolyline = useCallback(() => {
    if (isDeleting) {
      return;
    }

    setIsDeleting(true);

    const currentPolylines = [...polylines];
    const currentPolylineDataList = [...polylineDataList];

    if (currentPolylines.length === 0) {
      setIsDeleting(false);
      return;
    }

    // 最後のポリライン削除
    const lastPolyline = currentPolylines[currentPolylines.length - 1];
    const lastPolylineData = currentPolylineDataList[currentPolylineDataList.length - 1];

    try {
      if (lastPolyline) {
        lastPolyline.setMap(null);
        lastPolyline.setVisible(false);
        const path = lastPolyline.getPath();
        if (path) {
          path.clear();
        }
        removeFromPolylineTracker(lastPolyline);
        google.maps.event.clearInstanceListeners(lastPolyline);
      }

      setPolylines(prev => prev.slice(0, -1));
      setPolylineDataList(prev => prev.slice(0, -1));

      const remainingCoordinates = currentPolylineDataList.slice(0, -1)
        .flatMap(data => data.coordinates);
      
      onCoordinatesChange?.(remainingCoordinates);
      onUserDelete?.();

    } catch (error) {
      console.error('ポリライン削除エラー:', error);
    } finally {
      setIsDeleting(false);
    }
  }, [isDeleting, polylines, polylineDataList, onCoordinatesChange, onUserDelete]);

  // 全ルートリセット
  const resetAllRoutes = useCallback(() => {
    forceDeleteAllPolylinesOnMap();
    setPolylineDataList([]);
    cleanupGlobalTracking();
    completeCleanup();
    
    onCoordinatesChange?.([]);
    onDistanceUpdate?.("0");
    onUserDelete?.();
  }, [forceDeleteAllPolylinesOnMap, cleanupGlobalTracking, completeCleanup, onCoordinatesChange, onDistanceUpdate, onUserDelete]);

  return {
    // 状態
    isDrawing,
    polylines,
    polylineDataList,
    incompletePolyline,
    
    // 制御関数
    startDrawing,
    saveAndCompleteDrawing,
    undoLastCoordinate,
    undoLastPolyline,
    resetAllRoutes,
    updateMapInstance,
    setupInitialCoordinates,
    handleDrawingStateChange,
    resetDrawingManager,
    
    // 状態チェック
    hasRoutes: polylines.length > 0,
    canUndo: polylines.length > 0,
    canUndoCoordinate: drawingCoordinatesRef.current.length > 0,
    
    // イベントハンドラ
    setIncompletePolyline,
  };
}; 