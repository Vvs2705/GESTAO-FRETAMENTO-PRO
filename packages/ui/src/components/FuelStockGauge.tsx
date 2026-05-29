import * as React from "react";
import { cn } from "../utils/cn";
import { AlertTriangle } from "lucide-react";

export interface FuelStockGaugeProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  capacity: number;
  currentLevel: number;
  fuelType?: string;
  thresholdPercent?: number;
}

export function FuelStockGauge({
  name,
  capacity,
  currentLevel,
  fuelType = "Diesel S10",
  thresholdPercent = 20,
  className,
  ...props
}: FuelStockGaugeProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((currentLevel / capacity) * 100)));
  const isLow = percentage <= thresholdPercent;

  const getLiquidColor = () => {
    if (isLow) return "bg-red-500 shadow-red-500/20";
    if (percentage <= thresholdPercent * 1.5) return "bg-amber-500 shadow-amber-500/20";
    return "bg-cyan-500 shadow-cyan-500/20";
  };

  return (
    <div
      className={cn(
        "bg-card text-card-foreground border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition-all duration-300",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{name}</h4>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">{fuelType}</p>
        </div>
        {isLow && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5" /> Nível Crítico
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Visual Cylinder Gauge Container */}
        <div className="relative w-12 h-24 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden flex flex-col justify-end">
          {/* Liquid level */}
          <div
            className={cn("w-full transition-all duration-700 ease-out shadow-inner", getLiquidColor())}
            style={{ height: `${percentage}%` }}
          />
          {/* Overlay grid lines for dashboard look */}
          <div className="absolute inset-0 flex flex-col justify-between p-1 opacity-20 pointer-events-none text-[8px] font-mono select-none">
            <div className="border-t border-slate-400 w-1/3">100%</div>
            <div className="border-t border-slate-400 w-1/3">75%</div>
            <div className="border-t border-slate-400 w-1/3">50%</div>
            <div className="border-t border-slate-400 w-1/3">25%</div>
            <div className="w-full" />
          </div>
        </div>

        {/* Level Stats */}
        <div className="flex-grow space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black tracking-tight text-foreground">{currentLevel.toLocaleString("pt-BR")}</span>
            <span className="text-xs font-bold text-slate-500">L</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase">
              <span>Capacidade</span>
              <span className="text-foreground">{capacity.toLocaleString("pt-BR")} L</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-1.5 overflow-hidden">
              <div
                className={cn("h-full transition-all duration-700 ease-out", isLow ? "bg-red-500" : "bg-primary")}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold">
              <span className={cn(isLow ? "text-red-500" : "text-slate-400")}>{percentage}% útil</span>
              <span className="text-slate-500 font-mono text-[9px]">Restam {(capacity - currentLevel).toLocaleString("pt-BR")} L</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
