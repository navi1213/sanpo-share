import { useRef, useCallback, useState } from "react";
import { SearchResult, PlaceDetails } from "@/types";

export interface UseMapSearchOptions {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
}

export interface UseMapSearchReturn {
  searchBoxRef: React.RefObject<HTMLInputElement>;
  handleSearch: () => Promise<void>;
  searchResults: SearchResult[];
  isLoading: boolean;
  error: string | null;
  handlePlaceSelect: (placeId: string) => Promise<void>;
}

export const useMapSearch = (options: UseMapSearchOptions): UseMapSearchReturn => {
  const { onLocationSelect } = options;
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!searchBoxRef.current?.value) {
      setError("検索キーワードを入力してください");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchBox = searchBoxRef.current;
      const service = new google.maps.places.AutocompleteService();
      
      const results = await new Promise<SearchResult[]>((resolve, reject) => {
        service.getPlacePredictions(
          {
            input: searchBox.value,
            types: ['geocode', 'establishment'],
          },
          (predictions: google.maps.places.AutocompletePrediction[] | null, status: google.maps.places.PlacesServiceStatus) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              resolve(predictions as SearchResult[]);
            } else {
              reject(new Error('検索に失敗しました'));
            }
          }
        );
      });

      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : '検索エラーが発生しました');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePlaceSelect = useCallback(async (placeId: string) => {
    try {
      const service = new google.maps.places.PlacesService(document.createElement('div'));
      
      const place = await new Promise<google.maps.places.PlaceResult>((resolve, reject) => {
        service.getDetails(
          {
            placeId,
            fields: ['place_id', 'name', 'formatted_address', 'geometry'],
          },
          (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && place) {
              resolve(place);
            } else {
              reject(new Error('場所の詳細取得に失敗しました'));
            }
          }
        );
      });

      if (place.geometry?.location) {
        onLocationSelect({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '場所の選択に失敗しました');
    }
  }, [onLocationSelect]);

  return {
    searchBoxRef,
    handleSearch,
    searchResults,
    isLoading,
    error,
    handlePlaceSelect,
  };
}; 