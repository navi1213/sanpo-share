"use client";

import { GoogleMap, Polyline } from "@react-google-maps/api";
import { useEffect, useState } from "react";
import CustomMarker from "./CustomMarker";
import { Coordinate } from "@/types";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";

const containerStyle = {
  width: "100%",
  height: "500px",
};

interface RouteMapProps {
  path: Coordinate[];
  distance: string;
}

export default function RouteMap({ path, distance }: RouteMapProps) {
  const center = path.length > 0 ? path[0] : { lat: 35.6762, lng: 139.6503 };
  const { isLoaded, loadError } = useGoogleMaps({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  });
  
  const [startMarker, setStartMarker] = useState<Coordinate | null>(null);
  const [endMarker, setEndMarker] = useState<Coordinate | null>(null);
  const [adjustedEndMarker, setAdjustedEndMarker] = useState<Coordinate | null>(null);
  
  useEffect(() => {
    if (path.length > 0) {
      const start = path[0];
      const end = path[path.length - 1];
      setStartMarker(start);
      setEndMarker(end);

      // スタートとゴールが同じ場合にピンを少しずらす
      const distanceThreshold = 0.0005; // 緯度経度の差のしきい値（小さくするほど厳密）

      const isClose = (start: Coordinate, end: Coordinate): boolean => {
        const latDiff = Math.abs(start.lat - end.lat);
        const lngDiff = Math.abs(start.lng - end.lng);
        return latDiff < distanceThreshold && lngDiff < distanceThreshold;
      };

      if (isClose(start, end)) {
        setAdjustedEndMarker({
          lat: end.lat + 0.0001, // 緯度をわずかに増やして調整
          lng: end.lng + 0.0001, // 経度をわずかに増やして調整
        });
      } else {
        setAdjustedEndMarker(null);
      }
    }
  }, [path]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={17}
    >
      {startMarker && (
        <CustomMarker coordinate={startMarker} name="スタート" />
      )}

      {/* ゴール地点のピン */}
      {endMarker && (
        <CustomMarker
          coordinate={adjustedEndMarker || endMarker}
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
