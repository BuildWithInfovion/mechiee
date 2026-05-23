"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onRate?: (rating: number) => void;
}

export function RatingStars({
  rating,
  max = 5,
  size = "md",
  interactive = false,
  onRate,
}: RatingStarsProps) {
  const sizeClass = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-6 h-6" }[size];

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(i + 1)}
            className={cn(
              "transition-colors",
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default pointer-events-none"
            )}
          >
            <Star
              className={cn(
                sizeClass,
                filled || partial ? "text-amber-400 fill-amber-400" : "text-muted-foreground"
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
