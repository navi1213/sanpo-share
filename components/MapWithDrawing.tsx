"use client";

import { useLoadScript, GoogleMap, Libraries } from "@react-google-maps/api";
import { useState, useEffect, useRef, useCallback } from "react";
import Modal from "./modal";

const containerStyle = {
  width: "100%",
  height: "500px",
};

const libraries: Libraries = ["drawing", "places", "geometry"]; // geometryライブラリを追加

export default function EditMapWithDrawing({
  onCoordinatesChange,
  onDistanceChange,
  initialCoordinates,
}: {
  onCoordinatesChange: (coordinates: { lat: number; lng: number }[]) => void;
  onDistanceChange: (distance: string) => void;
  initialCoordinates: { lat: number; lng: number }[];
}) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
    libraries,
  });
  const [showModal, setShowModal] = useState(false);

  const handleShortDistance = () => {
    setShowModal(true); // モーダルを表示
    setTimeout(() => setShowModal(false), 5000); // 5秒後に自動で閉じる
  };

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] =
    useState<google.maps.drawing.DrawingManager | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [polylines, setPolylines] = useState<google.maps.Polyline[]>([]);
  const [totalDistance, setTotalDistance] = useState<number>(0); // 距離の状態を追加
  const [center, setCenter] = useState<{ lat: number; lng: number }>(
    initialCoordinates.length > 0
      ? { lat: initialCoordinates[0].lat, lng: initialCoordinates[0].lng }
      : { lat: 35.51805063978616, lng: 139.7048587992674 }
  );
  const searchBoxRef = useRef<HTMLInputElement | null>(null); // Autocompleteの参照
  const memoizedOnCoordinatesChange = useCallback(onCoordinatesChange, [
    onCoordinatesChange,
  ]);
  const [initialLine, setInitialLine] = useState(initialCoordinates);

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
          const newCoordinates: { lat: number; lng: number }[] = [];
          for (let i = 0; i < path.getLength(); i++) {
            const point = path.getAt(i);
            newCoordinates.push({ lat: point.lat(), lng: point.lng() });
          }

          // 既存の initialLine と新しい座標をマージ
          const updatedCoordinates = [...initialLine, ...newCoordinates];
          setInitialLine(updatedCoordinates); // 状態を更新
          memoizedOnCoordinatesChange(updatedCoordinates); // 更新後の全座標を渡す

          const distance = google.maps.geometry.spherical.computeLength(path);
          setTotalDistance((prev) => prev + distance);
          onDistanceChange((distance / 1000).toFixed(2));
          manager.setDrawingMode(null);
          setTotalDistance((prev) => {
            const updatedDistance = prev + distance;
            onDistanceChange((updatedDistance / 1000).toFixed(2));

            // 合計距離が1km以下の場合にモーダルを表示
            if (updatedDistance <= 1000) {
              handleShortDistance();
            }

            return updatedDistance;
          });
        }
      );

      // 初期座標でポリラインを描画
      if (initialLine.length > 0) {
        const polyline = new google.maps.Polyline({
          path: initialLine,
          map: mapInstance,
        });

        setPolylines((prev) => [...prev, polyline]); // Polyline オブジェクトを追加
        const initialPath = polyline.getPath();
        const initialDistance =
          google.maps.geometry.spherical.computeLength(initialPath);
        setTotalDistance(initialDistance); // 距離を設定
        onDistanceChange((initialDistance / 1000).toFixed(2)); // 距離を表示
      }

      setDrawingManager(manager);

      return () => manager.setMap(null);
    }
  }, [
    mapInstance,
    memoizedOnCoordinatesChange,
    initialCoordinates,
    initialLine,
    onDistanceChange,
  ]);

  // 描画中の線をキャンセル
  const handleCancelDrawing = () => {
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
    }
  };

  // 最後のポリラインを削除
  const handleUndoLastPolyline = () => {
    if (polylines.length > 0) {
      polylines.forEach((polyline) => {
        polyline.setMap(null);
      });
      setPolylines([]);
      setTotalDistance(0);
      setInitialLine([]);
      onCoordinatesChange([]);
      onDistanceChange("0");
      // 描画モードをリセット
      if (drawingManager) {
        drawingManager.setDrawingMode(null);
      }
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
  const onClose = () => {
    setShowModal(false);
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
        <button
          onClick={handleSearch}
          className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
        >
          検索
        </button>
      </div>
      {/* 地図上のボタン */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <button
          onClick={() =>
            drawingManager?.setDrawingMode(
              google.maps.drawing.OverlayType.POLYLINE
            )
          }
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          描画開始
        </button>
        {isDrawing && (
          <button
            onClick={handleCancelDrawing}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            描画をキャンセル
          </button>
        )}
        <button
          onClick={handleUndoLastPolyline}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
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
        options={{
          mapTypeControl: false,
          draggableCursor: "url('/uzai-inu.jpg'), auto",
          draggingCursor: "move",
        }}
      />
      {showModal && (
        <Modal
          path="/angry-dog.jpg"
          text="ワンちゃんが悲しんでいます 😢"
          onClose={onClose}
        />
      )}
    </div>
  );
}
