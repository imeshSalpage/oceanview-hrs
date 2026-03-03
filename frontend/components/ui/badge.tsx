import * as React from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline";
}

const variantClasses: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
  danger: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
  outline: "border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-200",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
