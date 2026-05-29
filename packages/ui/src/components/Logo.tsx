import * as React from "react";
import { cn } from "../utils/cn";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "vertical" | "symbol";
}

export function Logo({ size = "md", variant = "horizontal", className, ...props }: LogoProps) {
  const sizeMap = {
    sm: "w-5 h-5",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const symbol = (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-primary", sizeMap[size])}
    >
      {/* Connected points routing */}
      <path d="M4 18L10 11L14 15L20 6" className="stroke-primary" strokeWidth="2.5" />
      {/* Markers / Nodes */}
      <circle cx="4" cy="18" r="2" className="fill-background stroke-primary" strokeWidth="2" />
      <circle cx="10" cy="11" r="2" className="fill-background stroke-primary" strokeWidth="2" />
      <circle cx="14" cy="15" r="2" className="fill-background stroke-primary" strokeWidth="2" />
      <circle cx="20" cy="6" r="2" className="fill-primary" />
    </svg>
  );

  if (variant === "symbol") {
    return (
      <div className={cn("flex items-center justify-center", className)} {...props}>
        {symbol}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2 select-none", className)} {...props}>
      <div className="flex-shrink-0 bg-primary/10 p-1.5 rounded-lg border border-primary/20">
        {symbol}
      </div>
      {variant === "horizontal" && (
        <div className="flex flex-col text-left leading-none">
          <span className="font-extrabold text-xs tracking-tight text-slate-800 dark:text-slate-100 uppercase">
            Fretamento <span className="text-primary">Pro</span>
          </span>
          <span className="text-[7px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
            Command Mobility
          </span>
        </div>
      )}
    </div>
  );
}
