"use client";

import { useLoadScript, GoogleMap, Libraries } from "@react-google-maps/api";
import { useEffect, useState } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 35.517745,
  lng: 139.704160,
};

const libraries: Libraries = ["drawing"];

export default function MapWithDrawing({onCoordinatesChange}: {
  onCoordinatesChange: (coordinates: { lat: number; lng: number }[]) => void;
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });
  const coordinates = [];
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [isDrawing, setIsDrawing] = useState(false); // 描画中の状態
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]); // 描画済みのポリライン

  useEffect(() => {
    if (mapInstance) {
      const manager = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
          position: google.maps.ControlPosition.TOP_CENTER,
          drawingModes: [google.maps.drawing.OverlayType.POLYLINE],
        },
      });
      manager.setMap(mapInstance);

      // 描画開始イベント
      google.maps.event.addListener(manager, "drawingmode_changed", () => {
        const currentMode = manager.getDrawingMode();
        setIsDrawing(!!currentMode); // 描画モードが有効であればtrue
      });

      // Polyline完了イベント
      google.maps.event.addListener(manager, "polylinecomplete", (polyline: google.maps.Polyline) => {
        setPolylines((prev) => [...prev, polyline]); // 描画したポリラインを保存

        const path = polyline.getPath();
       
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i);
          coordinates.push({ lat: point.lat(), lng: point.lng() });
        }
        onCoordinatesChange([...coordinates])
        // 描画が完了したら描画モードをリセット
        manager.setDrawingMode(null);
      });

      setDrawingManager(manager);

      // Cleanup
      return () => manager.setMap(null);
    }
  }, [mapInstance]);

  // 描画中の線をキャンセル
  const handleCancelDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(null); // 描画モードを無効化
    }
  };

  // 最後のポリラインを削除
  const handleUndoLastPolyline = () => {
    if (polylines.length > 0) {
      const lastPolyline = polylines[polylines.length - 1];
      lastPolyline.setMap(null); // マップから削除
      setPolylines((prev) => prev.slice(0, -1)); // 配列から削除
    }
  };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ marginBottom: "10px" }}>
        {isDrawing && ( // 描画中のみ表示
          <button
            onClick={handleCancelDrawing}
            style={{
              marginRight: "10px",
              padding: "8px 16px",
              backgroundColor: "#ff5733",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            描画をキャンセル
          </button>
        )}
        <button
          onClick={handleUndoLastPolyline}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          元に戻す
        </button>
      </div>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={17}
        onLoad={(map) => setMapInstance(map)} // Mapのインスタンスを取得
      />
    </div>
  );
}
