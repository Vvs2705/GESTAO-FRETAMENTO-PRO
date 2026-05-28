import * as React from "react";
import { cn } from "../utils/cn";

export interface TabNavItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabNavProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  items: TabNavItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export function TabNav({ items, activeId, onChange, className, ...props }: TabNavProps) {
  return (
    <div
      className={cn(
        "border-b border-slate-200 dark:border-slate-800 w-full flex items-center select-none",
        className
      )}
      {...props}
    >
      <div className="flex gap-6">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "py-3 text-xs font-semibold border-b-2 px-1 relative transition-all duration-200 cursor-pointer outline-none flex items-center gap-1.5",
                isActive
                  ? "border-primary text-primary font-bold scale-[1.01]"
                  : "border-transparent text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 hover:border-slate-200 dark:hover:border-slate-800"
              )}
            >
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span
                  className={cn(
                    "text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-400"
                  )}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
