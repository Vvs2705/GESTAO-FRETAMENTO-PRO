import * as React from "react";
import { cn } from "../utils/cn";

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
}

export function FormField({
  label,
  error,
  hint,
  required,
  htmlFor,
  children,
  className,
  ...props
}: FormFieldProps) {
  const errorId = error ? `${htmlFor || "field"}-error` : undefined;
  const hintId = hint ? `${htmlFor || "field"}-hint` : undefined;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)} {...props}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-500 font-bold">*</span>}
        </label>
      )}

      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            id: htmlFor,
            "aria-invalid": !!error,
            "aria-describedby": cn(errorId, hintId) || undefined,
            required,
          });
        }
        return child;
      })}

      {hint && !error && (
        <p id={hintId} className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          {hint}
        </p>
      )}

      {error && (
        <p
          id={errorId}
          aria-live="assertive"
          className="text-[10px] text-red-500 font-semibold animate-pulse"
        >
          {error}
        </p>
      )}
    </div>
  );
}
