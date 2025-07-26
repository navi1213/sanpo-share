"use client";

import { Button } from "@/components/ui/button";
import { Pencil, X, Undo2, RotateCcw, Palette } from "lucide-react";

interface MapControlsProps {
  isDrawing: boolean;
  hasRoutes: boolean;
  canUndo: boolean;
  canUndoCoordinate: boolean;
  onStartDrawing: () => void;
  onSaveAndCompleteDrawing: () => void;
  onUndoLastCoordinate: () => void;
  onUndoLastPolyline: () => void;
  onResetAllRoutes: () => void;
}

export default function MapControls({
  isDrawing,
  hasRoutes,
  canUndo,
  canUndoCoordinate,
  onStartDrawing,
  onSaveAndCompleteDrawing,
  onUndoLastCoordinate,
  onUndoLastPolyline,
  onResetAllRoutes,
}: MapControlsProps) {
  console.log('🎮 MapControls状態:', {
    isDrawing,
    hasRoutes,
    canUndo,
    canUndoCoordinate,
    shouldShowDeleteButtons: !isDrawing && canUndo
  });

  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      {!isDrawing ? (
        // 通常モード：描画開始ボタン
        <div className="flex flex-col gap-2">
          <Button
            onClick={onStartDrawing}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200"
            disabled={isDrawing}
          >
            <Pencil className="w-4 h-4 mr-2" />
            ルートを描画
          </Button>
          
          {/* 保存済みポリライン操作 */}
          {canUndo && (
            <Button
              onClick={onUndoLastPolyline}
              size="sm"
              variant="outline"
              className="bg-white/90 shadow-lg transition-all duration-200"
              disabled={isDrawing}
            >
              <Undo2 className="w-4 h-4 mr-2" />
              最後のルートを削除
            </Button>
          )}
          
          {/* ルートが存在する場合のみリセットボタンを表示 */}
          {hasRoutes && (
            <Button
              onClick={onResetAllRoutes}
              size="sm"
              variant="outline"
              className="border-red-400 text-red-700 hover:bg-red-100 hover:border-red-500 shadow-lg transition-all duration-200 font-medium"
              disabled={isDrawing}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              すべてリセット
            </Button>
          )}
        </div>
      ) : (
        // 描画モード：描画中のコントロール
        <div className="flex flex-col gap-2">
          {/* 描画モード表示 */}
          <div className="bg-blue-100 border-2 border-blue-400 text-blue-800 px-3 py-2 rounded-md text-xs font-medium shadow-lg">
            <div className="flex items-center">
              <Palette className="w-3 h-3 mr-1 animate-pulse" />
              描画モード中...
            </div>
            <div className="text-xs mt-1 opacity-75">
              地図をクリックしてルートを描いてください
            </div>
            <div className="text-xs mt-1 opacity-75">
              薄いブルー線がガイドラインとして表示されます
            </div>
            <div className="text-xs mt-1 opacity-75">
              「保存して完了」で描画を終了します
            </div>
          </div>
          
          {/* 保存して完了ボタン */}
          <Button
            onClick={onSaveAndCompleteDrawing}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200"
          >
            <Pencil className="w-4 h-4 mr-2" />
            保存して完了
          </Button>
          
          {/* 描画中の操作ボタン */}
          <div className="flex flex-col gap-1">
            {/* 座標を戻るボタン（描画中のみ） */}
            {canUndoCoordinate && (
              <Button
                onClick={onUndoLastCoordinate}
                size="sm"
                variant="outline"
                className="bg-white/90 shadow-lg transition-all duration-200"
              >
                <Undo2 className="w-4 h-4 mr-2" />
                一つ戻る
              </Button>
            )}
            
            {/* 全リセットボタン */}
            {hasRoutes && (
              <Button
                onClick={onResetAllRoutes}
                size="sm"
                variant="outline"
                className="border-red-400 text-red-700 hover:bg-red-100 hover:border-red-500 bg-white/90 shadow-lg transition-all duration-200 font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                全リセット
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 