import * as React from "react";
import { cn } from "../utils/cn";
import { Plus, Database } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  icon?: React.ReactNode | undefined;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg bg-card/30 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 mb-4 animate-bounce">
        {icon || <Database className="w-6 h-6" />}
      </div>

      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed font-medium">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-lg shadow hover:opacity-90 active:scale-95 transition-all select-none"
        >
          <Plus className="w-3.5 h-3.5" />
          {actionLabel}
        </button>
      )}
    </div>
  );
}
