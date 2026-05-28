import * as React from "react";
import { cn } from "../utils/cn";

export type StatusType =
  | "trip-draft"
  | "trip-confirmed"
  | "trip-in-progress"
  | "trip-delayed"
  | "trip-completed"
  | "trip-canceled"
  | "occurrence-open"
  | "occurrence-critical"
  | "occurrence-resolved"
  | "vehicle-available"
  | "vehicle-in-maintenance"
  | "vehicle-unavailable"
  | "document-valid"
  | "document-expiring"
  | "document-expired";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  label?: string;
  showDot?: boolean;
}

export function StatusBadge({
  status,
  label,
  showDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const getColors = (status: StatusType) => {
    switch (status) {
      case "trip-draft":
        return {
          bg: "rgba(148, 163, 184, 0.15)",
          text: "#94A3B8",
          border: "rgba(148, 163, 184, 0.3)",
          dotBg: "#94A3B8",
        };
      case "trip-confirmed":
        return {
          bg: "rgba(59, 130, 246, 0.15)",
          text: "#3B82F6",
          border: "rgba(59, 130, 246, 0.3)",
          dotBg: "#3B82F6",
        };
      case "trip-in-progress":
        return {
          bg: "rgba(139, 92, 246, 0.15)",
          text: "#8B5CF6",
          border: "rgba(139, 92, 246, 0.3)",
          dotBg: "#8B5CF6",
        };
      case "trip-delayed":
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          text: "#F59E0B",
          border: "rgba(245, 158, 11, 0.3)",
          dotBg: "#F59E0B",
        };
      case "trip-completed":
        return {
          bg: "rgba(34, 197, 94, 0.15)",
          text: "#22C55E",
          border: "rgba(34, 197, 94, 0.3)",
          dotBg: "#22C55E",
        };
      case "trip-canceled":
        return {
          bg: "rgba(107, 114, 128, 0.15)",
          text: "#6B7280",
          border: "rgba(107, 114, 128, 0.3)",
          dotBg: "#6B7280",
        };

      case "occurrence-open":
        return {
          bg: "rgba(59, 130, 246, 0.15)",
          text: "#3B82F6",
          border: "rgba(59, 130, 246, 0.3)",
          dotBg: "#3B82F6",
        };
      case "occurrence-critical":
        return {
          bg: "rgba(239, 68, 68, 0.15)",
          text: "#EF4444",
          border: "rgba(239, 68, 68, 0.3)",
          dotBg: "#EF4444",
        };
      case "occurrence-resolved":
        return {
          bg: "rgba(34, 197, 94, 0.15)",
          text: "#22C55E",
          border: "rgba(34, 197, 94, 0.3)",
          dotBg: "#22C55E",
        };

      case "vehicle-available":
        return {
          bg: "rgba(34, 197, 94, 0.15)",
          text: "#22C55E",
          border: "rgba(34, 197, 94, 0.3)",
          dotBg: "#22C55E",
        };
      case "vehicle-in-maintenance":
        return {
          bg: "rgba(249, 115, 22, 0.15)",
          text: "#F97316",
          border: "rgba(249, 115, 22, 0.3)",
          dotBg: "#F97316",
        };
      case "vehicle-unavailable":
        return {
          bg: "rgba(239, 68, 68, 0.15)",
          text: "#EF4444",
          border: "rgba(239, 68, 68, 0.3)",
          dotBg: "#EF4444",
        };

      case "document-valid":
        return {
          bg: "rgba(34, 197, 94, 0.15)",
          text: "#22C55E",
          border: "rgba(34, 197, 94, 0.3)",
          dotBg: "#22C55E",
        };
      case "document-expiring":
        return {
          bg: "rgba(245, 158, 11, 0.15)",
          text: "#F59E0B",
          border: "rgba(245, 158, 11, 0.3)",
          dotBg: "#F59E0B",
        };
      case "document-expired":
        return {
          bg: "rgba(239, 68, 68, 0.15)",
          text: "#EF4444",
          border: "rgba(239, 68, 68, 0.3)",
          dotBg: "#EF4444",
        };
    }
  };

  const colors = getColors(status);
  const displayLabel = label || status.split("-").slice(1).join(" ").toUpperCase();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border backdrop-blur-sm transition-all duration-300 hover:brightness-110 select-none",
        className
      )}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
      {...props}
    >
      {showDot && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ backgroundColor: colors.dotBg }}
        />
      )}
      <span>{displayLabel}</span>
    </span>
  );
}
