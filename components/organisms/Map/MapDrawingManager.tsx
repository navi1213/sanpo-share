"use client";

interface MapDrawingManagerProps {
  drawingManager: google.maps.drawing.DrawingManager | null;
  isDrawing: boolean;
}

export default function MapDrawingManager({
  drawingManager,
  isDrawing,
}: MapDrawingManagerProps) {
  // このコンポーネントは描画マネージャーの状態を表示するためのUIを提供
  // 実際の描画機能は useMapDrawing フックで管理される
  
  if (!drawingManager) {
    return null;
  }

  return (
    <div className="absolute bottom-4 left-4 z-10">
      {isDrawing && (
        <div className="bg-blue-100 border border-blue-300 rounded-lg p-3">
          <div className="text-blue-800 text-sm font-medium">
            地図上でルートを描画してください
          </div>
          <div className="text-blue-600 text-xs mt-1">
            クリックして点を追加、ダブルクリックで完了
          </div>
        </div>
      )}
    </div>
  );
} 