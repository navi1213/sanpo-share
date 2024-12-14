"use client";

import { useLoadScript, GoogleMap, Libraries } from "@react-google-maps/api";
import { useState, useEffect, useRef } from "react";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const libraries: Libraries = ["drawing", "places"]; // "places"ライブラリを追加

export default function MapWithDrawing({
  onCoordinatesChange,
}: {
  onCoordinatesChange: (coordinates: { lat: number; lng: number }[]) => void;
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
  const [center, setCenter] = useState<{ lat: number; lng: number }>({
    lat: 35.51805063978616,
    lng: 139.7048587992674,
  });
  const searchBoxRef = useRef<HTMLInputElement | null>(null); // Autocompleteの参照

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
          onCoordinatesChange(coordinates);
          manager.setDrawingMode(null);
        }
      );

      setDrawingManager(manager);

      return () => manager.setMap(null);
    }
  }, [mapInstance]);

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
      lastPolyline.setMap(null);
      setPolylines((prev) => prev.slice(0, -1));
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
    <div>
      <div style={{ marginBottom: "10px" }}>
        <input
          ref={searchBoxRef}
          type="text"
          placeholder="住所を入力"
          className="border p-2"
        />
        <button
          onClick={handleSearch}
          style={{
            marginLeft: "10px",
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          検索
        </button>
        {isDrawing && (
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
        onLoad={(map) => setMapInstance(map)}
      />
    </div>
  );
}
