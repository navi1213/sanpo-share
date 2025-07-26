"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MapPin } from "lucide-react";
import { SearchResult } from "@/types";

interface MapSearchBoxProps {
  searchBoxRef: React.RefObject<HTMLInputElement>;
  onSearch: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  searchResults: SearchResult[];
  onPlaceSelect: (placeId: string) => Promise<void>;
}

export default function MapSearchBox({
  searchBoxRef,
  onSearch,
  isLoading,
  error,
  searchResults,
  onPlaceSelect,
}: MapSearchBoxProps) {
  return (
    <div className="absolute top-4 right-4 z-10 w-80">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex gap-2 mb-2">
          <Input
            ref={searchBoxRef}
            placeholder="場所を検索..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                onSearch();
              }
            }}
          />
          <Button
            onClick={onSearch}
            disabled={isLoading}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-2">{error}</div>
        )}

        {isLoading && (
          <div className="text-gray-500 text-sm mb-2">検索中...</div>
        )}

        {searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto">
            {searchResults.map((result) => (
              <button
                key={result.place_id}
                onClick={() => onPlaceSelect(result.place_id)}
                className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-gray-400" />
                <div>
                  <div className="font-medium text-sm">
                    {result.structured_formatting.main_text}
                  </div>
                  <div className="text-xs text-gray-500">
                    {result.structured_formatting.secondary_text}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 