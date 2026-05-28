import * as React from "react";
import { cn } from "../utils/cn";

export interface LoadingSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
}

export function LoadingSkeleton({
  variant = "rectangular",
  width,
  height,
  className,
  style,
  ...props
}: LoadingSkeletonProps) {
  const getRadiusClass = () => {
    if (variant === "circular") return "rounded-full";
    if (variant === "text") return "rounded h-3 w-full my-1";
    return "rounded-md";
  };

  const inlineStyles: React.CSSProperties = {
    width,
    height,
    ...style,
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-slate-200 dark:bg-slate-800/80",
        getRadiusClass(),
        className
      )}
      style={inlineStyles}
      {...props}
    />
  );
}
