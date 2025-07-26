"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useMapDrawing } from "@/hooks/useMapDrawing";
import { useMapSearch } from "@/hooks/useMapSearch";
import { MapComponentProps, Coordinate } from "@/types";
import MapControls from "./MapControls";
import MapSearchBox from "./MapSearchBox";
import MapDrawingManager from "./MapDrawingManager";
import MapErrorBoundary from "./MapErrorBoundary";
import { Polyline } from "@react-google-maps/api";

const defaultCenter: Coordinate = { lat: 35.51805063978616, lng: 139.7048587992674 };

export default function MapContainer({
  onCoordinatesChange,
  onDistanceChange,
  initialCoordinates = [],
  readOnly = false,
  height = "500px",
  width = "100%",
  onUserDelete,
}: MapComponentProps) {
  console.log('🗺️ MapContainer初期化:', {
    initialCoordinatesLength: initialCoordinates.length,
    initialCoordinates: initialCoordinates,
    readOnly: readOnly,
    height: height,
    width: width
  });

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState<Coordinate>(
    initialCoordinates.length > 0 ? initialCoordinates[0] : defaultCenter
  );

  // Drawing Manager初期化済みフラグ
  const drawingManagerInitialized = useRef(false);

  // Google Maps API の初期化
  const { isLoaded, loadError } = useGoogleMaps({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  // 地図描画機能
  const drawingHook = useMapDrawing({
    onCoordinatesChange,
    onDistanceChange,
    initialCoordinates,
  });

  // 検索機能
  const searchHook = useMapSearch({
    onLocationSelect: (location) => {
      setCenter(location);
      if (mapInstance) {
        mapInstance.panTo(location);
        mapInstance.setZoom(15);
      }
    },
  });

  // 地図の初期化
  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    console.log('🗺️ Map loaded, setting up drawing manager...');
    setMapInstance(mapInstance);
    drawingHook.setMapInstance(mapInstance);
    
    if (readOnly) {
      console.log('📖 Read-only mode, skipping drawing manager setup');
      return;
    }
    
    // 初期座標がある場合は地図の中心とズームを設定
    if (initialCoordinates.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      initialCoordinates.forEach(coord => {
        bounds.extend(coord);
      });
      mapInstance.fitBounds(bounds);
    }
  }, [initialCoordinates, readOnly]); // drawingHookを削除

  // 地図の描画マネージャーを初期化
  useEffect(() => {
    if (mapInstance && !readOnly && !drawingManagerInitialized.current && isLoaded) {
      // Drawing ライブラリが読み込まれているか確認
      if (!window.google?.maps?.drawing?.DrawingManager) {
        console.error('❌ Google Maps Drawing library not loaded');
        return;
      }

      drawingManagerInitialized.current = true;
      console.log('🏗️ Initializing Drawing Manager');
      
      // シンプルな設定でDrawing Managerを作成
      const manager = new google.maps.drawing.DrawingManager();
      
      console.log('📦 Drawing Manager created:', !!manager);
      
      // 地図に設定
      manager.setMap(mapInstance);
      console.log('🗺️ Drawing Manager attached to map');
      
      // オプションを後から設定
      manager.setOptions({
        drawingControl: false,
        drawingMode: null,
        polylineOptions: {
          strokeColor: "#2563eb",
          strokeWeight: 4,
          strokeOpacity: 0.8,
          editable: false,
          draggable: false,
        },
      });
      
      console.log('⚙️ Drawing Manager options set');
      
      drawingHook.setDrawingManager(manager);

      // イベントリスナーを設定
      const polylineCompleteListener = google.maps.event.addListener(
        manager, 
        "polylinecomplete", 
        (polyline: google.maps.Polyline) => {
          console.log('✅ Polyline completed');
          drawingHook.handlePolylineComplete(polyline);
        }
      );

      const overlaycompleteListener = google.maps.event.addListener(
        manager,
        "overlaycomplete",
        (event: any) => {
          console.log('🎉 Overlay complete:', event.type);
          if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
            console.log('📏 Polyline overlay created');
            // 作成されたポリラインを未完成として追跡
            drawingHook.setIncompletePolyline(event.overlay);
          }
        }
      );

      // Drawing Manager の状態変更を監視
      const drawingModeChangedListener = google.maps.event.addListener(
        manager,
        "drawingmode_changed",
        () => {
          const currentMode = manager.getDrawingMode();
          console.log('🔄 Drawing mode changed to:', currentMode);
        }
      );

      // 注意: カスタム描画システムを使用するため、地図クリックリスナーは削除
      // useMapDrawingフックのsetupCustomDrawingListenerが地図クリックを処理

      return () => {
        google.maps.event.removeListener(polylineCompleteListener);
        google.maps.event.removeListener(overlaycompleteListener);
        google.maps.event.removeListener(drawingModeChangedListener);
        google.maps.event.clearInstanceListeners(manager);
        manager.setMap(null);
        drawingManagerInitialized.current = false;
      };
    }
    
    return undefined;
  }, [mapInstance, readOnly, isLoaded]); // 最小限の依存配列

  // 描画モード変更時の追加処理
  useEffect(() => {
    if (mapInstance && drawingHook.isDrawing) {
      // 地図のカーソルを強制的に crosshair に設定
      mapInstance.setOptions({
        draggableCursor: 'crosshair',
        draggingCursor: 'crosshair'
      });
    } else if (mapInstance && !drawingHook.isDrawing) {
      // 通常モードに戻す
      mapInstance.setOptions({
        draggableCursor: null,
        draggingCursor: null
      });
    }
  }, [mapInstance, drawingHook.isDrawing]);

  if (loadError) {
    return <MapErrorBoundary error={loadError} />;
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center" style={{ height, width }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={{ height, width }}>
      <GoogleMap
        mapContainerStyle={{ height: "100%", width: "100%" }}
        mapContainerClassName={drawingHook.isDrawing ? "drawing-mode" : ""}
        center={center}
        zoom={13}
        onLoad={onMapLoad}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "greedy",
          disableDoubleClickZoom: false,
          draggable: true,
        }}
      >
        {/* useMapDrawingで管理されるポリラインのみ表示 */}
        {/* 初期座標は useMapDrawing 内で PolylineDataList に追加されるため、ここでは表示しない */}
        
        {/* 既存のポリラインを表示 */}
        {drawingHook.polylines.map((polyline, index) => {
          // 既存のポリラインは既に地図に描画されているので、ここでは何もしない
          return null;
        })}
      </GoogleMap>

      {/* 検索ボックス */}
      {!readOnly && (
        <MapSearchBox
          searchBoxRef={searchHook.searchBoxRef}
          onSearch={searchHook.handleSearch}
          isLoading={searchHook.isLoading}
          error={searchHook.error}
          searchResults={searchHook.searchResults}
          onPlaceSelect={searchHook.handlePlaceSelect}
        />
      )}

      {/* 描画コントロール */}
      {!readOnly && (
        <MapControls
          isDrawing={drawingHook.isDrawing}
          hasRoutes={drawingHook.hasRoutes}
          canUndo={drawingHook.canUndo}
          canUndoCoordinate={drawingHook.canUndoCoordinate}
          onStartDrawing={drawingHook.startDrawing}
          onSaveAndCompleteDrawing={drawingHook.saveAndCompleteDrawing}
          onUndoLastCoordinate={drawingHook.undoLastCoordinate}
          onUndoLastPolyline={() => {
            if (onUserDelete) onUserDelete(); // ユーザー削除フラグを設定
            drawingHook.undoLastPolyline();
          }}
          onResetAllRoutes={() => {
            if (onUserDelete) onUserDelete(); // ユーザー削除フラグを設定
            drawingHook.resetAllRoutes();
          }}
        />
      )}

      {/* 描画マネージャー */}
      {!readOnly && (
        <MapDrawingManager
          drawingManager={drawingHook.drawingManager}
          isDrawing={drawingHook.isDrawing}
        />
      )}

      {/* 距離表示 */}
      {drawingHook.totalDistance > 0 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg border">
          <div className="text-sm font-medium text-gray-700">
            合計距離: <span className="text-blue-600 font-bold">{(drawingHook.totalDistance / 1000).toFixed(2)} km</span>
          </div>
        </div>
      )}
    </div>
  );
} 