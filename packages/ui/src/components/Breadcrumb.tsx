import * as React from "react";
import { cn } from "../utils/cn";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
}

export function Breadcrumb({ items, onNavigate, className, ...props }: BreadcrumbProps) {
  return (
    <nav
      className={cn("flex items-center text-xs font-semibold text-slate-500 select-none", className)}
      {...props}
    >
      <ol className="flex items-center gap-1.5">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              {isLast || !item.path ? (
                <span className="text-slate-800 dark:text-slate-200 truncate max-w-[120px] sm:max-w-xs">
                  {item.label}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate(item.path!)}
                  className="hover:text-primary transition-colors cursor-pointer outline-none focus:text-primary text-slate-400"
                >
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
