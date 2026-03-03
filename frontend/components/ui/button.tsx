import * as React from "react";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "secondary" | "outline" | "ghost";
export type ButtonSize = "default" | "sm" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100",
  secondary:
    "bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700",
  outline:
    "border border-slate-200 text-slate-900 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800",
  ghost: "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-11 px-6 text-sm",
  sm: "h-9 px-4 text-sm",
  lg: "h-12 px-7 text-base",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
