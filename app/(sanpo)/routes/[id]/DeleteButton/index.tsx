"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteRouteById } from "../actions";

type DeleteButtonProps = {
  routeId: string;
};

export default function DeleteButton({ routeId }: DeleteButtonProps) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteRouteById(routeId);
      router.push("/routes"); // 削除後にリストページなどにリダイレクト
    } catch (error) {
      console.error("Error deleting route:", error);
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete}>
      削除
    </Button>
  );
}
