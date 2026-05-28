"use client";
import * as React from "react";
import { KpiCard, DataTable } from "@gestao-fretamento-pro/ui";
export default function FleetPage() {
  const columns = [
    { accessorKey: "plate", header: "Placa" },
    { accessorKey: "model", header: "Modelo" },
    { accessorKey: "status", header: "Status" }
  ];
  const data = [
    { plate: "ABC-1234", model: "Marcopolo G8", status: "Disponível" },
    { plate: "DEF-5678", model: "Mercedes Sprinter", status: "Em Manutenção" },
  ];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard label="Total Frota" value={22} />
        <KpiCard label="Veículos em Operação" value={8} />
      </div>
      <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl">
        <h3 className="text-sm font-bold mb-4">Lista de Veículos Ativos</h3>
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
