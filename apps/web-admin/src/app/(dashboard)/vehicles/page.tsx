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
  SelectField,
  StatusBadge,
  type StatusType,
  toast,
} from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useSave, useRemove, useApiAction } from "../../../lib/hooks/crud";
import { request } from "../../../lib/api";

interface Vehicle {
  id: string;
  plate: string;
  prefix: string | null;
  type: string;
  capacity: number;
  brand: string | null;
  model: string | null;
  year: number | null;
  fuelType: string | null;
  currentOdometer: number | null;
  status: string;
  branchId: string | null;
  notes: string | null;
}

const TYPE_OPTIONS = [
  { value: "BUS", label: "Ônibus" },
  { value: "VAN", label: "Van" },
  { value: "MICRO_BUS", label: "Micro-ônibus" },
];
const FUEL_OPTIONS = [
  { value: "DIESEL", label: "Diesel" },
  { value: "GASOLINE", label: "Gasolina" },
  { value: "ETHANOL", label: "Etanol" },
  { value: "GNV", label: "GNV" },
];
const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Disponível" },
  { value: "IN_MAINTENANCE", label: "Em manutenção" },
  { value: "UNAVAILABLE", label: "Indisponível" },
  { value: "RETIRED", label: "Aposentado" },
];

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

const TYPE_LABEL: Record<string, string> = { BUS: "Ônibus", VAN: "Van", MICRO_BUS: "Micro-ônibus" };

interface VehicleForm {
  plate: string;
  type: string;
  capacity: string;
  brand: string;
  model: string;
  year: string;
  fuelType: string;
  prefix: string;
  notes: string;
}

const EMPTY_FORM: VehicleForm = {
  plate: "",
  type: "BUS",
  capacity: "",
  brand: "",
  model: "",
  year: "",
  fuelType: "",
  prefix: "",
  notes: "",
};

export default function VehiclesPage() {
  const { can } = useAuth();
  const list = useList<Vehicle>("vehicles", "/vehicles", { limit: 100 });
  const save = useSave<Vehicle>("vehicles", "/vehicles", { onDone: () => setDrawerOpen(false) });
  const remove = useRemove("vehicles", "/vehicles");
  const statusAction = useApiAction("vehicles", { successMsg: "Status atualizado." });

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Vehicle | null>(null);
  const [form, setForm] = React.useState<VehicleForm>(EMPTY_FORM);
  const [toDelete, setToDelete] = React.useState<Vehicle | null>(null);

  const items = list.data?.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(v: Vehicle) {
    setEditing(v);
    setForm({
      plate: v.plate,
      type: v.type,
      capacity: String(v.capacity ?? ""),
      brand: v.brand ?? "",
      model: v.model ?? "",
      year: v.year ? String(v.year) : "",
      fuelType: v.fuelType ?? "",
      prefix: v.prefix ?? "",
      notes: v.notes ?? "",
    });
    setDrawerOpen(true);
  }

  function set<K extends keyof VehicleForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.plate.trim().length < 7) {
      toast.error("Placa inválida", "Informe a placa completa (mín. 7 caracteres).");
      return;
    }
    const capacity = Number(form.capacity);
    if (!Number.isInteger(capacity) || capacity <= 0) {
      toast.error("Capacidade inválida", "Informe um número de assentos válido.");
      return;
    }
    const data: Record<string, unknown> = {
      plate: form.plate.trim().toUpperCase(),
      type: form.type,
      capacity,
    };
    if (form.brand.trim()) data.brand = form.brand.trim();
    if (form.model.trim()) data.model = form.model.trim();
    if (form.year.trim()) data.year = Number(form.year);
    if (form.fuelType) data.fuelType = form.fuelType;
    if (form.prefix.trim()) data.prefix = form.prefix.trim();
    if (form.notes.trim()) data.notes = form.notes.trim();

    save.mutate(editing ? { id: editing.id, data } : { data });
  }

  function changeStatus(v: Vehicle, status: string) {
    if (status === v.status) return;
    statusAction.mutate(() =>
      request(`/vehicles/${v.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    );
  }

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
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {can("vehicle.update") && (
            <button
              onClick={() => openEdit(row.original)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Editar
            </button>
          )}
          {can("vehicle.delete") && (
            <button
              onClick={() => setToDelete(row.original)}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Excluir
            </button>
          )}
        </div>
      ),
    },
  ];

  if (list.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar os veículos."
        onRetry={() => list.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {can("vehicle.create") && (
          <button
            onClick={openCreate}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
          >
            + Cadastrar veículo
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={list.isLoading}
        emptyTitle="Nenhum veículo cadastrado"
        emptyDescription="Cadastre o primeiro veículo da frota para começar."
        {...(can("vehicle.create")
          ? { emptyActionLabel: "Cadastrar veículo", onEmptyAction: openCreate }
          : {})}
      />

      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? `Editar veículo ${editing.plate}` : "Cadastrar veículo"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Placa" required>
            <TextInput
              value={form.plate}
              onChange={(e) => set("plate", e.target.value)}
              placeholder="ABC1D23"
              maxLength={10}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo" required>
              <SelectField
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                options={TYPE_OPTIONS}
              />
            </FormField>
            <FormField label="Assentos" required>
              <TextInput
                type="number"
                min={1}
                value={form.capacity}
                onChange={(e) => set("capacity", e.target.value)}
                placeholder="46"
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Marca">
              <TextInput value={form.brand} onChange={(e) => set("brand", e.target.value)} />
            </FormField>
            <FormField label="Modelo">
              <TextInput value={form.model} onChange={(e) => set("model", e.target.value)} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Ano">
              <TextInput
                type="number"
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
                placeholder="2022"
              />
            </FormField>
            <FormField label="Combustível">
              <SelectField
                value={form.fuelType}
                onChange={(e) => set("fuelType", e.target.value)}
                options={FUEL_OPTIONS}
                placeholder="Selecione"
              />
            </FormField>
          </div>
          <FormField label="Prefixo">
            <TextInput value={form.prefix} onChange={(e) => set("prefix", e.target.value)} />
          </FormField>
          <FormField label="Observações">
            <TextInput value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </FormField>

          {editing && can("vehicle.update") && (
            <FormField label="Status operacional" hint="Alterado imediatamente ao selecionar.">
              <SelectField
                value={editing.status}
                onChange={(e) => changeStatus(editing, e.target.value)}
                options={STATUS_OPTIONS}
              />
            </FormField>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-900 pt-4">
            <button
              type="button"
              onClick={() => setDrawerOpen(false)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={save.isPending}
              className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
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
        title="Excluir veículo"
        description={
          toDelete
            ? `O veículo ${toDelete.plate} será removido. Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        isDestructive
      />
    </div>
  );
}
