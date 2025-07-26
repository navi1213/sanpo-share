import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { 
  Coordinate, 
  UseMapDrawingOptions, 
  UseMapDrawingReturn, 
  PolylineData 
} from "@/types";

export const useMapDrawing = (options: UseMapDrawingOptions): UseMapDrawingReturn => {
  const { onCoordinatesChange, onDistanceChange, initialCoordinates, onUserDelete } = options;
  
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [polylineDataList, setPolylineDataList] = useState<PolylineData[]>([]);
  const [drawingCoordinateCount, setDrawingCoordinateCount] = useState<number>(0);
  const [justDeleted, setJustDeleted] = useState<boolean>(false); // 削除直後フラグ
  const [isDeleting, setIsDeleting] = useState<boolean>(false); // 削除処理中フラグ
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);

  // 管理用のref
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const drawingCoordinatesRef = useRef<Coordinate[]>([]);
  const incompletePolylineRef = useRef<google.maps.Polyline | null>(null);
  const customDrawingListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const guideLineRef = useRef<google.maps.Polyline | null>(null);
  const mouseMoveListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  const canUndoCoordinate = isDrawing && drawingCoordinateCount > 0;

  // グローバル変数アクセス用のヘルパー関数
  const getRouteDeletedFlag = useCallback((): boolean => {
    return window.__routeDeleted ?? false;
  }, []);

  const setRouteDeletedFlag = useCallback((value: boolean): void => {
    window.__routeDeleted = value;
  }, []);

  const getPolylineTracker = useCallback((): google.maps.Polyline[] => {
    return window.__polylineTracker ?? [];
  }, []);

  const setPolylineTracker = useCallback((polylines: google.maps.Polyline[]): void => {
    window.__polylineTracker = polylines;
  }, []);

  const addToPolylineTracker = useCallback((polyline: google.maps.Polyline): void => {
    if (!window.__polylineTracker) {
      window.__polylineTracker = [];
    }
    window.__polylineTracker.push(polyline);
  }, []);

  const clearPolylineTracker = useCallback((): void => {
    window.__polylineTracker = [];
  }, []);

  // ポリライン削除用のヘルパー関数
  const safeRemovePolyline = useCallback((polyline: google.maps.Polyline, label: string): void => {
    try {
      polyline.setMap(null);
      polyline.setVisible(false);
      
      // getPathが存在し、かつ有効な場合のみクリア
      if (polyline.getPath && typeof polyline.getPath === 'function') {
        try {
          const path = polyline.getPath();
          if (path && typeof path.clear === 'function') {
            path.clear();
          }
        } catch (pathError) {
          console.warn(`⚠️ ${label}パスクリア時のエラー（無視）:`, pathError);
        }
      }
      console.log(`✅ ${label}削除成功`);
    } catch (error) {
      console.error(`❌ ${label}削除エラー:`, error);
    }
  }, []);

  // グローバル追跡ポリラインのクリーンアップ
  const cleanupGlobalPolylines = useCallback((): void => {
    const tracker = getPolylineTracker();
    if (tracker.length > 0) {
      console.log('🌐 グローバル追跡ポリラインを削除:', tracker.length);
      tracker.forEach((polyline, index) => {
        safeRemovePolyline(polyline, `グローバルポリライン ${index + 1}`);
      });
      clearPolylineTracker();
      console.log('🌐 グローバル追跡をクリア');
    }
  }, [getPolylineTracker, clearPolylineTracker, safeRemovePolyline]);

  // 地図インスタンスを設定する関数
  const setMapInstance = useCallback((map: google.maps.Map | null) => {
    mapInstanceRef.current = map;
  }, []);

  // ガイド線を更新する関数
  const updateGuideLine = useCallback((currentPos: Coordinate) => {
    if (!mapInstanceRef.current || drawingCoordinatesRef.current.length === 0) {
      return;
    }

    // 既存のガイド線を削除
    if (guideLineRef.current) {
      guideLineRef.current.setMap(null);
    }

    // 最後の点からマウス位置までのガイド線を作成
    const lastPoint = drawingCoordinatesRef.current[drawingCoordinatesRef.current.length - 1];
    const guidePath = [lastPoint, currentPos];
    
    guideLineRef.current = new google.maps.Polyline({
      path: guidePath,
      strokeColor: "#2563eb",
      strokeWeight: 2,
      strokeOpacity: 0.4, // ガイド線は薄く
      clickable: false, // クリックイベントを通さない
      zIndex: 1, // 低いz-indexでクリックを妨げない
    });

    guideLineRef.current.setMap(mapInstanceRef.current);
  }, []);

  // ガイド線を設定する関数
  const setupGuideLine = useCallback(() => {
    if (!mapInstanceRef.current || drawingCoordinatesRef.current.length === 0) {
      return;
    }

    console.log('📏 ガイド線リスナーを設定（座標数:', drawingCoordinatesRef.current.length, '）');

    // 既存のマウス移動リスナーを削除
    if (mouseMoveListenerRef.current) {
      google.maps.event.removeListener(mouseMoveListenerRef.current);
    }

    // マウス移動リスナーを設定
    mouseMoveListenerRef.current = google.maps.event.addListener(
      mapInstanceRef.current,
      "mousemove",
      (event: google.maps.MapMouseEvent) => {
        if (!event.latLng || drawingCoordinatesRef.current.length === 0) {
          return;
        }

        const currentPos = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };

        updateGuideLine(currentPos);
      }
    );
  }, [updateGuideLine]);

  // ガイド線を削除する関数
  const clearGuideLine = useCallback(() => {
    // ガイド線を削除
    if (guideLineRef.current) {
      guideLineRef.current.setMap(null);
      guideLineRef.current = null;
      console.log('🗑️ ガイド線を削除');
    }

    // マウス移動リスナーを削除
    if (mouseMoveListenerRef.current) {
      google.maps.event.removeListener(mouseMoveListenerRef.current);
      mouseMoveListenerRef.current = null;
      console.log('🗑️ マウス移動リスナーを削除');
    }
  }, []);

  // 描画中の座標を追加する関数
  const addDrawingCoordinate = useCallback((coordinate: Coordinate) => {
    console.log('📍 座標追加開始:', {
      coordinate: coordinate,
      currentCount: drawingCoordinatesRef.current.length,
      isDrawing: isDrawing
    });

    if (!isDrawing) {
      console.log('❌ 描画モードではないため座標追加をスキップ');
      return;
    }

    // 座標を追加
    drawingCoordinatesRef.current.push(coordinate);
    const newCount = drawingCoordinatesRef.current.length;
    setDrawingCoordinateCount(newCount);
    
    console.log('✅ 座標追加完了:', {
      newCount: newCount,
      totalCoordinates: drawingCoordinatesRef.current,
      willShowGuideLine: newCount > 0
    });

    // ガイド線の管理
    if (newCount > 0) {
      console.log('📏 ガイド線を設定');
      setupGuideLine();
    }
  }, [isDrawing, setupGuideLine]);

  // 描画中の座標をクリアする関数
  const clearDrawingCoordinates = useCallback(() => {
    console.log('🧹 描画座標をクリア');
    drawingCoordinatesRef.current = [];
    setDrawingCoordinateCount(0);
    // ガイド線もクリア
    clearGuideLine();
  }, [clearGuideLine]);

  // プレビューポリラインを更新
  const updatePreviewPolyline = useCallback(() => {
    if (!mapInstanceRef.current || drawingCoordinatesRef.current.length < 2) {
      return;
    }

    // 既存のプレビューポリラインを削除
    if (incompletePolylineRef.current) {
      incompletePolylineRef.current.setMap(null);
    }

    // 新しいプレビューポリラインを作成
    const previewPolyline = new google.maps.Polyline({
      path: drawingCoordinatesRef.current,
      strokeColor: "#2563eb",
      strokeWeight: 4,
      strokeOpacity: 0.6, // プレビューは少し透明に
      editable: false,
      draggable: false,
      clickable: false, // クリックイベントを通さない
      zIndex: 2, // ガイド線より上に表示
    });

    previewPolyline.setMap(mapInstanceRef.current);
    incompletePolylineRef.current = previewPolyline;

    console.log('🔄 プレビューポリライン更新:', drawingCoordinatesRef.current.length, '点');
    
    // プレビューポリライン更新後もガイド線を再設定
    setupGuideLine();
  }, [setupGuideLine]);

  // カスタム描画システム用の地図クリックリスナーを設定
  const setupCustomDrawingListener = useCallback(() => {
    console.log('🎨 カスタム描画リスナーを設定開始');
    
    if (!mapInstanceRef.current) {
      console.log('❌ 地図インスタンスがありません');
      return;
    }

    console.log('📋 地図インスタンス確認:', {
      hasMapInstance: !!mapInstanceRef.current,
      isDrawing: isDrawing
    });

    // 既存のリスナーを削除
    if (customDrawingListenerRef.current) {
      console.log('🗑️ 既存のカスタム描画リスナーを削除');
      google.maps.event.removeListener(customDrawingListenerRef.current);
    }

    // 新しいリスナーを設定
    customDrawingListenerRef.current = google.maps.event.addListener(
      mapInstanceRef.current,
      "click",
      (event: google.maps.MapMouseEvent) => {
        console.log('🎯 カスタム描画クリック検出');
        console.log('📊 描画状態チェック:', {
          isDrawing: isDrawing,
          hasLatLng: !!event.latLng,
          latLng: event.latLng?.toJSON()
        });

        if (!isDrawing || !event.latLng) {
          console.log('❌ 描画条件未満足:', { isDrawing, hasLatLng: !!event.latLng });
          return;
        }

        const coordinate = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };

        console.log('📍 カスタム描画: 座標を追加', coordinate);
        addDrawingCoordinate(coordinate);

        // リアルタイムでポリライン表示を更新
        updatePreviewPolyline();
      }
    );

    console.log('✅ カスタム描画リスナーを設定完了:', {
      hasListener: !!customDrawingListenerRef.current,
      listenerRef: customDrawingListenerRef.current
    });
  }, [isDrawing, addDrawingCoordinate, updatePreviewPolyline]);

  // 地図上のすべてのポリラインを強制削除する関数
  const forceRemoveAllPolylinesFromMap = useCallback(() => {
    if (!mapInstanceRef.current) {
      console.log('❌ 地図インスタンスがありません');
      return;
    }

    console.log('🧹 地図上のすべてのポリラインを強制削除');
    
    // 1. 管理下のポリラインを再確認して削除
    polylineDataList.forEach((data, index) => {
      if (data.polyline) {
        try {
          console.log(`🗑️ 強制削除: 管理下ポリライン ${index + 1}`);
          data.polyline.setMap(null);
          data.polyline.setVisible(false); // 念のため非表示にも設定
        } catch (error) {
          console.error(`❌ 管理下ポリライン ${index + 1} 削除エラー:`, error);
        }
      }
    });
    
    // 2. 未完成ポリラインも削除
    if (incompletePolylineRef.current) {
      try {
        console.log('🗑️ 強制削除: 未完成ポリライン');
        incompletePolylineRef.current.setMap(null);
        incompletePolylineRef.current.setVisible(false);
        incompletePolylineRef.current = null;
      } catch (error) {
        console.error('❌ 未完成ポリライン削除エラー:', error);
      }
    }
    
    // 3. ガイド線も削除
    if (guideLineRef.current) {
      try {
        console.log('🗑️ 強制削除: ガイド線');
        guideLineRef.current.setMap(null);
        guideLineRef.current.setVisible(false);
        guideLineRef.current = null;
      } catch (error) {
        console.error('❌ ガイド線削除エラー:', error);
      }
    }
    
    // 4. DrawingManagerのクリーンアップ
    if (drawingManager) {
      try {
        // 描画モードをリセット
        drawingManager.setDrawingMode(null);
        console.log('✅ DrawingManagerをクリーンアップ');
      } catch (error) {
        console.error('❌ DrawingManagerクリーンアップエラー:', error);
      }
    }
    
    // 5. 地図を強制再描画
    try {
      console.log('🔄 地図を強制再描画');
      google.maps.event.trigger(mapInstanceRef.current, 'resize');
    } catch (error) {
      console.error('❌ 地図再描画エラー:', error);
    }
    
    // 6. グローバル追跡のポリラインも削除
    cleanupGlobalPolylines();
    
    console.log('✅ 地図上のポリライン強制削除完了');
  }, [drawingManager, polylineDataList, cleanupGlobalPolylines]);

  // 未完成の描画をクリーンアップする関数
  const cleanupIncompleteDrawing = useCallback(() => {
    console.log('🧹 未完成描画のクリーンアップ');
    
    // 未完成ポリラインを削除
    if (incompletePolylineRef.current) {
      console.log('🗑️ 未完成ポリラインを削除');
      try {
        incompletePolylineRef.current.setMap(null);
        console.log('✅ 未完成ポリライン削除成功');
      } catch (error) {
        console.error('❌ 未完成ポリライン削除エラー:', error);
      }
      incompletePolylineRef.current = null;
    }
    
    // 描画中の座標もクリア
    clearDrawingCoordinates();
    
    // ガイド線もクリア
    clearGuideLine();
    
    // カスタム描画リスナーを削除
    if (customDrawingListenerRef.current) {
      try {
        google.maps.event.removeListener(customDrawingListenerRef.current);
        customDrawingListenerRef.current = null;
        console.log('✅ カスタム描画リスナーを削除');
      } catch (error) {
        console.error('❌ カスタム描画リスナー削除エラー:', error);
      }
    }
    
    // 地図のカーソルをリセット
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({
        draggableCursor: null,
        draggingCursor: null
      });
    }
    
    // 完成済みポリラインは削除しない（未完成描画のクリーンアップのみ）
    console.log('✅ 未完成描画のクリーンアップ完了（完成済みポリラインは保持）');
  }, [clearDrawingCoordinates, clearGuideLine]);

  // 計算されたプロパティ（useMemoで最適化）
  const polylines = useMemo(() => polylineDataList.map(data => data.polyline), [polylineDataList]);
  const totalDistance = useMemo(() => polylineDataList.reduce((sum, data) => sum + data.distance, 0), [polylineDataList]);
  const allCoordinates = useMemo(() => polylineDataList.flatMap(data => data.coordinates), [polylineDataList]);
  const hasRoutes = polylineDataList.length > 0;
  const canUndo = polylineDataList.length > 0;
  
  // 初期座標がある場合は描画座標として設定
  useEffect(() => {
    if (initialCoordinates.length > 0 && mapInstanceRef.current) {
      console.log('🔧 初期座標を設定:', initialCoordinates.length, '点');
      console.log('📍 初期座標詳細:', initialCoordinates);

      // グローバル削除フラグをチェック
      const globalDeleteFlag = getRouteDeletedFlag();
      console.log('🏁 グローバル削除フラグチェック:', globalDeleteFlag);
      if (globalDeleteFlag) {
        console.log('🚫 グローバル削除フラグが立っているため、初期座標の再作成をスキップ');
        return;
      }

      // 描画中の場合は初期座標を描画座標として設定しない
      if (isDrawing) {
        console.log('🎨 描画中のため、初期座標の描画座標設定をスキップ');
      } else {
        // 編集モードの場合、初期座標を描画座標として設定
        drawingCoordinatesRef.current = [...initialCoordinates];
        setDrawingCoordinateCount(initialCoordinates.length);
        console.log('✅ 初期座標を描画座標として設定完了');
      }

      // 初期座標をPolylineDataListにも追加（編集画面でも削除可能にするため）
      if (initialCoordinates.length > 1) {
        console.log('📍 初期座標のポリライン作成開始');
        
        const initialPolyline = new google.maps.Polyline({
          path: initialCoordinates,
          strokeColor: "#2563eb",
          strokeWeight: 4,
          strokeOpacity: 0.8,
          map: mapInstanceRef.current,
        });

        // グローバル追跡に登録
        setPolylineTracker([...getPolylineTracker(), initialPolyline]);
        console.log('🌐 グローバル追跡に登録:', getPolylineTracker().length);

        const initialDistance = google.maps.geometry.spherical.computeLength(initialPolyline.getPath());
        
        const initialPolylineData: PolylineData = {
          coordinates: [...initialCoordinates],
          distance: initialDistance,
          polyline: initialPolyline,
        };

        console.log('📍 初期ポリラインデータ:', {
          coordinatesLength: initialPolylineData.coordinates.length,
          distance: initialPolylineData.distance,
          hasPolylineInstance: !!initialPolylineData.polyline
        });

        setPolylineDataList(prev => {
          // 既に初期座標が追加されていないかチェック
          const hasInitialData = prev.some(data => 
            data.coordinates.length === initialCoordinates.length &&
            data.coordinates[0].lat === initialCoordinates[0].lat &&
            data.coordinates[0].lng === initialCoordinates[0].lng
          );

          if (!hasInitialData) {
            console.log('📍 初期座標をPolylineDataListに追加');
            return [initialPolylineData];
          } else {
            console.log('ℹ️ 初期座標は既に追加済み');
          }
          return prev;
        });
      }
    } else if (initialCoordinates.length === 0 && !justDeleted && polylineDataList.length === 0) {
      console.log('🗑️ 初期座標が空で、ポリラインも存在しないため、状態をクリア');
      
      // グローバル追跡からも削除
      cleanupGlobalPolylines();
      
      drawingCoordinatesRef.current = [];
      setDrawingCoordinateCount(0);
      
      // 描画状態も完全にリセット（描画中でない場合のみ）
      if (!isDrawing) {
        setIsDrawing(false);
      }
      
      // ガイド線をクリア
      clearGuideLine();
      
      // プレビューポリラインをクリア
      if (incompletePolylineRef.current) {
        incompletePolylineRef.current.setMap(null);
        incompletePolylineRef.current = null;
        console.log('🗑️ プレビューポリライン削除');
      }
      
      console.log('✅ 状態クリア完了');
    }
  }, [initialCoordinates, mapInstanceRef.current, clearGuideLine, isDrawing, clearDrawingCoordinates, justDeleted, polylineDataList.length, getRouteDeletedFlag, setRouteDeletedFlag, getPolylineTracker, setPolylineTracker, cleanupGlobalPolylines]);

  // 親コンポーネントへの通知（useMemoで最適化された値を使用）
  useEffect(() => {
    onCoordinatesChange(allCoordinates);
  }, [allCoordinates, onCoordinatesChange]);

  useEffect(() => {
    onDistanceChange((totalDistance / 1000).toFixed(2));
  }, [totalDistance, onDistanceChange]);

  // 描画状態が変更された時にカスタム描画リスナーを管理
  useEffect(() => {
    console.log('🔄 描画状態変更検出:', { isDrawing, hasMapInstance: !!mapInstanceRef.current });
    
    if (isDrawing && mapInstanceRef.current) {
      console.log('🎯 描画開始: カスタム描画リスナーを設定');
      setupCustomDrawingListener();
    } else if (!isDrawing && customDrawingListenerRef.current) {
      console.log('🎯 描画終了: カスタム描画リスナーを削除');
      google.maps.event.removeListener(customDrawingListenerRef.current);
      customDrawingListenerRef.current = null;
    }
  }, [isDrawing, setupCustomDrawingListener]);

  // 描画マネージャーの状態を完全にリセットする関数
  const resetDrawingManager = useCallback(() => {
    if (drawingManager) {
      console.log('🔧 描画マネージャーをリセット');
      
      // 描画モードを無効化
      drawingManager.setDrawingMode(null);
      
      // すべてのイベントリスナーをクリア
      google.maps.event.clearInstanceListeners(drawingManager);
      
      // 未完成の描画をクリーンアップ
      cleanupIncompleteDrawing();
    }
  }, [drawingManager, cleanupIncompleteDrawing]);

  const startDrawing = useCallback(() => {
    console.log('🎨 カスタム描画開始');
    
    if (!mapInstanceRef.current) {
      console.log('❌ 地図インスタンスがありません');
      return;
    }
    
    if (isDrawing) {
      console.log('❌ 既に描画中です');
      return;
    }

    // グローバル削除フラグはクリアしない（削除状態を維持）
    console.log('🌐 グローバル削除フラグを維持（新規描画開始）');

    console.log('📊 描画開始前の状態:', {
      polylineCount: polylineDataList.length,
      totalDistance: (totalDistance / 1000).toFixed(2) + 'km',
      hasMapInstance: !!mapInstanceRef.current,
      currentIsDrawing: isDrawing
    });
    
    // 前回の描画座標をクリア（重要：新しいルートが独立するため）
    console.log('🧹 新規描画のため描画座標を完全クリア');
    drawingCoordinatesRef.current = [];
    setDrawingCoordinateCount(0);
    
    // その他の描画座標クリア
    clearDrawingCoordinates();
    
    // 未完成の描画をクリーンアップ
    cleanupIncompleteDrawing();
    
    // 描画状態を設定
    console.log('🔄 描画状態をtrueに設定');
    setIsDrawing(true);
    
    // 地図のカーソルを変更
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setOptions({
        draggableCursor: 'crosshair',
        draggingCursor: 'crosshair'
      });
      console.log('✅ 地図カーソルを変更');
    }
    
    // カスタム描画リスナーはuseEffectで自動設定される
    
    console.log('✅ カスタム描画モードを設定完了（新規独立ルート）');
  }, [
    isDrawing, 
    cleanupIncompleteDrawing, 
    clearDrawingCoordinates,
    polylineDataList.length,
    totalDistance
  ]);

  const handlePolylineComplete = useCallback((polyline: google.maps.Polyline) => {
    console.log('🏁 ポリライン描画完了');
    
    // 未完成ポリラインの参照をクリア（完成したので）
    incompletePolylineRef.current = null;

    // ポリラインの座標を取得
    const path = polyline.getPath();
    const coordinates: Coordinate[] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({ lat: point.lat(), lng: point.lng() });
    }

    // 距離を計算
    const distance = google.maps.geometry.spherical.computeLength(path);

    // 新しいポリラインデータを作成
    const newPolylineData: PolylineData = {
      polyline,
      coordinates,
      distance
    };

    console.log('📊 新しいポリライン詳細:', {
      points: coordinates.length,
      distance: (distance / 1000).toFixed(2) + 'km',
      coordinates: coordinates,
      polylineInstance: !!polyline
    });

    // 状態に追加前の現在の状態をログ
    console.log('📊 追加前の状態確認');
    
    // 状態に追加
    setPolylineDataList(prev => {
      console.log('📊 setPolylineDataList - 追加前:', {
        prevLength: prev.length,
        prevList: prev.map((data, index) => ({
          index,
          coordinatesLength: data.coordinates.length,
          distance: data.distance
        }))
      });
      
      const newList = [...prev, newPolylineData];
      
      console.log('📊 setPolylineDataList - 追加後:', {
        newLength: newList.length,
        newList: newList.map((data, index) => ({
          index,
          coordinatesLength: data.coordinates.length,
          distance: data.distance
        }))
      });
      
      return newList;
    });

    // 描画完了後は描画モードを自動で終了
    if (drawingManager) {
      console.log('🔧 描画モードを終了');
      resetDrawingManager();
      setIsDrawing(false);
    }
  }, [drawingManager, resetDrawingManager]);

  const saveAndCompleteDrawing = useCallback(() => {
    console.log('💾 カスタム描画を保存して完了');
    console.log('📊 保存開始時の状態:', {
      isDrawing,
      hasIncompletePolyline: !!incompletePolylineRef.current,
      drawingCoordinatesLength: drawingCoordinatesRef.current.length,
      drawingCoordinates: drawingCoordinatesRef.current
    });
    
    if (isDrawing) {
      // 描画中の座標がある場合は手動でポリラインを作成
      if (drawingCoordinatesRef.current.length >= 2) {
        console.log('📝 描画中の座標からポリラインを作成');
        console.log('📍 使用する座標:', drawingCoordinatesRef.current);
        
        // 最終的なポリラインを作成（不透明度を戻す）
        const finalPolyline = new google.maps.Polyline({
          path: drawingCoordinatesRef.current,
          strokeColor: "#2563eb",
          strokeWeight: 4,
          strokeOpacity: 0.8, // 最終版は不透明
          editable: false,
          draggable: false,
        });
        
        console.log('🔧 最終ポリライン作成完了:', !!finalPolyline);
        
        // プレビューポリラインを削除
        if (incompletePolylineRef.current) {
          incompletePolylineRef.current.setMap(null);
          incompletePolylineRef.current = null;
        }
        
        // 地図に最終ポリラインを追加
        if (mapInstanceRef.current) {
          finalPolyline.setMap(mapInstanceRef.current);
          console.log('✅ 最終ポリラインを地図に追加');
          
          // 最終ポリラインを保存
          console.log('💾 最終ポリラインを保存処理に送信');
          handlePolylineComplete(finalPolyline);
        } else {
          console.error('❌ 地図インスタンスがありません');
        }
      } else {
        console.log('ℹ️ 保存する座標が不足しています（最低2点必要）');
        console.log('📍 現在の座標数:', drawingCoordinatesRef.current.length);
      }
      
      // 描画状態をクリア
      clearDrawingCoordinates();
      
      // 描画状態をリセット
      setIsDrawing(false);
      
      // カスタム描画をクリーンアップ
      cleanupIncompleteDrawing();
      
      console.log('✅ カスタム描画保存完了');
    }
  }, [
    isDrawing, 
    handlePolylineComplete,
    clearDrawingCoordinates,
    cleanupIncompleteDrawing
  ]);

  const undoLastCoordinate = useCallback(() => {
    console.log('↩️ 描画中の最後の座標を削除');
    
    if (drawingCoordinatesRef.current.length === 0) {
      console.log('❌ 削除する座標がありません');
      return;
    }
    
    const prevLength = drawingCoordinatesRef.current.length;
    
    // 最後の座標を削除
    const removedCoordinate = drawingCoordinatesRef.current.pop();
    setDrawingCoordinateCount(drawingCoordinatesRef.current.length);
    console.log('🗑️ 削除した座標:', removedCoordinate);
    console.log('📊 残り座標数:', drawingCoordinatesRef.current.length);
    
    // ガイド線の管理
    if (drawingCoordinatesRef.current.length > 0) {
      // まだ座標が残っている場合: ガイド線を再設定
      console.log('📏 座標削除後: ガイド線を再設定');
      setupGuideLine();
    } else {
      // 座標が0点になった場合: ガイド線を削除
      console.log('📏 座標0点: ガイド線を削除');
      clearGuideLine();
    }
    
    // プレビューポリラインを更新
    if (drawingCoordinatesRef.current.length >= 2) {
      updatePreviewPolyline();
      console.log('🔄 プレビューポリライン更新');
    } else {
      // 座標が1点以下の場合はプレビューポリラインを削除
      if (incompletePolylineRef.current) {
        incompletePolylineRef.current.setMap(null);
        incompletePolylineRef.current = null;
        console.log('🗑️ プレビューポリライン削除');
      }
    }
    
    console.log('✅ 座標削除完了');
  }, [updatePreviewPolyline, setupGuideLine, clearGuideLine]);

  const undoLastPolyline = useCallback(() => {
    console.log('↩️ 最後のポリラインを削除');
    
    if (isDeleting) {
      console.log('🚫 削除処理中のため処理をスキップ');
      return;
    }
    
    setIsDeleting(true);
    
    setPolylineDataList(prev => {
      console.log('📊 undoLastPolyline - 削除前の状態:', {
        polylineDataListLength: prev.length,
        polylineDataList: prev.map((data, index) => ({
          index,
          hasPolyline: !!data.polyline,
          coordinatesLength: data.coordinates.length,
          distance: data.distance,
          isOnMap: data.polyline ? data.polyline.getMap() !== null : false
        }))
      });

      if (prev.length === 0) {
        console.log('❌ 削除するポリラインがありません');
        setIsDeleting(false);
        return prev;
      }

      // 最後のポリラインデータを取得
      const lastPolylineData = prev[prev.length - 1];
      
      console.log('🎯 削除対象のポリライン:', {
        index: prev.length - 1,
        coordinatesLength: lastPolylineData.coordinates.length,
        distance: lastPolylineData.distance,
        hasPolylineInstance: !!lastPolylineData.polyline,
        isOnMap: lastPolylineData.polyline ? lastPolylineData.polyline.getMap() !== null : false
      });
      
      // 地図からポリラインを削除
      try {
        if (lastPolylineData.polyline) {
          console.log('🗑️ ポリライン削除開始:', {
            mapExists: !!lastPolylineData.polyline.getMap(),
            visible: lastPolylineData.polyline.getVisible()
          });

          // より強力な削除処理
          // 1. 地図から削除
          lastPolylineData.polyline.setMap(null);
          console.log('✅ setMap(null) 実行');
          
          // 2. 非表示設定
          lastPolylineData.polyline.setVisible(false);
          console.log('✅ setVisible(false) 実行');
          
          // 3. パスをクリア
          if (lastPolylineData.polyline.getPath && typeof lastPolylineData.polyline.getPath === 'function') {
            try {
              const path = lastPolylineData.polyline.getPath();
              if (path && typeof path.clear === 'function') {
                path.clear();
                console.log('✅ パスクリア実行');
              }
            } catch (pathError) {
              console.warn('⚠️ パスクリア時のエラー（無視）:', pathError);
            }
          }
          
          // 4. グローバル追跡からも削除
          const currentTracker = getPolylineTracker();
          const updatedTracker = currentTracker.filter(p => p !== lastPolylineData.polyline);
          setPolylineTracker(updatedTracker);
          console.log('✅ グローバル追跡から削除');

          // 5. イベントリスナーをクリア
          try {
            google.maps.event.clearInstanceListeners(lastPolylineData.polyline);
            console.log('✅ イベントリスナークリア');
          } catch (listenerError) {
            console.warn('⚠️ リスナークリア時のエラー（無視）:', listenerError);
          }

          console.log('🗑️ ポリライン削除処理完了');
        } else {
          console.log('⚠️ ポリラインインスタンスが存在しません');
        }
      } catch (error) {
        console.error('❌ ポリライン削除エラー:', error);
      }
      
      console.log('✅ ポリラインを削除しました');
      
      // 新しい配列を返す（最後の要素を除く）
      const newList = prev.slice(0, -1);
      console.log('📊 削除後の状態:', {
        newListLength: newList.length,
        removedPolylines: 1
      });
      
      // 全てのポリラインが削除された場合は描画状態もリセット
      if (newList.length === 0) {
        console.log('🔄 全ポリライン削除のため描画状態をリセット');
        setJustDeleted(true);
        
        // グローバル削除フラグを設定
        setRouteDeletedFlag(true);
        console.log('🌐 グローバル削除フラグを設定');
        
        // 削除フラグを一定時間後にリセット
        setTimeout(() => {
          setJustDeleted(false);
          console.log('🔄 削除フラグをリセット');
        }, 100);
        
        // 描画中でない場合のみ状態をリセット
        if (!isDrawing) {
          setIsDrawing(false);
          drawingCoordinatesRef.current = [];
          setDrawingCoordinateCount(0);
          clearGuideLine();
          
          // プレビューポリラインもクリア
          if (incompletePolylineRef.current) {
            incompletePolylineRef.current.setMap(null);
            incompletePolylineRef.current = null;
            console.log('🗑️ プレビューポリライン削除（undoLastPolyline）');
          }
        }
        
        // 地図上に残存している可能性のあるポリラインを強制削除
        console.log('🧹 地図上の残存ポリラインを強制削除');
        forceRemoveAllPolylinesFromMap();
      }

      // 削除処理完了
      setIsDeleting(false);
      
      // 削除処理完了後の状態をログ出力
      console.log('📊 削除処理完了後の状態確認:', {
        polylineDataListLength: newList.length,
        hasRoutes: newList.length > 0,
        canUndo: newList.length > 0,
        isDeleting: false
      });

      return newList;
    });
  }, [clearGuideLine, isDrawing, isDeleting, forceRemoveAllPolylinesFromMap, setRouteDeletedFlag, getPolylineTracker, setPolylineTracker]);

  const resetAllRoutes = useCallback(() => {
    console.log('🔄 すべてのルートをリセット');
    
    setPolylineDataList(currentList => {
      console.log('📊 resetAllRoutes - 現在の詳細状態:', {
        polylineDataListLength: currentList.length,
        polylineDataList: currentList.map((data, index) => ({
          index,
          hasPolyline: !!data.polyline,
          coordinatesLength: data.coordinates.length,
          distance: data.distance,
          firstCoord: data.coordinates[0],
          lastCoord: data.coordinates[data.coordinates.length - 1]
        })),
        polylineDataListRaw: currentList
      });
      
      if (currentList.length === 0) {
        console.log('ℹ️ リセットするポリラインがありません（管理下）');
        // 管理下にポリラインがなくても、地図上に残存している可能性があるため強制削除を実行
        forceRemoveAllPolylinesFromMap();
        cleanupIncompleteDrawing();
        setIsDrawing(false);
        
        // グローバル削除フラグを設定
        setRouteDeletedFlag(true);
        console.log('🌐 グローバル削除フラグを設定（resetAllRoutes）');
        
        return currentList;
      }
      
      // ユーザー確認ダイアログ
      const confirmReset = window.confirm(
        `すべてのルート（${currentList.length}本）を削除しますか？\n\nこの操作は取り消すことができません。`
      );
      
      if (!confirmReset) {
        console.log('🚫 リセットがキャンセルされました');
        return currentList;
      }
      
      const currentDistance = currentList.reduce((sum, data) => sum + data.distance, 0);
      
      console.log('📊 リセット前の状態:', {
        polylineCount: currentList.length,
        totalDistance: (currentDistance / 1000).toFixed(2) + 'km'
      });
      
      // 管理下のポリラインを削除
      currentList.forEach((data, index) => {
        console.log(`🗑️ 管理下ポリライン ${index + 1} を削除`);
        try {
          data.polyline.setMap(null);
        } catch (error) {
          console.error(`❌ ポリライン ${index + 1} 削除エラー:`, error);
        }
      });
      
      // 描画マネージャーをリセット
      resetDrawingManager();
      
      // 未管理のポリラインも強制削除
      forceRemoveAllPolylinesFromMap();
      
      // 未完成の描画もクリーンアップ
      cleanupIncompleteDrawing();
      
      // 描画状態もリセット
      setIsDrawing(false);
      
      // グローバル削除フラグを設定
      setRouteDeletedFlag(true);
      console.log('🌐 グローバル削除フラグを設定（resetAllRoutes）');
      
      console.log('✅ すべてのルートがリセットされました');
      
      // 空の配列を返す
      return [];
    });
  }, [resetDrawingManager, forceRemoveAllPolylinesFromMap, cleanupIncompleteDrawing, setRouteDeletedFlag]);

  // コンポーネントのアンマウント時のクリーンアップ
  useEffect(() => {
    return () => {
      console.log('🧹 コンポーネントクリーンアップ');
      cleanupIncompleteDrawing();
    };
  }, [cleanupIncompleteDrawing]);

  return {
    isDrawing,
    polylines,
    totalDistance,
    drawingManager,
    hasRoutes,
    canUndo,
    canUndoCoordinate,
    setDrawingManager,
    setMapInstance,
    setIncompletePolyline: (polyline: google.maps.Polyline | null) => {
      incompletePolylineRef.current = polyline;
    },
    addDrawingCoordinate,
    startDrawing,
    saveAndCompleteDrawing,
    undoLastCoordinate,
    undoLastPolyline,
    resetAllRoutes,
    handlePolylineComplete,
  };
}; 