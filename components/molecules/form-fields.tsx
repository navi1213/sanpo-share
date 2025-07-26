"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface UnifiedFormFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number" | "textarea";
  rows?: number;
  required?: boolean;
}

// 統一されたFormFieldコンポーネント - 内部で分岐
export function UnifiedFormField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  rows = 3,
  required = false,
}: UnifiedFormFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {type === "textarea" ? (
              <Textarea
                {...field}
                placeholder={placeholder}
                rows={rows}
                className="w-full"
              />
            ) : (
              <Input
                {...field}
                type={type}
                placeholder={placeholder}
                className="w-full"
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// 後方互換性のため、既存のコンポーネントも残す
interface FormFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "number";
  required?: boolean;
}

interface TextareaFieldProps extends FormFieldProps {
  rows?: number;
}

export function FormInputField({
  control,
  name,
  label,
  placeholder,
  type = "text",
  required = false,
}: FormFieldProps) {
  return (
    <UnifiedFormField
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      type={type}
      required={required}
    />
  );
}

export function FormTextareaField({
  control,
  name,
  label,
  placeholder,
  rows = 3,
  required = false,
}: TextareaFieldProps) {
  return (
    <UnifiedFormField
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      type="textarea"
      rows={rows}
      required={required}
    />
  );
} 