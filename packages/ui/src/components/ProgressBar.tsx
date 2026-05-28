import * as React from "react";
import { cn } from "../utils/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: "primary" | "success" | "warning" | "danger";
}

export function ProgressBar({ value, color = "primary", className, ...props }: ProgressBarProps) {
  const getColorClass = () => {
    switch (color) {
      case "success":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "danger":
        return "bg-red-500";
      default:
        return "bg-primary";
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 h-2.5 rounded-full overflow-hidden",
        className
      )}
      {...props}
    >
      <div
        className={cn("h-full transition-all duration-300 rounded-full", getColorClass())}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
