"use client";
import * as React from "react";
import { DataTable, StatusBadge, toast } from "@gestao-fretamento-pro/ui";

export default function TripsListPage() {
  const columns = [
    { accessorKey: "id", header: "Código" },
    { accessorKey: "client", header: "Cliente" },
    { accessorKey: "route", header: "Rota" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }: any) => <StatusBadge status={getValue()} /> }
  ];

  const data = [
    { id: "TR-001", client: "Dell Computadores", route: "SP ➔ Campinas", status: "trip-confirmed" as const },
    { id: "TR-002", client: "Bosch Tecnologia", route: "Valinhos ➔ Hortolândia", status: "trip-in-progress" as const },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold">Gestão de Viagens</h2>
        <button
          onClick={() => {
            window.location.href = "/trips/new";
          }}
          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold"
        >
          Nova Viagem
        </button>
      </div>
      <DataTable columns={columns} data={data} />
    </div>
  );
}
