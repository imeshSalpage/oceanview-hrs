import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-white",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
