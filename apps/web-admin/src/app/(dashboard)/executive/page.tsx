"use client";

import * as React from "react";
import { KpiCard, LineChart, BarChart, RankingChart, toast } from "@gestao-fretamento-pro/ui";
import { TrendingUp, Users, DollarSign, ShieldAlert } from "lucide-react";

export default function ExecutiveDashboard() {
  const lineData = [
    { name: "Jan", receita: 4000, custo: 2400 },
    { name: "Fev", receita: 3000, custo: 1398 },
    { name: "Mar", receita: 2000, custo: 9800 },
    { name: "Abr", receita: 2780, custo: 3908 },
    { name: "Mai", receita: 1890, custo: 4800 },
    { name: "Jun", receita: 2390, custo: 3800 },
  ];

  const barData = [
    { name: "Sul", consumo: 1200 },
    { name: "Sudeste", consumo: 2100 },
    { name: "Centro-Oeste", consumo: 800 },
    { name: "Norte", consumo: 400 },
  ];

  const rankingData = [
    { name: "Dell Computadores", value: 95000 },
    { name: "Bosch Tecnologia", value: 87000 },
    { name: "Unicamp Turismo", value: 64000 },
    { name: "Samsung Corp", value: 52000 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Receita Mensal" value="R$ 298.500" trend="+12.4%" trendDirection="up" status="success" icon={<DollarSign className="w-4 h-4" />} />
        <KpiCard label="Custo Operacional" value="R$ 142.100" trend="+4.1%" trendDirection="down" status="warning" icon={<DollarSign className="w-4 h-4" />} />
        <KpiCard label="Clientes Ativos" value={42} trend="+3" trendDirection="up" status="info" icon={<Users className="w-4 h-4" />} />
        <KpiCard label="Risco Operacional" value="Baixo" trend="Estável" status="normal" icon={<ShieldAlert className="w-4 h-4" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Evolução Financeira</h3>
          <LineChart data={lineData} dataKeys={["receita", "custo"]} colors={["#10B981", "#EF4444"]} />
        </div>

        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <h3 className="text-sm font-bold">Faturamento por Cliente (Top 4)</h3>
          <RankingChart data={rankingData} color="#3B82F6" />
        </div>
      </div>
    </div>
  );
}
