import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "../atoms/input";
import { Textarea } from "../atoms/textarea";
import { RouteFormFieldsProps } from "@/types/components";

export const RouteFormFields = ({ control }: RouteFormFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>ルート名</FormLabel>
            <FormControl>
              <Input placeholder="ルート名を入力してください" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>説明</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="ルートの説明を入力してください" 
                className="resize-none"
                rows={3}
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>場所</FormLabel>
            <FormControl>
              <Input placeholder="場所を入力してください" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}; 