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

  // 地図インスタンスが設定されたときの処理
  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  // 初期座標を地図に反映
  useEffect(() => {
    if (!mapInstance || !isLoaded) return;
    
    // 初期座標がある場合は地図の中心とズームを設定
    if (initialCoordinates.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      initialCoordinates.forEach(coord => {
        bounds.extend(coord);
      });
      mapInstance.fitBounds(bounds);
    }
  }, [initialCoordinates, readOnly, mapInstance, isLoaded]);

  // 地図とDrawing hookのセットアップ
  useEffect(() => {
    if (drawingHook.updateMapInstance) {
      drawingHook.updateMapInstance(mapInstance);
    }
  }, [mapInstance, drawingHook]);

  useEffect(() => {
    if (drawingHook.setupInitialCoordinates) {
      drawingHook.setupInitialCoordinates();
    }
  }, [drawingHook]);

  useEffect(() => {
    if (drawingHook.handleDrawingStateChange) {
      drawingHook.handleDrawingStateChange();
    }
  }, [drawingHook]);

  // Drawing Manager設定
  const handleDrawingManagerLoad = useCallback((manager: google.maps.drawing.DrawingManager) => {
    drawingHook.resetDrawingManager();
  }, [drawingHook]);

  // ポリライン描画完了
  const handlePolylineComplete = useCallback((event: google.maps.drawing.OverlayCompleteEvent) => {
    if (event.type === google.maps.drawing.OverlayType.POLYLINE) {
      const polyline = event.overlay as google.maps.Polyline;
      drawingHook.setIncompletePolyline(polyline);
    }
  }, [drawingHook]);

  // マップの見た目を描画モードに応じて変更
  useEffect(() => {
    if (!mapInstance) return;

    if (mapInstance && drawingHook.isDrawing) {
      mapInstance.setOptions({
        draggableCursor: 'crosshair',
        draggingCursor: 'crosshair'
      });
    } else if (mapInstance && !drawingHook.isDrawing) {
      mapInstance.setOptions({
        draggableCursor: null,
        draggingCursor: null
      });
    }
  }, [mapInstance, drawingHook.isDrawing, drawingHook]);

  if (loadError) {
    return <MapErrorBoundary error={loadError} />;
  }

  if (!isLoaded) {
    return (
      <div 
        style={{ width, height }} 
        className="flex items-center justify-center bg-gray-100 rounded-lg"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">地図を読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height, width }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={defaultCenter}
        zoom={12}
        onLoad={onMapLoad}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {/* 地図上のポリライン表示 */}
        {drawingHook.polylineDataList.map((polylineData, index) => {
          if (!polylineData.coordinates || polylineData.coordinates.length < 2) {
            return null;
          }

          return (
            <Polyline
              key={`polyline-${index}`}
              path={polylineData.coordinates}
              options={{
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2,
                clickable: false,
              }}
            />
          );
        })}

        {/* 地図コントロール */}
        <MapControls
          isDrawing={drawingHook.isDrawing}
          hasRoutes={drawingHook.hasRoutes}
          canUndo={drawingHook.canUndo}
          canUndoCoordinate={drawingHook.canUndoCoordinate}
          onStartDrawing={drawingHook.startDrawing}
          onSaveAndCompleteDrawing={drawingHook.saveAndCompleteDrawing}
          onUndoLastCoordinate={drawingHook.undoLastCoordinate}
          onUndoLastPolyline={() => {
            drawingHook.undoLastPolyline();
            onUserDelete?.();
          }}
          onResetAllRoutes={() => {
            drawingHook.resetAllRoutes();
            onUserDelete?.();
          }}
        />
      </GoogleMap>

      {/* 距離表示 */}
      <div className="mt-2 text-sm text-gray-600">
        総距離: 0 km
      </div>
    </div>
  );
} 