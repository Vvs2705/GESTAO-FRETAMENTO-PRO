import * as React from "react";
import { cn } from "../utils/cn";

export interface TimelineItem {
  id: string | number;
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  status?: "normal" | "active" | "error" | "success";
}

export interface TimelineProps extends React.HTMLAttributes<HTMLDivElement> {
  items: TimelineItem[];
}

export function Timeline({ items, className, ...props }: TimelineProps) {
  const getDotStyle = (status: TimelineItem["status"]) => {
    switch (status) {
      case "active":
        return "bg-blue-500 border-blue-200 dark:border-blue-900 ring-4 ring-blue-500/20";
      case "success":
        return "bg-green-500 border-green-200 dark:border-green-900 ring-4 ring-green-500/20";
      case "error":
        return "bg-red-500 border-red-200 dark:border-red-900 ring-4 ring-red-500/20";
      default:
        return "bg-slate-300 dark:bg-slate-700 border-slate-100 dark:border-slate-800";
    }
  };

  return (
    <div
      className={cn(
        "relative pl-6 space-y-6 before:absolute before:inset-y-1 before:left-2 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800",
        className
      )}
      {...props}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="relative flex flex-col md:flex-row md:items-baseline gap-2 group"
        >
          {/* Dot */}
          <div
            className={cn(
              "absolute -left-[22px] flex items-center justify-center w-5 h-5 rounded-full border-2 text-[10px] text-white transition-all duration-300",
              getDotStyle(item.status)
            )}
          >
            {item.icon}
          </div>

          {/* Content */}
          <div className="flex-grow space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {item.title}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-mono">
                {item.timestamp}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal font-medium">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
