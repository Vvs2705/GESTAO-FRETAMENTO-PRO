import * as React from "react";
import { cn } from "../utils/cn";

export interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 min-h-[80px] resize-y transition-all duration-200",
          className
        )}
        {...props}
      />
    );
  }
);
TextareaField.displayName = "TextareaField";
