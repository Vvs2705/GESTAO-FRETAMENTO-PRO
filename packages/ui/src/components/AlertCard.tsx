import * as React from "react";
import { cn } from "../utils/cn";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

export type SeverityType = "critical" | "warning" | "success" | "info";

export interface AlertCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  severity?: SeverityType;
  onClose?: () => void;
  actionLabel?: string;
  onAction?: () => void;
}

export function AlertCard({
  title,
  description,
  severity = "info",
  onClose,
  actionLabel,
  onAction,
  className,
  ...props
}: AlertCardProps) {
  const getStyles = () => {
    switch (severity) {
      case "critical":
        return {
          card: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-200",
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          action: "text-red-700 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-950/40",
        };
      case "warning":
        return {
          card: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200",
          icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
          action: "text-amber-700 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-950/40",
        };
      case "success":
        return {
          card: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50 text-green-900 dark:text-green-200",
          icon: <CheckCircle className="w-5 h-5 text-green-500" />,
          action: "text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950/40",
        };
      default:
        return {
          card: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-blue-900 dark:text-blue-200",
          icon: <Info className="w-5 h-5 text-blue-500" />,
          action: "text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-950/40",
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={cn(
        "flex gap-3 p-4 rounded-lg border shadow-sm transition-all duration-300 relative overflow-hidden",
        styles.card,
        className
      )}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0 mt-0.5">{styles.icon}</div>
      <div className="flex-grow space-y-1">
        <h4 className="font-semibold text-sm leading-none">{title}</h4>
        <p className="text-xs opacity-90 leading-relaxed font-medium">{description}</p>
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className={cn(
              "mt-2 px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-200 select-none border border-current/25",
              styles.action
            )}
          >
            {actionLabel}
          </button>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 self-start p-1 rounded-full opacity-65 hover:opacity-100 transition-opacity hover:bg-black/5 dark:hover:bg-white/5"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
