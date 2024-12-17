"use client";

import {
  GoogleMap,
  Polyline,
  useLoadScript,
} from "@react-google-maps/api";
import { useEffect, useState } from "react";
import CustomMarker from "./CustomMarker";

const containerStyle = {
  width: "100%",
  height: "500px",
};

// デフォルトのマップ中心位置
// const center = {
//   lat: 35.517745,
//   lng: 139.70416,
// };

export default function RouteMap({
  path,distance
}: {
  path: { lat: number; lng: number }[];
  distance:string;
}) {
  const center = path[0];
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });

  const [startMarker, setStartMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [endMarker, setEndMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [adjustedEndMarker, setAdjustedEndMarker] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    if (path.length > 0) {
      const start = path[0];
      const end = path[path.length - 1];
      setStartMarker(start);
      setEndMarker(end);

      // スタートとゴールが同じ場合にピンを少しずらす
      if (start.lat === end.lat && start.lng === end.lng) {
        setAdjustedEndMarker({
          lat: end.lat + 0.0001, // 緯度をわずかに増やして調整
          lng: end.lng + 0.0001, // 経度をわずかに増やして調整
        });
      }
    }
  }, [path]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={path.length > 0 ? path[0] : center}
      zoom={17}
    >
      <CustomMarker coordinate={startMarker} name="スタート" />

      {/* ゴール地点のピン */}
      {endMarker && (
        <CustomMarker
          coordinate={adjustedEndMarker ? adjustedEndMarker : endMarker}
          name="ゴール"
        />

      )}

      {/* ルートのポリライン */}
      {path.length > 1 && (
        <Polyline
          path={path}
          options={{
            strokeColor: "#0000FF",
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      )}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-white p-2 rounded shadow">
      <strong>合計距離: {distance} km</strong>
    </div>
    </GoogleMap>
  );
}
