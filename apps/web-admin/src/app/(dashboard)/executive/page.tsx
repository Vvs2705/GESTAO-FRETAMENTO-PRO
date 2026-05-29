"use client";

import * as React from "react";
import { KpiCard, LineChart, BarChart, RankingChart, Timeline, toast, FuelStockGauge } from "@gestao-fretamento-pro/ui";
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  ShieldAlert, 
  Map, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileWarning, 
  Truck, 
  AlertCircle
} from "lucide-react";

export default function ExecutiveDashboard() {
  const lineData = [
    { name: "Jan", receita: 280000, custo: 135000 },
    { name: "Fev", receita: 295000, custo: 142000 },
    { name: "Mar", receita: 310000, custo: 155000 },
    { name: "Abr", receita: 305000, custo: 149000 },
    { name: "Mai", receita: 325000, custo: 162000 },
    { name: "Jun", receita: 340000, custo: 168000 },
  ];

  const barData = [
    { name: "Campinas", consumo: 3400 },
    { name: "Jundiaí", consumo: 2800 },
    { name: "Louveira", consumo: 2100 },
    { name: "Cajamar", consumo: 1900 },
    { name: "Sorocaba", consumo: 1600 },
  ];

  const rankingData = [
    { name: "Dell Computadores (Louveira)", value: 98000 },
    { name: "Bosch Tecnologia (Campinas)", value: 89000 },
    { name: "Unicamp Fretamentos (Campinas)", value: 72000 },
    { name: "Samsung Corp (Cajamar)", value: 65000 },
  ];

  const recentAlerts = [
    {
      id: "1",
      title: "Desvio de Rota Crítico",
      description: "Veículo DPL-4839 (Fretamento Dell) saiu da rota programada na Rod. dos Bandeirantes.",
      timestamp: "12 min atrás",
      status: "error" as const,
      icon: <AlertCircle className="w-3.5 h-3.5" />
    },
    {
      id: "2",
      title: "Alerta de Abastecimento",
      description: "Odômetro suspeito registrado no abastecimento do veículo ABC-1234 em Louveira.",
      timestamp: "1 hora atrás",
      status: "error" as const,
      icon: <AlertTriangle className="w-3.5 h-3.5" />
    },
    {
      id: "3",
      title: "Substituição Homologada",
      description: "Motorista Marcelo Silva assumiu a viagem #4018 devido a atraso médico.",
      timestamp: "2 horas atrás",
      status: "success" as const,
      icon: <CheckCircle2 className="w-3.5 h-3.5" />
    }
  ];

  const pendingDecisions = [
    {
      id: "dec_1",
      title: "Aprovar Divergência de Combustível",
      description: "Tanque Diesel S10 Louveira registrou +120 L além do cupom fiscal da carreta.",
      impact: "Médio Risco",
      date: "Hoje às 15:30"
    },
    {
      id: "dec_2",
      title: "Documentos Expirados",
      description: "3 licenças ANTT de ônibus turismo estão expirando em menos de 48 horas.",
      impact: "Alto Risco",
      date: "Ontem às 18:00"
    }
  ];

  const handleAction = (title: string) => {
    toast.success("Ação Registrada", `Decisão "${title}" enviada para auditoria.`);
  };

  return (
    <div className="space-y-6">
      {/* Overview header stats in premium 4-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          label="Receita Estimada (Mês)" 
          value="R$ 340.000" 
          trend="+12.4% vs mar" 
          trendDirection="up" 
          status="success" 
          icon={<DollarSign className="w-4 h-4 text-success" />} 
          description="Faturamento consolidado das 3 filiais"
        />
        <KpiCard 
          label="Custo Combustível" 
          value="R$ 118.420" 
          trend="-2.1% vs média" 
          trendDirection="down" 
          status="success" 
          icon={<TrendingUp className="w-4 h-4 text-success" />} 
          description="Melhor rendimento médio das rotas"
        />
        <KpiCard 
          label="Margem Operacional" 
          value="50.6%" 
          trend="+3.1%" 
          trendDirection="up" 
          status="info" 
          icon={<TrendingUp className="w-4 h-4 text-info" />} 
          description="Meta de faturamento superada em 6%"
        />
        <KpiCard 
          label="Risco de Operação" 
          value="2 Críticos" 
          trend="Alerta" 
          trendDirection="neutral" 
          status="critical" 
          icon={<ShieldAlert className="w-4 h-4 text-danger" />} 
          description="Ocorrências ativas sem resolução"
        />
      </div>

      {/* Second grid: Map Mockup and Recharts Graphs */}
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
              {/* Campinas */}
              <g className="cursor-pointer group">
                <circle cx="500" cy="60" r="8" className="fill-primary/20 stroke-primary" strokeWidth="2" />
                <circle cx="500" cy="60" r="3" className="fill-primary" />
                <text x="515" y="65" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans">Campinas</text>
              </g>

              {/* Louveira */}
              <g className="cursor-pointer group">
                <circle cx="380" cy="110" r="8" className="fill-success/20 stroke-success" strokeWidth="2" />
                <circle cx="380" cy="110" r="3" className="fill-success" />
                <text x="395" y="115" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans">Louveira</text>
              </g>

              {/* Jundiaí */}
              <g className="cursor-pointer group">
                <circle cx="280" cy="130" r="8" className="fill-success/20 stroke-success" strokeWidth="2" />
                <circle cx="280" cy="130" r="3" className="fill-success" />
                <text x="240" y="150" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans">Jundiaí</text>
              </g>

              {/* Cajamar */}
              <g className="cursor-pointer group">
                <circle cx="150" cy="170" r="10" className="fill-danger/20 stroke-danger animate-pulse" strokeWidth="2" />
                <circle cx="150" cy="170" r="4" className="fill-danger" />
                <text x="165" y="175" className="text-[10px] font-bold fill-slate-800 dark:fill-slate-100 font-sans">Cajamar (1 Alerta)</text>
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
            <p className="text-[10px] text-slate-400 font-semibold uppercase">36 veículos ativos</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-50 dark:bg-[#0B1220]/50 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Disponíveis</span>
              <span className="text-xl font-extrabold text-success">28</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B1220]/50 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Manutenção</span>
              <span className="text-xl font-extrabold text-amber-500">6</span>
            </div>
            <div className="bg-slate-50 dark:bg-[#0B1220]/50 p-3 rounded-lg text-center border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 block uppercase">Inativos</span>
              <span className="text-xl font-extrabold text-danger">2</span>
            </div>
          </div>

          {/* Quick links summary */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400 uppercase">Documentos Vencendo</span>
              <span className="text-amber-500 flex items-center gap-1"><FileWarning className="w-3 h-3" /> 4 alertas</span>
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400 uppercase">Contratos em Risco</span>
              <span className="text-danger flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> 1 crítico</span>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <h3 className="text-sm font-bold flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Evolução de Receita vs Custos</h3>
          <LineChart data={lineData} dataKeys={["receita", "custo"]} colors={["#10B981", "#EF4444"]} />
        </div>

        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <h3 className="text-sm font-bold">Consumo por Filial (Top 5 em Litros)</h3>
          <BarChart data={barData} dataKeys={["consumo"]} colors={["#06B6D4"]} />
        </div>
      </div>

      {/* Fourth Row: Decisions & Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Decisions panel */}
        <div className="lg:col-span-2 bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" /> Decisões Pendentes (Dono/CEO)
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Ações que exigem sua aprovação</p>
          </div>

          <div className="space-y-3">
            {pendingDecisions.map((dec) => (
              <div 
                key={dec.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-[#0B1220]/40 border border-slate-100 dark:border-slate-800 rounded-xl"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{dec.title}</span>
                    <span className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${
                      dec.impact === "Alto Risco" ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    }`}>
                      {dec.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">{dec.description}</p>
                  <span className="text-[8px] font-mono text-slate-500 block">{dec.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleAction(dec.title)}
                    className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg text-[10px] transition-all"
                  >
                    Aprovar
                  </button>
                  <button 
                    onClick={() => toast.error("Ação Cancelada", "Decisão rejeitada.")}
                    className="px-3 py-1.5 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-300 font-bold rounded-lg text-[10px] border border-slate-700 transition-all"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts Timeline panel */}
        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <ShieldAlert className="w-4 h-4 text-danger" /> Últimos Alertas Operacionais
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Ocorrências críticas</p>
          </div>

          <Timeline items={recentAlerts} />
        </div>
      </div>
    </div>
  );
}
