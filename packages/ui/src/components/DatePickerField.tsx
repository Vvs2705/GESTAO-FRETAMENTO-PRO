import * as React from "react";
import { cn } from "../utils/cn";
import { Calendar } from "lucide-react";

export interface DatePickerFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const DatePickerField = React.forwardRef<HTMLInputElement, DatePickerFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        <input
          type="date"
          ref={ref}
          className={cn(
            "w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-3 pr-8 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary disabled:opacity-50 transition-all duration-200 cursor-pointer",
            className
          )}
          {...props}
        />
        <Calendar className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
      </div>
    );
  }
);
DatePickerField.displayName = "DatePickerField";
