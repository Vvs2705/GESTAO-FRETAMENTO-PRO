"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { KpiCard, LineChart, BarChart, RankingChart, Timeline, ErrorState } from "@gestao-fretamento-pro/ui";
import {
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Map,
  AlertTriangle,
  FileWarning,
  Truck,
} from "lucide-react";
import { request } from "../../../lib/api";

interface ExecutiveDashboard {
  tripsToday: number;
  tripsCompleted: number;
  tripsDelayed: number;
  openOccurrences: number;
  criticalOccurrences: number;
  availableVehicles: number;
  totalVehicles: number;
  fleetUtilizationPercent: number;
  activeDrivers: number;
  fuelCostThisMonth: number;
  anomaliesThisMonth: number;
  documentsExpiringSoon: number;
  generatedAt: string;
}

interface FuelCostByPeriodItem {
  period: string;
  totalCost: number;
  totalLiters: number;
}
interface FuelCostByVehicleItem {
  vehicleId: string;
  vehiclePlate: string;
  totalCost: number;
  totalLiters: number;
}
interface FuelAnalytics {
  costByPeriod?: FuelCostByPeriodItem[];
  costByVehicle?: FuelCostByVehicleItem[];
}

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function periodLabel(period: string): string {
  // period = 'YYYY-MM'
  const parts = period.split("-");
  const month = Number(parts[1]);
  if (month >= 1 && month <= 12) return MONTH_LABELS[month - 1] ?? period;
  return period;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export default function ExecutiveDashboard() {
  const exec = useQuery<ExecutiveDashboard>({
    queryKey: ["analytics", "dashboards", "executive"],
    queryFn: () => request("/dashboards/executive") as Promise<ExecutiveDashboard>,
  });

  const fuel = useQuery<FuelAnalytics>({
    queryKey: ["analytics", "fuel", "executive"],
    queryFn: () => request("/dashboards/fuel") as Promise<FuelAnalytics>,
  });

  const d = exec.data ?? ({} as Partial<ExecutiveDashboard>);
  const f = fuel.data ?? ({} as Partial<FuelAnalytics>);

  // Evolução de custo de combustível por período (custo real). Receita não
  // é exposta pela API, então o gráfico mostra apenas o custo consolidado.
  const lineData = (f.costByPeriod ?? []).map((p) => ({
    name: periodLabel(p.period),
    custo: Math.round(p.totalCost),
  }));

  // Consumo (litros) por veículo — top 5 do período.
  const barData = (f.costByVehicle ?? [])
    .slice(0, 5)
    .map((v) => ({ name: v.vehiclePlate, consumo: Math.round(v.totalLiters) }));

  // Ranking de gasto com combustível por veículo (top 4).
  const rankingData = (f.costByVehicle ?? [])
    .slice(0, 4)
    .map((v) => ({ name: v.vehiclePlate, value: Math.round(v.totalCost) }));

  // Alertas operacionais derivados dos KPIs reais.
  const recentAlerts: Array<{
    id: string;
    title: string;
    description: string;
    timestamp: string;
    status: "normal" | "active" | "error" | "success";
    icon: React.ReactNode;
  }> = [];
  if ((d.criticalOccurrences ?? 0) > 0) {
    recentAlerts.push({
      id: "occ-crit",
      title: "Ocorrências Críticas Ativas",
      description: `${d.criticalOccurrences} ocorrência(s) crítica(s) sem resolução.`,
      timestamp: "Agora",
      status: "error",
      icon: <ShieldAlert className="w-3.5 h-3.5" />,
    });
  }
  if ((d.anomaliesThisMonth ?? 0) > 0) {
    recentAlerts.push({
      id: "fuel-anomaly",
      title: "Anomalias de Abastecimento",
      description: `${d.anomaliesThisMonth} abastecimento(s) com divergência neste mês.`,
      timestamp: "Este mês",
      status: "error",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    });
  }
  if ((d.documentsExpiringSoon ?? 0) > 0) {
    recentAlerts.push({
      id: "docs-exp",
      title: "Documentos Vencendo",
      description: `${d.documentsExpiringSoon} documento(s) expiram nos próximos 30 dias.`,
      timestamp: "Próximos 30 dias",
      status: "active",
      icon: <FileWarning className="w-3.5 h-3.5" />,
    });
  }
  if ((d.tripsDelayed ?? 0) > 0) {
    recentAlerts.push({
      id: "trips-delayed",
      title: "Viagens Atrasadas",
      description: `${d.tripsDelayed} viagem(ns) com atraso na operação de hoje.`,
      timestamp: "Hoje",
      status: "active",
      icon: <Truck className="w-3.5 h-3.5" />,
    });
  }

  const fleetUnavailable = Math.max(
    0,
    (d.totalVehicles ?? 0) - (d.availableVehicles ?? 0),
  );

  if (exec.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar o painel executivo."
        onRetry={() => exec.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview header stats in premium 4-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Custo Combustível (Mês)"
          value={brl.format(d.fuelCostThisMonth ?? 0)}
          status="info"
          icon={<DollarSign className="w-4 h-4 text-info" />}
          description="Faturamento de abastecimento consolidado"
        />
        <KpiCard
          label="Veículos Disponíveis"
          value={`${d.availableVehicles ?? 0} / ${d.totalVehicles ?? 0}`}
          status="success"
          icon={<Truck className="w-4 h-4 text-success" />}
          description="Frota pronta para operação"
        />
        <KpiCard
          label="Utilização da Frota"
          value={`${d.fleetUtilizationPercent ?? 0}%`}
          status="info"
          icon={<TrendingUp className="w-4 h-4 text-info" />}
          description="Percentual de veículos em uso"
        />
        <KpiCard
          label="Risco de Operação"
          value={`${d.criticalOccurrences ?? 0} Críticos`}
          trend={(d.criticalOccurrences ?? 0) > 0 ? "Alerta" : "Estável"}
          trendDirection="neutral"
          status={(d.criticalOccurrences ?? 0) > 0 ? "critical" : "success"}
          icon={<ShieldAlert className="w-4 h-4 text-danger" />}
          description="Ocorrências ativas sem resolução"
        />
      </div>

      {/* Second grid: Map Mockup and operational status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stylized Operational Map Card */}
        <div className="lg:col-span-2 bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
                <Map className="w-4 h-4 text-primary" /> Rota & Tráfego Ativo (SP-Bandeirantes)
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Monitoramento em Tempo Real</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <span className="w-2.5 h-2.5 bg-success rounded-full animate-ping" />
              <span>3 filiais ativas</span>
            </div>
          </div>

          {/* High-fidelity Vector Map representation */}
          <div className="bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-slate-800 rounded-lg p-4 h-64 relative flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 600 240" className="w-full h-full text-slate-300 dark:text-slate-700">
              {/* Grid Background */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" className="opacity-10" />
                </pattern>
              </defs>
              <rect width="600" height="240" fill="url(#grid)" />

              {/* Rota Lines */}
              <path d="M50,180 Q150,110 300,120 T550,50" fill="none" stroke="#1D4ED8" strokeWidth="3" strokeDasharray="5,5" className="opacity-60" />
              <path d="M100,200 L250,130 L400,100 L500,160" fill="none" stroke="#06B6D4" strokeWidth="2" className="opacity-40" />

              {/* Connected Cities/Nodes */}
              <g className="cursor-pointer group">
                <circle cx="500" cy="60" r="8" className="fill-primary/20 stroke-primary" strokeWidth="2" />
                <circle cx="500" cy="60" r="3" className="fill-primary" />
                <text x="515" y="65" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans">Campinas</text>
              </g>

              <g className="cursor-pointer group">
                <circle cx="380" cy="110" r="8" className="fill-success/20 stroke-success" strokeWidth="2" />
                <circle cx="380" cy="110" r="3" className="fill-success" />
                <text x="395" y="115" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans">Louveira</text>
              </g>

              <g className="cursor-pointer group">
                <circle cx="280" cy="130" r="8" className="fill-success/20 stroke-success" strokeWidth="2" />
                <circle cx="280" cy="130" r="3" className="fill-success" />
                <text x="240" y="150" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans">Jundiaí</text>
              </g>

              <g className="cursor-pointer group">
                <circle cx="150" cy="170" r="10" className="fill-danger/20 stroke-danger animate-pulse" strokeWidth="2" />
                <circle cx="150" cy="170" r="4" className="fill-danger" />
                <text x="165" y="175" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans">Cajamar</text>
              </g>
            </svg>

            {/* Map floating controls overlay */}
            <div className="absolute bottom-3 left-3 bg-card border border-slate-200 dark:border-slate-800 rounded-lg p-2 flex gap-3 text-[9px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-success rounded-full" /> Operação normal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-danger rounded-full" /> Alerta de tráfego</span>
            </div>
          </div>
        </div>

        {/* Operational Status Metrics (fleet counts & alerts) */}
        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Truck className="w-4 h-4 text-primary" /> Status da Frota
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">{d.totalVehicles ?? 0} veículos cadastrados</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-[#0B1220]/50 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Disponíveis</span>
              <span className="text-xl font-extrabold text-success">{d.availableVehicles ?? 0}</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B1220]/50 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Indisponíveis</span>
              <span className="text-xl font-extrabold text-amber-500">{fleetUnavailable}</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B1220]/50 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Motoristas</span>
              <span className="text-xl font-extrabold text-primary">{d.activeDrivers ?? 0}</span>
            </div>
          </div>

          {/* Quick links summary */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400 uppercase">Documentos Vencendo</span>
              <span className="text-amber-500 flex items-center gap-1"><FileWarning className="w-3 h-3" /> {d.documentsExpiringSoon ?? 0} alertas</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400 uppercase">Ocorrências Abertas</span>
              <span className="text-danger flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {d.openOccurrences ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Evolução de Custo de Combustível</h3>
          <LineChart data={lineData} dataKeys={["custo"]} colors={["#EF4444"]} />
        </div>

        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <h3 className="text-sm font-bold">Consumo por Veículo (Top 5 em Litros)</h3>
          <BarChart data={barData} dataKeys={["consumo"]} colors={["#06B6D4"]} />
        </div>
      </div>

      {/* Fourth Row: Ranking & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top spenders ranking panel */}
        <div className="lg:col-span-2 bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <DollarSign className="w-4 h-4 text-primary" /> Maiores Gastos com Combustível
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Top veículos por custo no período</p>
          </div>
          {rankingData.length > 0 ? (
            <RankingChart data={rankingData} />
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">Sem dados de abastecimento no período.</p>
          )}
        </div>

        {/* Recent Alerts Timeline panel */}
        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <ShieldAlert className="w-4 h-4 text-danger" /> Últimos Alertas Operacionais
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Ocorrências críticas</p>
          </div>

          {recentAlerts.length > 0 ? (
            <Timeline items={recentAlerts} />
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">Nenhum alerta operacional ativo.</p>
          )}
        </div>
      </div>
    </div>
  );
}
