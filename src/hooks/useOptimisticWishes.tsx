import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import { wishLikeService } from "../api/wishlike/endPoints";
import type { Wish } from "../types/wishesh";

interface OptimisticWish extends Wish {
  isOptimistic?: boolean;
  originalId?: string; // For tracking optimistic wishes
}

export const useOptimisticWishes = (currentUserId: string) => {
  const [wishes, setWishes] = useState<OptimisticWish[]>([]);

  // Optimistically toggle like
  const toggleLikeOptimistic = useCallback(
    async (wishId: string) => {
      if (!currentUserId) return;

      // Don't allow likes on optimistic wishes that are still saving
      const currentWish = wishes.find((w) => w.id === wishId);
      if (!currentWish || currentWish.isOptimistic) return;

      const originalIsLiked = currentWish.isLiked;
      const originalLikeCount = currentWish.likeCount;

      // Optimistic update
      setWishes((prev) =>
        prev.map((wish) =>
          wish.id === wishId
            ? {
                ...wish,
                isLiked: !wish.isLiked,
                likeCount: wish.isLiked
                  ? wish.likeCount - 1
                  : wish.likeCount + 1,
              }
            : wish
        )
      );

      try {
        await wishLikeService.toggleLike(wishId, currentUserId);
        toast.success(originalIsLiked ? "Wish unliked!" : "Wish liked!");
      } catch (error) {
        // Revert on error
        setWishes((prev) =>
          prev.map((wish) =>
            wish.id === wishId
              ? {
                  ...wish,
                  isLiked: originalIsLiked,
                  likeCount: originalLikeCount,
                }
              : wish
          )
        );
        toast.error("Failed to update like");
        console.error(error);
      }
    },
    [currentUserId, wishes]
  );

  // Create wish with optimistic update

  return {
    wishes,
    setWishes,
    toggleLikeOptimistic,
  };
};
