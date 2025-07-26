import { useLoadScript, Libraries } from "@react-google-maps/api";
import { useMemo } from "react";

// ライブラリを定数として定義（再作成を防ぐ）
const libraries: Libraries = ["drawing", "geometry", "places"];

export interface UseGoogleMapsOptions {
  apiKey: string;
  additionalLibraries?: string[];
}

export interface UseGoogleMapsReturn {
  isLoaded: boolean;
  loadError: Error | undefined;
  libraries: Libraries;
}

export const useGoogleMaps = (options: UseGoogleMapsOptions): UseGoogleMapsReturn => {
  const { apiKey, additionalLibraries = [] } = options;
  
  // ライブラリ配列をメモ化して再作成を防ぐ
  const allLibraries = useMemo(() => {
    if (additionalLibraries.length === 0) {
      return libraries; // 追加ライブラリがない場合は元の配列をそのまま使用
    }
    
    const baseLibraries = [...libraries];
    const validAdditional = additionalLibraries.filter(
      (lib: string) => 
        !baseLibraries.includes(lib as any) && 
        ["places", "drawing", "geometry", "visualization"].includes(lib)
    );
    return [...baseLibraries, ...validAdditional] as Libraries;
  }, [additionalLibraries]);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries: allLibraries,
    preventGoogleFontsLoading: true, // Googleフォントの自動読み込みを無効化
    region: 'JP', // 日本地域を指定してパフォーマンス向上
    language: 'ja', // 日本語を指定
    version: "weekly", // 最新の週次リリース版を使用
  });

  return {
    isLoaded,
    loadError,
    libraries: allLibraries,
  };
}; 