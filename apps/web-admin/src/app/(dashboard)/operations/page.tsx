"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  DataTable,
  KpiCard,
  ErrorState,
  StatusBadge,
  type StatusType,
} from "@gestao-fretamento-pro/ui";
import { request } from "../../../lib/api";

interface Trip {
  id: string;
  scheduledStartAt: string;
  status: string;
  passengerCount: number;
  client?: { name: string } | null;
  route?: { name: string | null; origin: string; destination: string } | null;
  vehicle?: { plate: string } | null;
  driver?: { employee?: { name: string } | null } | null;
}

const STATUS_MAP: Record<string, StatusType> = {
  DRAFT: "trip-draft",
  CONFIRMED: "trip-confirmed",
  IN_PROGRESS: "trip-in-progress",
  DELAYED: "trip-delayed",
  COMPLETED: "trip-completed",
  CANCELED: "trip-canceled",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Rascunho",
  CONFIRMED: "Confirmada",
  IN_PROGRESS: "Em andamento",
  DELAYED: "Atrasada",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
};

function formatStart(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function routeLabel(trip: Trip): string {
  if (!trip.route) return "—";
  if (trip.route.name) return trip.route.name;
  return `${trip.route.origin} → ${trip.route.destination}`;
}

export default function OperationsPage() {
  const today = useQuery<Trip[]>({
    queryKey: ["trips", "today"],
    queryFn: () => request("/trips/today") as Promise<Trip[]>,
  });
  const delayed = useQuery<Trip[]>({
    queryKey: ["trips", "delayed"],
    queryFn: () => request("/trips/delayed") as Promise<Trip[]>,
  });

  const todayTrips = today.data ?? [];
  const delayedTrips = delayed.data ?? [];
  const inProgressCount = todayTrips.filter((t) => t.status === "IN_PROGRESS").length;

  const columns: ColumnDef<Trip, unknown>[] = [
    {
      accessorKey: "scheduledStartAt",
      header: "Início",
      cell: ({ row }) => formatStart(row.original.scheduledStartAt),
    },
    {
      id: "client",
      header: "Cliente",
      cell: ({ row }) => row.original.client?.name ?? "—",
    },
    {
      id: "route",
      header: "Rota",
      cell: ({ row }) => routeLabel(row.original),
    },
    {
      id: "vehicle",
      header: "Veículo",
      cell: ({ row }) => row.original.vehicle?.plate ?? "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <StatusBadge
            status={STATUS_MAP[status] ?? "trip-draft"}
            label={STATUS_LABEL[status] ?? status}
          />
        );
      },
    },
  ];

  if (today.isError || delayed.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar as viagens da operação."
        onRetry={() => {
          today.refetch();
          delayed.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          label="Viagens hoje"
          value={todayTrips.length}
          status="info"
          loading={today.isLoading}
        />
        <KpiCard
          label="Atrasadas"
          value={delayedTrips.length}
          status="critical"
          loading={delayed.isLoading}
        />
        <KpiCard
          label="Em andamento"
          value={inProgressCount}
          status="success"
          loading={today.isLoading}
        />
      </div>

      <DataTable
        columns={columns}
        data={todayTrips}
        loading={today.isLoading}
        emptyTitle="Nenhuma viagem hoje"
        emptyDescription="Não há viagens programadas para o dia de hoje."
      />
    </div>
  );
}
