import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary/15 text-primary",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/15 text-destructive",
        outline: "border border-border text-foreground",
        success: "bg-success/15 text-emerald-400",
        warning: "bg-warning/15 text-amber-400",
        pending: "bg-yellow-500/15 text-yellow-400",
        accepted: "bg-blue-500/15 text-blue-400",
        dispatched: "bg-purple-500/15 text-purple-400",
        in_progress: "bg-orange-500/15 text-orange-400",
        completed: "bg-emerald-500/15 text-emerald-400",
        cancelled: "bg-red-500/15 text-red-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
