"use client";

import { useLoadScript, GoogleMap, Libraries } from "@react-google-maps/api";
import { useState, useEffect, useRef, useCallback } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const libraries: Libraries = ["drawing", "places", "geometry"]; // geometryライブラリを追加

export default function MapWithDrawing({
  onCoordinatesChange,
  onDistanceChange,
}: {
  onCoordinatesChange: (coordinates: { lat: number; lng: number }[]) => void;
  onDistanceChange:(distance:string) => void;
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] =
    useState<google.maps.drawing.DrawingManager | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0); // 距離の状態を追加
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 35.51805063978616,
    lng: 139.7048587992674,
  });
  const searchBoxRef = useRef<HTMLInputElement | null>(null); // Autocompleteの参照
  const memoizedOnCoordinatesChange = useCallback(onCoordinatesChange, [
    onCoordinatesChange,
  ]);

  useEffect(() => {
    if (mapInstance) {
      const manager = new google.maps.drawing.DrawingManager({
        drawingControl: false,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYLINE],
        },
      });
      manager.setMap(mapInstance);

      google.maps.event.addListener(manager, "drawingmode_changed", () => {
        const currentMode = manager.getDrawingMode();
        setIsDrawing(!!currentMode);
      });

      google.maps.event.addListener(
        manager,
        "polylinecomplete",
        (polyline: google.maps.Polyline) => {
          setPolylines((prev) => [...prev, polyline]);

          const path = polyline.getPath();
          const coordinates: { lat: number; lng: number }[] = [];
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            coordinates.push({ lat: point.lat(), lng: point.lng() });
          }
          memoizedOnCoordinatesChange(coordinates); // メモ化された関数を呼び出す

          // 距離を計算
          const distance = google.maps.geometry.spherical.computeLength(path);
          setTotalDistance((prev) => prev + distance);
          onDistanceChange((distance / 1000).toFixed(2));
          manager.setDrawingMode(null);
        }
      );

      setDrawingManager(manager);

      return () => manager.setMap(null);
    }
  }, [mapInstance, memoizedOnCoordinatesChange]);

  // 描画中の線をキャンセル
  const handleCancelDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
  };

  // 最後のポリラインを削除
  const handleUndoLastPolyline = () => {
    if (polylines.length > 0) {
      const lastPolyline = polylines[polylines.length - 1];
      const path = lastPolyline.getPath();

      // 削除する距離を計算
      const distance = google.maps.geometry.spherical.computeLength(path);

      lastPolyline.setMap(null);
      setPolylines((prev) => prev.slice(0, -1));
      setTotalDistance((prev) => prev - distance);
    }
  };

  const handleSearch = async () => {
    if (searchBoxRef.current) {
      const address = searchBoxRef.current.value;

      // Geocoding API を使用して住所から緯度経度を取得
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === "OK" && results[0]) {
          const location = results[0].geometry.location;
          setCenter({ lat: location.lat(), lng: location.lng() });
          mapInstance?.panTo({ lat: location.lat(), lng: location.lng() });
        } else {
          console.error("住所が見つかりませんでした:", status);
        }
      });
    }
  };

  // コンポーネントマウント時に呼び出し
  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="relative">
    {/* 検索バー */}
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
      <input
        ref={searchBoxRef}
        type="text"
        placeholder="住所を入力"
        className="border p-2 rounded"
      />
      <button onClick={handleSearch} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
        検索
      </button>
    </div>
    {/* 地図上のボタン */}
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <button
        onClick={() => drawingManager?.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE)}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        描画開始
      </button>
      {isDrawing && (
        <button onClick={handleCancelDrawing} className="bg-red-500 text-white px-4 py-2 rounded">
          描画をキャンセル
        </button>
      )}
      <button onClick={handleUndoLastPolyline} className="bg-blue-500 text-white px-4 py-2 rounded">
        元に戻す
      </button>
    </div>

    {/* 距離表示 */}
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white p-2 rounded shadow">
      <strong>合計距離: {(totalDistance / 1000).toFixed(2)} km</strong>
    </div>

    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={17}
      onLoad={(map) => setMapInstance(map)}
      options={{mapTypeControl:false}}
    />
  </div>
  );
}
