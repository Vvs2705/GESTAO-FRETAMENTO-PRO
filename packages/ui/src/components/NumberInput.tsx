import * as React from "react";
import { cn } from "../utils/cn";

export interface NumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefixLabel?: string;
  suffixLabel?: string;
}

export const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, prefixLabel, suffixLabel, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {prefixLabel && (
          <span className="flex-shrink-0 pl-3 pr-2 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-900 border-y border-l border-slate-200 dark:border-slate-800 py-2 rounded-l-lg select-none">
            {prefixLabel}
          </span>
        )}
        <input
          type="number"
          ref={ref}
          className={cn(
            "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 transition-all duration-200",
            prefixLabel ? "rounded-r-lg border-l-0" : "rounded-l-lg",
            suffixLabel ? "rounded-l-lg border-r-0" : "rounded-r-lg",
            className
          )}
          {...props}
        />
        {suffixLabel && (
          <span className="flex-shrink-0 px-3 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100/50 dark:bg-slate-900 border-y border-r border-slate-200 dark:border-slate-800 py-2 rounded-r-lg select-none">
            {suffixLabel}
          </span>
        )}
      </div>
    );
  }
);
NumberInput.displayName = "NumberInput";
