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
  toast,
} from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useSave, useRemove } from "../../../lib/hooks/crud";

interface Driver {
  id: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiresAt: string;
  availabilityStatus: string;
  notes: string | null;
  employee?: { id: string; name: string; phone: string | null; email: string | null } | null;
}

const CATEGORY_OPTIONS = ["B", "C", "D", "E"].map((c) => ({ value: c, label: c }));
const AVAIL_OPTIONS = [
  { value: "AVAILABLE", label: "Disponível" },
  { value: "ON_TRIP", label: "Em viagem" },
  { value: "ON_LEAVE", label: "Afastado" },
  { value: "SUSPENDED", label: "Suspenso" },
  { value: "INACTIVE", label: "Inativo" },
];
const AVAIL_LABEL: Record<string, string> = Object.fromEntries(AVAIL_OPTIONS.map((o) => [o.value, o.label]));

interface DriverForm {
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiresAt: string;
  availabilityStatus: string;
  notes: string;
}
const EMPTY: DriverForm = {
  licenseNumber: "",
  licenseCategory: "D",
  licenseExpiresAt: "",
  availabilityStatus: "AVAILABLE",
  notes: "",
};

export default function DriversPage() {
  const { can } = useAuth();
  const list = useList<Driver>("drivers", "/drivers", { limit: 100 });
  const save = useSave<Driver>("drivers", "/drivers", { onDone: () => setOpen(false) });
  const remove = useRemove("drivers", "/drivers");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Driver | null>(null);
  const [form, setForm] = React.useState<DriverForm>(EMPTY);
  const [toDelete, setToDelete] = React.useState<Driver | null>(null);

  const items = list.data?.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function openEdit(d: Driver) {
    setEditing(d);
    setForm({
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      licenseExpiresAt: d.licenseExpiresAt ? d.licenseExpiresAt.slice(0, 10) : "",
      availabilityStatus: d.availabilityStatus,
      notes: d.notes ?? "",
    });
    setOpen(true);
  }
  function set<K extends keyof DriverForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.licenseNumber.trim()) return toast.error("CNH obrigatória", "Informe o número da CNH.");
    if (!form.licenseExpiresAt) return toast.error("Validade obrigatória", "Informe a validade da CNH.");
    const data: Record<string, unknown> = {
      licenseNumber: form.licenseNumber.trim(),
      licenseCategory: form.licenseCategory,
      licenseExpiresAt: new Date(form.licenseExpiresAt).toISOString(),
      availabilityStatus: form.availabilityStatus,
    };
    if (form.notes.trim()) data.notes = form.notes.trim();
    save.mutate(editing ? { id: editing.id, data } : { data });
  }

  const columns: ColumnDef<Driver, unknown>[] = [
    {
      id: "name",
      header: "Motorista",
      cell: ({ row }) => row.original.employee?.name ?? "—",
    },
    { accessorKey: "licenseNumber", header: "CNH" },
    { accessorKey: "licenseCategory", header: "Cat." },
    {
      accessorKey: "licenseExpiresAt",
      header: "Validade CNH",
      cell: ({ row }) =>
        row.original.licenseExpiresAt
          ? new Date(row.original.licenseExpiresAt).toLocaleDateString("pt-BR")
          : "—",
    },
    {
      accessorKey: "availabilityStatus",
      header: "Disponibilidade",
      cell: ({ row }) => AVAIL_LABEL[row.original.availabilityStatus] ?? row.original.availabilityStatus,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {can("driver.update") && (
            <button onClick={() => openEdit(row.original)} className="text-xs font-semibold text-primary hover:underline">
              Editar
            </button>
          )}
          {can("driver.delete") && (
            <button onClick={() => setToDelete(row.original)} className="text-xs font-semibold text-red-500 hover:underline">
              Excluir
            </button>
          )}
        </div>
      ),
    },
  ];

  if (list.isError) {
    return <ErrorState description="Não foi possível carregar os motoristas." onRetry={() => list.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {can("driver.create") && (
          <button onClick={openCreate} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition">
            + Novo motorista
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={list.isLoading}
        emptyTitle="Nenhum motorista cadastrado"
        emptyDescription="Cadastre o primeiro motorista da operação."
        {...(can("driver.create") ? { emptyActionLabel: "Novo motorista", onEmptyAction: openCreate } : {})}
      />

      <DrawerPanel isOpen={open} onClose={() => setOpen(false)} title={editing ? "Editar motorista" : "Novo motorista"} size="md">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Número da CNH" required>
            <TextInput value={form.licenseNumber} onChange={(e) => set("licenseNumber", e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Categoria" required>
              <SelectField value={form.licenseCategory} onChange={(e) => set("licenseCategory", e.target.value)} options={CATEGORY_OPTIONS} />
            </FormField>
            <FormField label="Validade da CNH" required>
              <TextInput type="date" value={form.licenseExpiresAt} onChange={(e) => set("licenseExpiresAt", e.target.value)} />
            </FormField>
          </div>
          <FormField label="Disponibilidade">
            <SelectField value={form.availabilityStatus} onChange={(e) => set("availabilityStatus", e.target.value)} options={AVAIL_OPTIONS} />
          </FormField>
          <FormField label="Observações">
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
        title="Excluir motorista"
        description={toDelete ? `O motorista (CNH ${toDelete.licenseNumber}) será removido.` : ""}
        confirmLabel="Excluir"
        isDestructive
      />
    </div>
  );
}
