import * as React from "react";
import { cn } from "../utils/cn";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);
TextInput.displayName = "TextInput";
