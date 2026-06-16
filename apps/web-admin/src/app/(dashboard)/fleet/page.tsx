"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { KpiCard, DataTable, StatusBadge, ErrorState, type StatusType } from "@gestao-fretamento-pro/ui";
import { Truck, Wrench, FileWarning, Gauge } from "lucide-react";
import { request } from "../../../lib/api";
import { useList } from "../../../lib/hooks/crud";

interface VehicleByStatusItem {
  status: string;
  count: number;
}
interface FleetDashboard {
  totalVehicles: number;
  vehiclesByStatus?: VehicleByStatusItem[];
  maintenanceOrders?: unknown[];
  documentsExpiring?: { within7Days: number; within30Days: number; within60Days: number };
  avgKmPerVehicle: number | null;
  generatedAt: string;
}

interface Vehicle {
  id: string;
  plate: string;
  prefix: string | null;
  type: string;
  capacity: number;
  brand: string | null;
  model: string | null;
  status: string;
}

const TYPE_LABEL: Record<string, string> = { BUS: "Ônibus", VAN: "Van", MICRO_BUS: "Micro-ônibus" };

function statusBadge(status: string): { type: StatusType; label: string } {
  switch (status) {
    case "AVAILABLE":
      return { type: "vehicle-available", label: "Disponível" };
    case "IN_MAINTENANCE":
      return { type: "vehicle-in-maintenance", label: "Em manutenção" };
    case "RETIRED":
      return { type: "vehicle-unavailable", label: "Aposentado" };
    default:
      return { type: "vehicle-unavailable", label: "Indisponível" };
  }
}

export default function FleetPage() {
  const fleet = useQuery<FleetDashboard>({
    queryKey: ["analytics", "dashboards", "fleet"],
    queryFn: () => request("/analytics/dashboards/fleet") as Promise<FleetDashboard>,
  });
  const list = useList<Vehicle>("vehicles", "/vehicles", { limit: 100 });

  const d = fleet.data ?? ({} as Partial<FleetDashboard>);
  const items = list.data?.data ?? [];

  const byStatus = new Map((d.vehiclesByStatus ?? []).map((s) => [s.status, s.count]));
  const available = byStatus.get("AVAILABLE") ?? 0;
  const inMaintenance = byStatus.get("IN_MAINTENANCE") ?? 0;

  const columns: ColumnDef<Vehicle, unknown>[] = [
    { accessorKey: "plate", header: "Placa" },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => TYPE_LABEL[row.original.type] ?? row.original.type,
    },
    { accessorKey: "capacity", header: "Assentos" },
    {
      accessorKey: "model",
      header: "Modelo",
      cell: ({ row }) => row.original.model ?? "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const b = statusBadge(row.original.status);
        return <StatusBadge status={b.type} label={b.label} />;
      },
    },
  ];

  if (fleet.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar o painel da frota."
        onRetry={() => fleet.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Frota"
          value={d.totalVehicles ?? 0}
          status="info"
          icon={<Truck className="w-4 h-4 text-info" />}
          description="Veículos cadastrados"
        />
        <KpiCard
          label="Disponíveis"
          value={available}
          status="success"
          icon={<Truck className="w-4 h-4 text-success" />}
          description="Prontos para operação"
        />
        <KpiCard
          label="Em Manutenção"
          value={inMaintenance}
          status="warning"
          icon={<Wrench className="w-4 h-4 text-warning" />}
          description="Veículos em oficina"
        />
        <KpiCard
          label="Km Médio / Veículo"
          value={d.avgKmPerVehicle != null ? `${d.avgKmPerVehicle.toLocaleString("pt-BR")} km` : "—"}
          status="normal"
          icon={<Gauge className="w-4 h-4 text-primary" />}
          description="Rodagem média no mês"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <FileWarning className="w-3 h-3 text-amber-500" /> Docs em 7 dias
          </span>
          <span className="text-lg font-extrabold text-amber-500">{d.documentsExpiring?.within7Days ?? 0}</span>
        </div>
        <div className="bg-card p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <FileWarning className="w-3 h-3 text-primary" /> Docs em 30 dias
          </span>
          <span className="text-lg font-extrabold text-primary">{d.documentsExpiring?.within30Days ?? 0}</span>
        </div>
        <div className="bg-card p-4 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            <Wrench className="w-3 h-3 text-slate-400" /> Ordens de Manutenção
          </span>
          <span className="text-lg font-extrabold text-foreground">{d.maintenanceOrders?.length ?? 0}</span>
        </div>
      </div>

      <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
            <Truck className="w-4 h-4 text-primary" /> Lista de Veículos
          </h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Frota cadastrada na operação</p>
        </div>
        <DataTable
          columns={columns}
          data={items}
          loading={list.isLoading}
          emptyTitle="Nenhum veículo cadastrado"
          emptyDescription="Cadastre veículos na tela de Veículos para vê-los aqui."
        />
      </div>
    </div>
  );
}
