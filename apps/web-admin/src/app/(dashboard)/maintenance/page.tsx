"use client";
import * as React from "react";
import { KpiCard } from "@gestao-fretamento-pro/ui";
export default function MaintenanceDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard label="OS Abertas" value={3} status="warning" />
        <KpiCard label="Custo Acumulado (Mês)" value="R$ 12.450" />
      </div>
    </div>
  );
}
