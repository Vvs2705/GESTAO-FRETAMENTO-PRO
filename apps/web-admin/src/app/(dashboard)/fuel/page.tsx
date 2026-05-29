"use client";

import * as React from "react";
import { KpiCard, AlertCard, FuelStockGauge, toast } from "@gestao-fretamento-pro/ui";
import { 
  Droplet, 
  CheckCircle2, 
  AlertTriangle, 
  Truck, 
  FileText, 
  TrendingUp,
  UserCheck
} from "lucide-react";

export default function FuelDashboardPage() {
  const handleApproveDelivery = (id: string) => {
    toast.success("Entrega Aprovada", `Entrega #${id} homologada com sucesso no estoque do tanque.`);
  };

  const deliveries = [
    {
      id: "CAR-8820",
      supplier: "Ipiranga Distribuidora",
      plate: "GHX-4018",
      tanque: "Tanque Diesel S10 (Louveira)",
      litros: 15000,
      seals: "OK (Lacre #99281)",
      status: "Aguardando Medição Depois",
      invoice: "NF-28491"
    },
    {
      id: "CAR-8819",
      supplier: "Raízen Combustíveis",
      plate: "EBA-8819",
      tanque: "Tanque Diesel S500 (Jundiaí)",
      litros: 12000,
      seals: "OK (Lacre #88201)",
      status: "Homologado",
      invoice: "NF-28489"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top operational metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          label="Abastecido Hoje" 
          value="4.250 L" 
          trend="+15% vs média" 
          trendDirection="up" 
          status="info" 
          icon={<Droplet className="w-4 h-4 text-info" />} 
          description="32 abastecimentos internos, 4 externos"
        />
        <KpiCard 
          label="Preço Médio / Litro" 
          value="R$ 5,78" 
          trend="-R$ 0,12" 
          trendDirection="down" 
          status="success" 
          icon={<TrendingUp className="w-4 h-4 text-success" />} 
          description="Contratos B2B atualizados há 2 dias"
        />
        <KpiCard 
          label="Divergências" 
          value="1 Crítica" 
          trend="Revisar" 
          status="warning" 
          icon={<AlertTriangle className="w-4 h-4 text-warning" />} 
          description="Odômetro incoerente no veículo ABC-1234"
        />
        <KpiCard 
          label="Ruptura de Estoque" 
          value="8 Dias" 
          trend="Seguro" 
          trendDirection="neutral" 
          status="success" 
          icon={<Truck className="w-4 h-4 text-success" />} 
          description="Previsão de consumo até próxima entrega"
        />
      </div>

      {/* Active Tank Levels (FuelStockGauges) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Status dos Tanques Compartilhados</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Monitoramento ativo de tanques internos</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FuelStockGauge 
            name="Tanque Principal - Base Louveira" 
            capacity={15000} 
            currentLevel={8420} 
            fuelType="Diesel S10"
            thresholdPercent={20}
          />
          <FuelStockGauge 
            name="Tanque Secundário - Base Jundiaí" 
            capacity={10000} 
            currentLevel={1800} 
            fuelType="Diesel S500"
            thresholdPercent={20}
          />
          <FuelStockGauge 
            name="Tanque Aditivo - Base Louveira" 
            capacity={3000} 
            currentLevel={2400} 
            fuelType="Arla 32"
            thresholdPercent={15}
          />
        </div>
      </div>

      {/* Main Fueling Alert */}
      <AlertCard 
        severity="warning" 
        title="Anomalia de Odômetro Detectada" 
        description="O abastecimento da placa ABC-1234 registrou km 124.500, que é inferior ao registro anterior do veículo (124.890 km). Auditoria necessária antes da liberação do protocolo." 
      />

      {/* Bottom panels: Carretas delivery and Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Carreta Deliveries panel */}
        <div className="lg:col-span-2 bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Truck className="w-4 h-4 text-primary" /> Recebimento de Carreta (Combustível em Lote)
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Entregas de fornecedores agendadas/recebidas</p>
          </div>

          <div className="space-y-3">
            {deliveries.map((del) => (
              <div 
                key={del.id}
                className="p-4 bg-slate-50 dark:bg-[#0B1220]/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{del.supplier}</span>
                    <span className="text-[9px] font-mono bg-slate-700 px-2 py-0.5 rounded text-slate-300">{del.id}</span>
                  </div>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    del.status === "Homologado" ? "bg-success/10 text-success border border-success/20" : "bg-primary/10 text-primary border border-primary/20"
                  }`}>
                    {del.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-medium text-slate-400">
                  <div>
                    <span className="block uppercase text-[8px] font-bold">Cavalo/Carreta</span>
                    <span className="text-slate-200">{del.plate}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[8px] font-bold">Litros NF</span>
                    <span className="text-slate-200">{del.litros.toLocaleString("pt-BR")} L</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[8px] font-bold">Lacres/Segurança</span>
                    <span className="text-slate-200">{del.seals}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-[8px] font-bold">Nota Fiscal</span>
                    <span className="text-slate-200 flex items-center gap-1"><FileText className="w-3 h-3 text-primary" /> {del.invoice}</span>
                  </div>
                </div>

                {del.status !== "Homologado" && (
                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                    <button
                      onClick={() => handleApproveDelivery(del.id)}
                      className="px-3 py-1 bg-primary hover:bg-primary/95 text-white font-bold rounded-lg text-[9px] transition-all"
                    >
                      Confirmar Descarga & Medição
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Active Fuelers panel */}
        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <UserCheck className="w-4 h-4 text-primary" /> Abastecedores Ativos (Pátio)
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Equipe operacional de plantão</p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1220]/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center font-bold text-[10px] text-primary">
                  RC
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Rodrigo Costa</span>
                  <span className="text-[8px] text-slate-400 uppercase font-semibold">Base Louveira</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Ativo</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1220]/40 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center font-bold text-[10px] text-primary">
                  JM
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">José Moreira</span>
                  <span className="text-[8px] text-slate-400 uppercase font-semibold">Base Jundiaí</span>
                </div>
              </div>
              <span className="text-[9px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">Ativo</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
