/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />

// サイト設定
export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    x: string;
    github: string;
  };
};

// カスタムエラー型
export interface CustomError extends Error {
  cause?: {
    err?: Error;
  };
}

// 環境変数の型定義
export interface EnvironmentVariables {
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
  DATABASE_URL: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  SMTP_HOST?: string;
  SMTP_PORT?: string;
  SMTP_USER?: string;
  SMTP_PASS?: string;
}

// データベーススキーマから生成される型
export interface User {
  id: number;
  username: string;
  email: string | null;
  password: string;
  createdAt: Date;
  twoFactorSecret: string | null;
  twoFactorActivated: boolean;
}

export interface Route {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  path: string;
  distance: string;
  createdBy: string | null;
  createdAt: Date;
  author: number | null;
}

export interface Review {
  id: number;
  content: string;
  createdBy: string;
  createdAt: Date;
  author: number;
  routeId: number;
}

export interface PasswordResetToken {
  id: number;
  userId: number;
  token: string;
  tokenExpiry: Date;
}

// 座標型
export interface Coordinate {
  lat: number;
  lng: number;
}

// フォームデータ型
export interface RouteCreateData {
  name: string;
  description?: string;
  location: string;
  path: Coordinate[];
  distance: string;
}

export interface UserRegistrationData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface UserLoginData {
  email: string;
  password: string;
  token?: string;
}

// NextAuth拡張型
export interface SessionUser {
  id: string;
  email: string | null;
  username?: string;
}

export interface AuthSession {
  user: SessionUser;
  expires: string;
}

// フィルタリング・ソート・ページネーション型
export interface RouteFilters {
  search?: string;
  location?: string;
  author?: string;
  minDistance?: number;
  maxDistance?: number;
}

export interface SortOptions {
  field: 'name' | 'distance' | 'author';
  direction: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API レスポンス型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: boolean;
  message?: string;
  meta?: PaginationMeta;
}

export interface RouteApiResponse extends ApiResponse {
  data?: Route;
}

export interface RoutesApiResponse extends ApiResponse {
  data?: Route[];
}

export interface UserApiResponse extends ApiResponse {
  data?: User;
}

// 統計情報型
export interface RouteStats {
  totalRoutes: number;
  totalDistance: number;
  averageDistance: number;
  totalReviews: number;
}

// エラー型
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: Record<string, any>;
  timestamp?: Date;
}

// マップ関連型
export interface MapComponentProps {
  onCoordinatesChange: (coordinates: Coordinate[]) => void;
  onDistanceChange: (distance: string) => void;
  initialCoordinates?: Coordinate[];
  readOnly?: boolean;
  height?: string;
  width?: string;
  onUserDelete?: () => void;
}

// useMapDrawing関連の型定義
export interface UseMapDrawingOptions {
  onCoordinatesChange: (coordinates: Coordinate[]) => void;
  onDistanceChange: (distance: string) => void;
  initialCoordinates: Coordinate[];
  readOnly?: boolean;
  onUserDelete?: () => void;
}

export interface PolylineData {
  polyline: google.maps.Polyline;
  coordinates: Coordinate[];
  distance: number;
}

export interface UseMapDrawingReturn {
  isDrawing: boolean;
  polylines: google.maps.Polyline[];
  totalDistance: number;
  drawingManager: google.maps.drawing.DrawingManager | null;
  hasRoutes: boolean;
  canUndo: boolean;
  canUndoCoordinate: boolean;
  setDrawingManager: (manager: google.maps.drawing.DrawingManager | null) => void;
  setMapInstance: (map: google.maps.Map | null) => void;
  setIncompletePolyline: (polyline: google.maps.Polyline | null) => void;
  addDrawingCoordinate: (coordinate: Coordinate) => void;
  startDrawing: () => void;
  saveAndCompleteDrawing: () => void;
  undoLastCoordinate: () => void;
  undoLastPolyline: () => void;
  resetAllRoutes: () => void;
  handlePolylineComplete: (polyline: google.maps.Polyline) => void;
}

export interface UseMapSearchOptions {
  onLocationSelect: (location: Coordinate) => void;
}

export interface UseMapSearchReturn {
  searchBoxRef: React.RefObject<HTMLInputElement>;
  searchResults: google.maps.places.AutocompletePrediction[];
  isLoading: boolean;
  error: string | null;
  handleSearch: (query: string) => void;
  handlePlaceSelect: (placeId: string) => Promise<void>;
}

// UI コンポーネント型
export interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// フォーム型
export interface FormFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// ナビゲーション型
export interface NavigationItem {
  name: string;
  href: string;
  current?: boolean;
}

export interface NavigationProps {
  items: NavigationItem[];
  className?: string;
}

// 検索関連の型定義
export interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export interface PlaceDetails {
  place_id: string;
  name: string;
  formatted_address: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

// グローバル変数の型定義
declare global {
  interface Window {
    __routeDeleted?: boolean;
    __polylineTracker?: google.maps.Polyline[];
  }
}