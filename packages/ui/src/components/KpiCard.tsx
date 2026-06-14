import * as React from "react";
import { cn } from "../utils/cn";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: string | number;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  description?: string;
  loading?: boolean;
  status?: "normal" | "critical" | "warning" | "success" | "info";
  icon?: React.ReactNode;
}

export function KpiCard({
  label,
  value,
  trend,
  trendDirection = "neutral",
  description,
  loading = false,
  status = "normal",
  icon,
  className,
  ...props
}: KpiCardProps) {
  const getStatusBorder = () => {
    switch (status) {
      case "critical":
        return "border-l-4 border-l-red-500";
      case "warning":
        return "border-l-4 border-l-amber-500";
      case "success":
        return "border-l-4 border-l-green-500";
      case "info":
        return "border-l-4 border-l-blue-500";
      default:
        return "border-l-4 border-l-slate-200 dark:border-l-slate-700";
    }
  };

  const getTrendIcon = () => {
    if (trendDirection === "up") return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trendDirection === "down") return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const getTrendColor = () => {
    if (trendDirection === "up") return "text-green-500";
    if (trendDirection === "down") return "text-red-500";
    return "text-slate-400";
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-card text-card-foreground rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01] backdrop-blur-md",
        getStatusBorder(),
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      ) : (
        <div className="flex flex-col justify-between h-full gap-2">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
            {icon && (
              <div className="text-slate-400 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                {icon}
              </div>
            )}
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
              {value}
            </span>
            {trend && (
              <span
                className={cn(
                  "flex items-center gap-0.5 text-xs font-semibold",
                  getTrendColor()
                )}
              >
                {getTrendIcon()}
                {trend}
              </span>
            )}
          </div>

          {description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium">
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
