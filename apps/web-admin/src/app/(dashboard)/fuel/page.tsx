"use client";
import * as React from "react";
import { KpiCard, AlertCard } from "@gestao-fretamento-pro/ui";
export default function FuelDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Total Abastecido (Mês)" value="4.200 L" />
        <KpiCard label="Consumo Médio Geral" value="4.8 km/L" />
        <KpiCard label="Preço Médio / L" value="R$ 5,89" />
      </div>
      <AlertCard severity="warning" title="Anomalia de Odomêtro Detectada" description="Abastecimento do veículo ABC-1234 registrou quilometragem inferior ao registro anterior." />
    </div>
  );
}
