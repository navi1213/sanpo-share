"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { deleteReviewById } from "../actions";

export default function DeleteButton({ reviewId }: { reviewId: number }) {
  const router = useRouter();

  const handleDelete = async () => {
    try {
      await deleteReviewById(reviewId);
      router.refresh(); // リダイレクト後にページをリフレッシュ
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
