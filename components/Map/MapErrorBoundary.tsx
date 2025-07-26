"use client";

import { AlertTriangle } from "lucide-react";

interface MapErrorBoundaryProps {
  error: Error;
}

export default function MapErrorBoundary({ error }: MapErrorBoundaryProps) {
  return (
    <div className="flex items-center justify-center h-full min-h-[400px]">
      <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          地図の読み込みに失敗しました
        </h3>
        <p className="text-red-600 mb-4">
          {error.message || '地図の表示中にエラーが発生しました'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          ページを再読み込み
        </button>
      </div>
    </div>
  );
} 