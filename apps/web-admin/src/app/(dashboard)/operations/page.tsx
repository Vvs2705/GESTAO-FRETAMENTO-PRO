"use client";
import * as React from "react";
import { KpiCard, DataTable, StatusBadge } from "@gestao-fretamento-pro/ui";
export default function OperationsPage() {
  const columns = [
    { accessorKey: "id", header: "Viagem" },
    { accessorKey: "driver", header: "Motorista" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }: any) => <StatusBadge status={getValue()} /> }
  ];
  const data = [
    { id: "V-901", driver: "Carlos Souza", status: "trip-in-progress" as const },
    { id: "V-902", driver: "Mariano Silva", status: "trip-delayed" as const },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard label="Viagens em Andamento" value={5} status="info" />
        <KpiCard label="Atrasos Ativos" value={1} status="critical" />
        <KpiCard label="Veículos Livres" value={14} status="success" />
      </div>
      <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl">
        <h3 className="text-sm font-bold mb-4">Acompanhamento das Viagens do Dia</h3>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
