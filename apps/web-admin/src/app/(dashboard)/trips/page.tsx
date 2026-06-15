"use client";

import * as React from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable, StatusBadge, type StatusType, ErrorState } from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useApiAction } from "../../../lib/hooks/crud";
import { request } from "../../../lib/api";

interface Trip {
  id: string;
  scheduledStartAt: string;
  status: string;
  passengerCount: number | null;
  client?: { id: string; name: string } | null;
  route?: { id: string; name: string; origin: string; destination: string } | null;
  vehicle?: { id: string; plate: string } | null;
  driver?: { id: string; employee?: { name: string } | null } | null;
}

const STATUS_MAP: Record<string, { type: StatusType; label: string }> = {
  DRAFT: { type: "trip-draft", label: "Rascunho" },
  CONFIRMED: { type: "trip-confirmed", label: "Confirmada" },
  IN_PROGRESS: { type: "trip-in-progress", label: "Em andamento" },
  DELAYED: { type: "trip-delayed", label: "Atrasada" },
  COMPLETED: { type: "trip-completed", label: "Concluída" },
  CANCELED: { type: "trip-canceled", label: "Cancelada" },
};

/** Próximas transições permitidas a partir de cada status. */
const TRANSITIONS: Record<string, { status: string; label: string; tone: string }[]> = {
  DRAFT: [
    { status: "CONFIRMED", label: "Confirmar", tone: "text-primary" },
    { status: "CANCELED", label: "Cancelar", tone: "text-red-500" },
  ],
  CONFIRMED: [
    { status: "IN_PROGRESS", label: "Iniciar", tone: "text-primary" },
    { status: "DELAYED", label: "Atrasar", tone: "text-amber-500" },
    { status: "CANCELED", label: "Cancelar", tone: "text-red-500" },
  ],
  IN_PROGRESS: [
    { status: "COMPLETED", label: "Concluir", tone: "text-green-600" },
    { status: "DELAYED", label: "Atrasar", tone: "text-amber-500" },
  ],
  DELAYED: [{ status: "COMPLETED", label: "Concluir", tone: "text-green-600" }],
};

export default function TripsListPage() {
  const { can } = useAuth();
  const list = useList<Trip>("trips", "/trips", { limit: 100 });
  const transition = useApiAction("trips", { successMsg: "Status da viagem atualizado." });

  const items = list.data?.data ?? [];

  function doTransition(trip: Trip, status: string) {
    transition.mutate(() =>
      request(`/trips/${trip.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    );
  }

  const columns: ColumnDef<Trip, unknown>[] = [
    {
      accessorKey: "scheduledStartAt",
      header: "Início",
      cell: ({ row }) =>
        row.original.scheduledStartAt
          ? new Date(row.original.scheduledStartAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
          : "—",
    },
    { id: "client", header: "Cliente", cell: ({ row }) => row.original.client?.name ?? "—" },
    {
      id: "route",
      header: "Rota",
      cell: ({ row }) =>
        row.original.route?.name ??
        (row.original.route ? `${row.original.route.origin} → ${row.original.route.destination}` : "—"),
    },
    { id: "vehicle", header: "Veículo", cell: ({ row }) => row.original.vehicle?.plate ?? "—" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = STATUS_MAP[row.original.status] ?? { type: "trip-draft" as StatusType, label: row.original.status };
        return <StatusBadge status={s.type} label={s.label} />;
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const next = TRANSITIONS[row.original.status] ?? [];
        if (!can("trip.update") || next.length === 0) return <span className="text-[11px] text-slate-400">—</span>;
        return (
          <div className="flex items-center justify-end gap-2">
            {next.map((t) => (
              <button
                key={t.status}
                onClick={() => doTransition(row.original, t.status)}
                className={`text-xs font-semibold hover:underline ${t.tone}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        );
      },
    },
  ];

  if (list.isError) {
    return <ErrorState description="Não foi possível carregar as viagens." onRetry={() => list.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {can("trip.create") && (
          <Link href="/trips/new" className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition">
            + Nova viagem
          </Link>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={list.isLoading}
        emptyTitle="Nenhuma viagem"
        emptyDescription="Crie a primeira viagem para começar a programação."
      />
    </div>
  );
}
