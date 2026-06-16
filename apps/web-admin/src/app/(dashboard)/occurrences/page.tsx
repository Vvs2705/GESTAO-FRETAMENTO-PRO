"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DrawerPanel,
  ErrorState,
  FormField,
  TextInput,
  TextareaField,
  SelectField,
  StatusBadge,
  type StatusType,
  toast,
} from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useSave, useApiAction } from "../../../lib/hooks/crud";
import { request } from "../../../lib/api";

interface Occurrence {
  id: string;
  type: string;
  severity: string;
  description: string;
  status: string;
  actionTaken: string | null;
  notes: string | null;
  createdAt: string;
}

const SEVERITY_OPTIONS = [
  { value: "LOW", label: "Baixa" },
  { value: "MEDIUM", label: "Média" },
  { value: "HIGH", label: "Alta" },
  { value: "CRITICAL", label: "Crítica" },
];
const SEVERITY_LABEL: Record<string, string> = Object.fromEntries(SEVERITY_OPTIONS.map((o) => [o.value, o.label]));

function statusBadge(status: string): { type: StatusType; label: string } {
  switch (status) {
    case "CRITICAL":
      return { type: "occurrence-critical", label: "Crítica" };
    case "RESOLVED":
      return { type: "occurrence-resolved", label: "Resolvida" };
    case "IN_ANALYSIS":
      return { type: "occurrence-open", label: "Em análise" };
    default:
      return { type: "occurrence-open", label: "Aberta" };
  }
}

interface OccForm {
  type: string;
  severity: string;
  description: string;
  notes: string;
}
const EMPTY: OccForm = { type: "", severity: "MEDIUM", description: "", notes: "" };

export default function OccurrencesPage() {
  const { can } = useAuth();
  const list = useList<Occurrence>("occurrences", "/occurrences", { limit: 100 });
  const save = useSave<Occurrence>("occurrences", "/occurrences", { onDone: () => setOpen(false) });
  const action = useApiAction("occurrences");

  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<OccForm>(EMPTY);
  const [resolving, setResolving] = React.useState<Occurrence | null>(null);
  const [actionTaken, setActionTaken] = React.useState("");

  const items = list.data?.data ?? [];

  function set<K extends keyof OccForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.type.trim()) return toast.error("Tipo obrigatório", "Informe o tipo da ocorrência.");
    if (form.description.trim().length < 1) return toast.error("Descrição obrigatória", "Descreva a ocorrência.");
    const data: Record<string, unknown> = {
      type: form.type.trim(),
      severity: form.severity,
      description: form.description.trim(),
    };
    if (form.notes.trim()) data.notes = form.notes.trim();
    save.mutate({ data });
  }

  function escalate(o: Occurrence) {
    action.mutate(() => request(`/occurrences/${o.id}/escalate`, { method: "PATCH" }));
  }
  function doResolve() {
    if (!resolving) return;
    if (actionTaken.trim().length < 1) return toast.error("Ação obrigatória", "Descreva a ação tomada.");
    const occ = resolving;
    action.mutate(() =>
      request(`/occurrences/${occ.id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify({ actionTaken: actionTaken.trim() }),
      }),
    );
    setResolving(null);
    setActionTaken("");
  }

  const columns: ColumnDef<Occurrence, unknown>[] = [
    { accessorKey: "type", header: "Tipo" },
    {
      accessorKey: "severity",
      header: "Severidade",
      cell: ({ row }) => SEVERITY_LABEL[row.original.severity] ?? row.original.severity,
    },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => (
        <span className="block max-w-[280px] truncate" title={row.original.description}>
          {row.original.description}
        </span>
      ),
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
        if (o.status === "RESOLVED") return <span className="text-[11px] text-slate-400">—</span>;
        return (
          <div className="flex items-center justify-end gap-2">
            {can("occurrence.update") && o.status !== "CRITICAL" && (
              <button onClick={() => escalate(o)} className="text-xs font-semibold text-amber-500 hover:underline">
                Escalar
              </button>
            )}
            {can("occurrence.resolve") && (
              <button
                onClick={() => {
                  setResolving(o);
                  setActionTaken("");
                }}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Resolver
              </button>
            )}
          </div>
        );
      },
    },
  ];

  if (list.isError) {
    return <ErrorState description="Não foi possível carregar as ocorrências." onRetry={() => list.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {can("occurrence.create") && (
          <button onClick={() => { setForm(EMPTY); setOpen(true); }} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition">
            + Nova ocorrência
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={list.isLoading}
        emptyTitle="Nenhuma ocorrência registrada"
        emptyDescription="Registre atrasos, acidentes ou reclamações para acompanhamento."
        {...(can("occurrence.create") ? { emptyActionLabel: "Nova ocorrência", onEmptyAction: () => { setForm(EMPTY); setOpen(true); } } : {})}
      />

      {/* Criar ocorrência */}
      <DrawerPanel isOpen={open} onClose={() => setOpen(false)} title="Nova ocorrência" size="md">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Tipo" required>
              <TextInput value={form.type} onChange={(e) => set("type", e.target.value)} placeholder="Atraso, Acidente…" />
            </FormField>
            <FormField label="Severidade" required>
              <SelectField value={form.severity} onChange={(e) => set("severity", e.target.value)} options={SEVERITY_OPTIONS} />
            </FormField>
          </div>
          <FormField label="Descrição" required>
            <TextareaField value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Descreva o que aconteceu…" />
          </FormField>
          <FormField label="Observações">
            <TextInput value={form.notes} onChange={(e) => set("notes", e.target.value)} />
          </FormField>
          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-900 pt-4">
            <button type="button" onClick={() => setOpen(false)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold">
              Cancelar
            </button>
            <button type="submit" disabled={save.isPending} className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-50">
              {save.isPending ? "Salvando…" : "Registrar"}
            </button>
          </div>
        </form>
      </DrawerPanel>

      {/* Resolver ocorrência (exige actionTaken) */}
      <DrawerPanel isOpen={!!resolving} onClose={() => setResolving(null)} title="Resolver ocorrência" size="md">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">{resolving?.description}</p>
          <FormField label="Ação tomada" required>
            <TextareaField value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} placeholder="Descreva a tratativa aplicada…" />
          </FormField>
          <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-900 pt-4">
            <button type="button" onClick={() => setResolving(null)} className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold">
              Cancelar
            </button>
            <button onClick={doResolve} className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold">
              Marcar como resolvida
            </button>
          </div>
        </div>
      </DrawerPanel>
    </div>
  );
}
