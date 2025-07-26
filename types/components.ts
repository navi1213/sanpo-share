// コンポーネント共通型定義
import { ReactNode } from "react";
import { Control } from "react-hook-form";
import { Coordinate } from "./index";
import { RouteCreateData } from "@/validation/schemas";

// ============= Base Types =============
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

// ============= Form Types =============
export interface FormFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number";
  required?: boolean;
}

export interface RouteFormFieldsProps {
  control: Control<RouteCreateData>;
}

// ============= Route Types =============
export interface RouteData {
  id: number;
  name: string;
  description: string | null;
  location: string;
  path: Coordinate[];
  distance: string;
  createdBy: string | null;
  author: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteActionButtonsProps {
  coordinates: Coordinate[];
  isFormValid: boolean;
  onReset: () => string;
  onDeleteAll: () => void;
  onCancel: () => void;
}

// ============= Layout Types =============
export interface AuthLayoutProps extends BaseComponentProps {
  title?: string;
  description?: string;
}

// ============= Map Types =============
export interface MapComponentProps {
  onCoordinatesChange?: (coordinates: Coordinate[]) => void;
  onDistanceChange?: (distance: string) => void;
  initialCoordinates?: Coordinate[];
  readOnly?: boolean;
  height?: string;
  width?: string;
  onUserDelete?: () => void;
}

// ============= Auth Types =============
export interface AuthCardProps extends BaseComponentProps {
  title: string;
  description?: string;
  footer?: ReactNode;
}

// ============= Navigation Types =============
export interface NavigationItem {
  href: string;
  label: string;
  icon?: ReactNode;
} 