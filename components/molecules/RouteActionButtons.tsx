import { Button } from "../atoms/button";
import { useToast } from "@/hooks/use-toast";
import { RouteActionButtonsProps } from "@/types/components";

export const RouteActionButtons = ({ 
  coordinates, 
  isFormValid, 
  onReset, 
  onDeleteAll,
  onCancel 
}: RouteActionButtonsProps) => {
  const { toast } = useToast();

  const handleReset = () => {
    const message = onReset();
    toast({
      title: "リセット",
      description: message,
    });
  };

  const handleDeleteAll = () => {
    const confirmDelete = window.confirm('すべてのルートを削除しますか？\n\nこの操作は取り消すことができません。');
    if (confirmDelete) {
      onDeleteAll();
      toast({
        title: "削除完了",
        description: "すべてのルートが削除されました",
      });
    }
  };

  return (
    <div className="flex gap-2">
      <Button 
        type="submit" 
        disabled={coordinates.length === 0 || !isFormValid} 
        className="flex-1"
      >
        ルートを更新
      </Button>
      
      <Button type="button" variant="outline" onClick={handleReset}>
        初期状態に戻す
      </Button>
      
      <Button type="button" variant="destructive" onClick={handleDeleteAll}>
        すべて削除
      </Button>
      
      <Button type="button" variant="outline" onClick={onCancel}>
        キャンセル
      </Button>
    </div>
  );
}; 