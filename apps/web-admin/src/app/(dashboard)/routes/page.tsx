"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DrawerPanel,
  ConfirmModal,
  ErrorState,
  FormField,
  TextInput,
  toast,
} from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useSave, useRemove } from "../../../lib/hooks/crud";

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  estimatedDistanceKm: number | null;
  estimatedDurationMinutes: number | null;
  status: string;
  notes: string | null;
}

interface RouteForm {
  name: string;
  origin: string;
  destination: string;
  estimatedDistanceKm: string;
  estimatedDurationMinutes: string;
  notes: string;
}
const EMPTY: RouteForm = {
  name: "",
  origin: "",
  destination: "",
  estimatedDistanceKm: "",
  estimatedDurationMinutes: "",
  notes: "",
};

export default function RoutesPage() {
  const { can } = useAuth();
  const list = useList<Route>("routes", "/routes", { limit: 100 });
  const save = useSave<Route>("routes", "/routes", { onDone: () => setOpen(false) });
  const remove = useRemove("routes", "/routes");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Route | null>(null);
  const [form, setForm] = React.useState<RouteForm>(EMPTY);
  const [toDelete, setToDelete] = React.useState<Route | null>(null);

  const items = list.data?.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function openEdit(r: Route) {
    setEditing(r);
    setForm({
      name: r.name,
      origin: r.origin,
      destination: r.destination,
      estimatedDistanceKm: r.estimatedDistanceKm != null ? String(r.estimatedDistanceKm) : "",
      estimatedDurationMinutes: r.estimatedDurationMinutes != null ? String(r.estimatedDurationMinutes) : "",
      notes: r.notes ?? "",
    });
    setOpen(true);
  }
  function set<K extends keyof RouteForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nome obrigatório", "Informe o nome da rota.");
    if (!form.origin.trim() || !form.destination.trim())
      return toast.error("Origem e destino", "Informe origem e destino.");
    const data: Record<string, unknown> = {
      name: form.name.trim(),
      origin: form.origin.trim(),
      destination: form.destination.trim(),
    };
    if (form.estimatedDistanceKm.trim()) data.estimatedDistanceKm = Number(form.estimatedDistanceKm);
    if (form.estimatedDurationMinutes.trim()) data.estimatedDurationMinutes = Number(form.estimatedDurationMinutes);
    if (form.notes.trim()) data.notes = form.notes.trim();
    save.mutate(editing ? { id: editing.id, data } : { data });
  }

  const columns: ColumnDef<Route, unknown>[] = [
    { accessorKey: "name", header: "Rota" },
    { accessorKey: "origin", header: "Origem" },
    { accessorKey: "destination", header: "Destino" },
    {
      accessorKey: "estimatedDistanceKm",
      header: "Distância",
      cell: ({ row }) => (row.original.estimatedDistanceKm != null ? `${row.original.estimatedDistanceKm} km` : "—"),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {can("route.update") && (
            <button onClick={() => openEdit(row.original)} className="text-xs font-semibold text-primary hover:underline">
              Editar
            </button>
          )}
          {can("route.delete") && (
            <button onClick={() => setToDelete(row.original)} className="text-xs font-semibold text-red-500 hover:underline">
              Excluir
            </button>
          )}
        </div>
      ),
    },
  ];

  if (list.isError) {
    return <ErrorState description="Não foi possível carregar as rotas." onRetry={() => list.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {can("route.create") && (
          <button onClick={openCreate} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition">
            + Nova rota
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={list.isLoading}
        emptyTitle="Nenhuma rota cadastrada"
        emptyDescription="Cadastre rotas/itinerários para usar na criação de viagens."
        {...(can("route.create") ? { emptyActionLabel: "Nova rota", onEmptyAction: openCreate } : {})}
      />

      <DrawerPanel isOpen={open} onClose={() => setOpen(false)} title={editing ? "Editar rota" : "Nova rota"} size="md">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nome da rota" required>
            <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="SP → Campinas (turno manhã)" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Origem" required>
              <TextInput value={form.origin} onChange={(e) => set("origin", e.target.value)} />
            </FormField>
            <FormField label="Destino" required>
              <TextInput value={form.destination} onChange={(e) => set("destination", e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Distância (km)">
              <TextInput type="number" value={form.estimatedDistanceKm} onChange={(e) => set("estimatedDistanceKm", e.target.value)} />
            </FormField>
            <FormField label="Duração (min)">
              <TextInput type="number" value={form.estimatedDurationMinutes} onChange={(e) => set("estimatedDurationMinutes", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Observações" hint="Edição de paradas/itinerário detalhado: próxima iteração (PATCH /routes/:id/points).">
            <TextInput value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </FormField>
          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-900 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold">
              Cancelar
            </button>
            <button type="submit" disabled={save.isPending} className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-50">
              {save.isPending ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </DrawerPanel>

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
        title="Excluir rota"
        description={toDelete ? `A rota "${toDelete.name}" será removida.` : ""}
        confirmLabel="Excluir"
        isDestructive
      />
    </div>
  );
}
