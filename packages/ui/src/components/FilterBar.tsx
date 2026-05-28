import * as React from "react";
import { cn } from "../utils/cn";
import { Calendar, Filter } from "lucide-react";

export interface FilterBarProps {
  onPeriodChange?: (period: string) => void;
  onTenantChange?: (tenantId: string) => void;
  onFilialChange?: (filialId: string) => void;
  tenants?: { id: string; name: string }[];
  filiais?: { id: string; name: string }[];
  selectedPeriod?: string;
  selectedTenant?: string;
  selectedFilial?: string;
  className?: string;
}

export function FilterBar({
  onPeriodChange,
  onTenantChange,
  onFilialChange,
  tenants = [],
  filiais = [],
  selectedPeriod = "month",
  selectedTenant = "",
  selectedFilial = "",
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col lg:flex-row items-stretch lg:items-center gap-3 p-4 bg-card border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm w-full backdrop-blur-md",
        className
      )}
    >
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Filter className="w-4.5 h-4.5" />
        <span className="text-xs font-semibold uppercase tracking-wider">Filtros</span>
      </div>

      <div className="h-[20px] w-[1px] bg-slate-200 dark:bg-slate-800 hidden lg:block" />

      {/* Period Selection */}
      {onPeriodChange && (
        <div className="flex flex-col gap-1 flex-grow">
          <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Período
          </label>
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => onPeriodChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
            >
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="year">Este Ano</option>
              <option value="custom">Personalizado</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      )}

      {/* Tenant Selection */}
      {onTenantChange && (
        <div className="flex flex-col gap-1 flex-grow">
          <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Empresa (Tenant)
          </label>
          <select
            value={selectedTenant}
            onChange={(e) => onTenantChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">Todas as empresas</option>
            {tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filial Selection */}
      {onFilialChange && (
        <div className="flex flex-col gap-1 flex-grow">
          <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Filial
          </label>
          <select
            value={selectedFilial}
            onChange={(e) => onFilialChange(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="">Todas as filiais</option>
            {filiais.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
