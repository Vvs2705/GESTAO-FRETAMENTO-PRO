import * as React from "react";
import { cn } from "../utils/cn";
import { AlertCircle, RefreshCw } from "lucide-react";

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description: string;
  correlationId?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Ocorreu um erro",
  description,
  correlationId,
  onRetry,
  className,
  ...props
}: ErrorStateProps) {
  const [retrying, setRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 border border-red-200 dark:border-red-900/50 rounded-lg bg-red-50/20 dark:bg-red-950/5 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 text-red-500 mb-4 animate-pulse">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-sm font-semibold text-red-950 dark:text-red-300 mb-1">
        {title}
      </h3>
      <p className="text-xs text-red-700/85 dark:text-red-400/85 max-w-sm mb-4 leading-relaxed font-medium">
        {description}
      </p>

      {correlationId && (
        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 px-2 py-0.5 rounded-md mb-6 select-all">
          ID: {correlationId}
        </span>
      )}

      {onRetry && (
        <button
          onClick={handleRetry}
          disabled={retrying}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-red-600 text-white rounded-lg shadow hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all select-none"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", retrying && "animate-spin")} />
          {retrying ? "Tentando novamente..." : "Tentar novamente"}
        </button>
      )}
    </div>
  );
}
