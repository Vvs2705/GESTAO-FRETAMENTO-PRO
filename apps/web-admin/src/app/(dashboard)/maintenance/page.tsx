"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import {
  DataTable,
  DrawerPanel,
  ConfirmModal,
  ErrorState,
  FormField,
  TextInput,
  TextareaField,
  SelectField,
  StatusBadge,
  KpiCard,
  type StatusType,
  toast,
} from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useSave, useApiAction } from "../../../lib/hooks/crud";
import { request } from "../../../lib/api";

type MaintenanceType = "PREVENTIVE" | "CORRECTIVE" | "INSPECTION";
type MaintenanceStatus = "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

interface MaintenanceOrder {
  id: string;
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  supplierName: string | null;
  supplierDocument: string | null;
  expectedStartAt: string | null;
  expectedEndAt: string | null;
  actualEndAt: string | null;
  totalCost: number | null;
  status: MaintenanceStatus;
  notes: string | null;
  createdAt: string;
  vehicle?: {
    id: string;
    plate: string;
    type: string;
    status: string;
  };
}

interface Vehicle {
  id: string;
  plate: string;
}

interface PreventiveDue {
  vehicleId: string;
  plate: string;
  type: string;
  lastPreventiveAt: string | null;
  daysSinceLastPreventive: number | null;
}

const TYPE_OPTIONS = [
  { value: "PREVENTIVE", label: "Preventiva" },
  { value: "CORRECTIVE", label: "Corretiva" },
  { value: "INSPECTION", label: "Inspeção" },
];

const TYPE_LABEL: Record<string, string> = {
  PREVENTIVE: "Preventiva",
  CORRECTIVE: "Corretiva",
  INSPECTION: "Inspeção",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Aberta",
  IN_PROGRESS: "Em andamento",
  COMPLETED: "Concluída",
  CANCELED: "Cancelada",
};

function statusBadge(status: string): { type: StatusType; label: string } {
  switch (status) {
    case "OPEN":
      return { type: "occurrence-open", label: "Aberta" };
    case "IN_PROGRESS":
      return { type: "trip-in-progress", label: "Em andamento" };
    case "COMPLETED":
      return { type: "trip-completed", label: "Concluída" };
    default:
      return { type: "trip-canceled", label: "Cancelada" };
  }
}

const currencyFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function formatDate(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

interface OrderForm {
  vehicleId: string;
  type: MaintenanceType;
  description: string;
  supplierName: string;
  supplierDocument: string;
  expectedStartAt: string;
  expectedEndAt: string;
  notes: string;
}

const EMPTY_FORM: OrderForm = {
  vehicleId: "",
  type: "PREVENTIVE",
  description: "",
  supplierName: "",
  supplierDocument: "",
  expectedStartAt: "",
  expectedEndAt: "",
  notes: "",
};

export default function MaintenancePage() {
  const { can } = useAuth();
  const list = useList<MaintenanceOrder>("maintenance", "/maintenance", { limit: 100 });
  const vehiclesList = useList<Vehicle>("vehicles", "/vehicles", { limit: 100 });
  const save = useSave<MaintenanceOrder>("maintenance", "/maintenance", {
    onDone: () => setDrawerOpen(false),
  });
  const completeAction = useApiAction("maintenance", { successMsg: "Ordem concluída." });

  const preventiveDue = useQuery<PreventiveDue[]>({
    queryKey: ["maintenance", "preventive-due"],
    queryFn: () => request("/maintenance/preventive-due") as Promise<PreventiveDue[]>,
  });

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MaintenanceOrder | null>(null);
  const [form, setForm] = React.useState<OrderForm>(EMPTY_FORM);
  const [toComplete, setToComplete] = React.useState<MaintenanceOrder | null>(null);
  const [toCancel, setToCancel] = React.useState<MaintenanceOrder | null>(null);

  const items = list.data?.data ?? [];
  const vehicles = vehiclesList.data?.data ?? [];
  const dueItems = preventiveDue.data ?? [];

  const vehicleOptions = vehicles.map((v) => ({ value: v.id, label: v.plate }));

  const openCount = items.filter(
    (o) => o.status === "OPEN" || o.status === "IN_PROGRESS",
  ).length;

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(o: MaintenanceOrder) {
    setEditing(o);
    setForm({
      vehicleId: o.vehicleId,
      type: o.type,
      description: o.description,
      supplierName: o.supplierName ?? "",
      supplierDocument: o.supplierDocument ?? "",
      expectedStartAt: o.expectedStartAt ? o.expectedStartAt.slice(0, 10) : "",
      expectedEndAt: o.expectedEndAt ? o.expectedEndAt.slice(0, 10) : "",
      notes: o.notes ?? "",
    });
    setDrawerOpen(true);
  }

  function set<K extends keyof OrderForm>(key: K, value: OrderForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing && !form.vehicleId) {
      toast.error("Veículo obrigatório", "Selecione o veículo da ordem de serviço.");
      return;
    }
    if (form.description.trim().length < 1) {
      toast.error("Descrição obrigatória", "Descreva o serviço a ser realizado.");
      return;
    }

    const data: Record<string, unknown> = {
      type: form.type,
      description: form.description.trim(),
    };
    if (!editing) data.vehicleId = form.vehicleId;
    if (form.supplierName.trim()) data.supplierName = form.supplierName.trim();
    if (form.supplierDocument.trim()) data.supplierDocument = form.supplierDocument.trim();
    if (form.expectedStartAt) data.expectedStartAt = form.expectedStartAt;
    if (form.expectedEndAt) data.expectedEndAt = form.expectedEndAt;
    if (form.notes.trim()) data.notes = form.notes.trim();

    save.mutate(editing ? { id: editing.id, data } : { data });
  }

  function confirmComplete() {
    if (!toComplete) return;
    const id = toComplete.id;
    setToComplete(null);
    completeAction.mutate(() =>
      request(`/maintenance/${id}/complete`, { method: "PATCH", body: JSON.stringify({}) }),
    );
  }

  function confirmCancel() {
    if (!toCancel) return;
    const id = toCancel.id;
    setToCancel(null);
    completeAction.mutate(() => request(`/maintenance/${id}`, { method: "DELETE" }));
  }

  const columns: ColumnDef<MaintenanceOrder, unknown>[] = [
    {
      accessorKey: "vehicle",
      header: "Veículo",
      cell: ({ row }) => row.original.vehicle?.plate ?? "—",
    },
    {
      accessorKey: "type",
      header: "Tipo",
      cell: ({ row }) => TYPE_LABEL[row.original.type] ?? row.original.type,
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <span className="block max-w-xs truncate">{row.original.description}</span>
      ),
    },
    {
      accessorKey: "totalCost",
      header: "Custo",
      cell: ({ row }) =>
        row.original.totalCost != null ? currencyFmt.format(row.original.totalCost) : "—",
    },
    {
      accessorKey: "createdAt",
      header: "Abertura",
      cell: ({ row }) => formatDate(row.original.createdAt),
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
      cell: ({ row }) => {
        const o = row.original;
        const isActive = o.status === "OPEN" || o.status === "IN_PROGRESS";
        return (
          <div className="flex items-center justify-end gap-2">
            {isActive && can("maintenance.update") && (
              <button
                onClick={() => openEdit(o)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Editar
              </button>
            )}
            {isActive && can("maintenance.complete") && (
              <button
                onClick={() => setToComplete(o)}
                className="text-xs font-semibold text-green-600 hover:underline"
              >
                Concluir
              </button>
            )}
            {isActive && can("maintenance.update") && (
              <button
                onClick={() => setToCancel(o)}
                className="text-xs font-semibold text-red-500 hover:underline"
              >
                Cancelar
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (list.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar as ordens de manutenção."
        onRetry={() => list.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KpiCard
          label="OS em aberto"
          value={openCount}
          status={openCount > 0 ? "warning" : "normal"}
          description="Ordens abertas ou em andamento"
          loading={list.isLoading}
        />
        <KpiCard
          label="Preventivas vencidas"
          value={dueItems.length}
          status={dueItems.length > 0 ? "critical" : "success"}
          description="Veículos sem preventiva há mais de 90 dias"
          loading={preventiveDue.isLoading}
        />
      </div>

      {dueItems.length > 0 && (
        <div className="bg-card text-card-foreground rounded-lg border border-slate-200 dark:border-slate-800 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Preventivas vencidas
          </h2>
          <ul className="space-y-1.5">
            {dueItems.map((d) => (
              <li
                key={d.vehicleId}
                className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {d.plate}
                </span>
                <span>
                  {d.daysSinceLastPreventive != null
                    ? `${d.daysSinceLastPreventive} dias desde a última`
                    : "Nunca realizada"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-end">
        {can("maintenance.create") && (
          <button
            onClick={openCreate}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
          >
            + Nova OS
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={list.isLoading}
        emptyTitle="Nenhuma ordem de serviço"
        emptyDescription="Abra a primeira ordem de manutenção da frota."
        {...(can("maintenance.create")
          ? { emptyActionLabel: "Nova OS", onEmptyAction: openCreate }
          : {})}
      />

      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? "Editar ordem de serviço" : "Nova ordem de serviço"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Veículo" required>
            <SelectField
              value={form.vehicleId}
              onChange={(e) => set("vehicleId", e.target.value)}
              options={vehicleOptions}
              placeholder="Selecione o veículo"
              disabled={!!editing}
            />
          </FormField>
          <FormField label="Tipo" required>
            <SelectField
              value={form.type}
              onChange={(e) => set("type", e.target.value as MaintenanceType)}
              options={TYPE_OPTIONS}
            />
          </FormField>
          <FormField label="Descrição" required>
            <TextareaField
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Descreva o serviço a ser realizado"
              maxLength={2000}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Fornecedor">
              <TextInput
                value={form.supplierName}
                onChange={(e) => set("supplierName", e.target.value)}
                maxLength={200}
              />
            </FormField>
            <FormField label="CNPJ/CPF do fornecedor">
              <TextInput
                value={form.supplierDocument}
                onChange={(e) => set("supplierDocument", e.target.value)}
                maxLength={20}
              />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Início previsto">
              <TextInput
                type="date"
                value={form.expectedStartAt}
                onChange={(e) => set("expectedStartAt", e.target.value)}
              />
            </FormField>
            <FormField label="Término previsto">
              <TextInput
                type="date"
                value={form.expectedEndAt}
                onChange={(e) => set("expectedEndAt", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Observações">
            <TextareaField
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              maxLength={2000}
            />
          </FormField>

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
        isOpen={!!toComplete}
        onClose={() => setToComplete(null)}
        onConfirm={confirmComplete}
        title="Concluir ordem de serviço"
        description={
          toComplete
            ? `A ordem do veículo ${toComplete.vehicle?.plate ?? ""} será marcada como concluída e o veículo voltará a ficar disponível.`
            : ""
        }
        confirmLabel="Concluir"
      />

      <ConfirmModal
        isOpen={!!toCancel}
        onClose={() => setToCancel(null)}
        onConfirm={confirmCancel}
        title="Cancelar ordem de serviço"
        description={
          toCancel
            ? `A ordem do veículo ${toCancel.vehicle?.plate ?? ""} será cancelada. Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Cancelar OS"
        isDestructive
      />
    </div>
  );
}
