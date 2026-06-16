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

interface Client {
  id: string;
  name: string;
  document: string | null;
  contactName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  address: string | null;
  notes: string | null;
  status: string;
}

interface ClientForm {
  name: string;
  document: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  notes: string;
}
const EMPTY: ClientForm = {
  name: "",
  document: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  address: "",
  notes: "",
};

export default function ClientsPage() {
  const { can } = useAuth();
  const list = useList<Client>("clients", "/clients", { limit: 100 });
  const save = useSave<Client>("clients", "/clients", { onDone: () => setOpen(false) });
  const remove = useRemove("clients", "/clients");

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Client | null>(null);
  const [form, setForm] = React.useState<ClientForm>(EMPTY);
  const [toDelete, setToDelete] = React.useState<Client | null>(null);

  const items = list.data?.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function openEdit(c: Client) {
    setEditing(c);
    setForm({
      name: c.name,
      document: c.document ?? "",
      contactName: c.contactName ?? "",
      contactEmail: c.contactEmail ?? "",
      contactPhone: c.contactPhone ?? "",
      address: c.address ?? "",
      notes: c.notes ?? "",
    });
    setOpen(true);
  }
  function set<K extends keyof ClientForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Nome obrigatório", "Informe o nome do cliente.");
    const data: Record<string, unknown> = { name: form.name.trim() };
    if (form.document.trim()) data.document = form.document.trim();
    if (form.contactName.trim()) data.contactName = form.contactName.trim();
    if (form.contactEmail.trim()) data.contactEmail = form.contactEmail.trim();
    if (form.contactPhone.trim()) data.contactPhone = form.contactPhone.trim();
    if (form.address.trim()) data.address = form.address.trim();
    if (form.notes.trim()) data.notes = form.notes.trim();
    save.mutate(editing ? { id: editing.id, data } : { data });
  }

  const columns: ColumnDef<Client, unknown>[] = [
    { accessorKey: "name", header: "Cliente" },
    { accessorKey: "document", header: "Documento", cell: ({ row }) => row.original.document ?? "—" },
    { accessorKey: "contactName", header: "Contato", cell: ({ row }) => row.original.contactName ?? "—" },
    { accessorKey: "contactPhone", header: "Telefone", cell: ({ row }) => row.original.contactPhone ?? "—" },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {can("client.update") && (
            <button onClick={() => openEdit(row.original)} className="text-xs font-semibold text-primary hover:underline">
              Editar
            </button>
          )}
          {can("client.delete") && (
            <button onClick={() => setToDelete(row.original)} className="text-xs font-semibold text-red-500 hover:underline">
              Excluir
            </button>
          )}
        </div>
      ),
    },
  ];

  if (list.isError) {
    return <ErrorState description="Não foi possível carregar os clientes." onRetry={() => list.refetch()} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {can("client.create") && (
          <button onClick={openCreate} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition">
            + Novo cliente
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={list.isLoading}
        emptyTitle="Nenhum cliente cadastrado"
        emptyDescription="Cadastre o primeiro cliente para vincular contratos e viagens."
        {...(can("client.create") ? { emptyActionLabel: "Novo cliente", onEmptyAction: openCreate } : {})}
      />

      <DrawerPanel isOpen={open} onClose={() => setOpen(false)} title={editing ? "Editar cliente" : "Novo cliente"} size="md">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nome / Razão social" required>
            <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
          </FormField>
          <FormField label="Documento (CNPJ/CPF)">
            <TextInput value={form.document} onChange={(e) => set("document", e.target.value)} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contato">
              <TextInput value={form.contactName} onChange={(e) => set("contactName", e.target.value)} />
            </FormField>
            <FormField label="Telefone">
              <TextInput value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
            </FormField>
          </div>
          <FormField label="E-mail">
            <TextInput type="email" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          </FormField>
          <FormField label="Endereço">
            <TextInput value={form.address} onChange={(e) => set("address", e.target.value)} />
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
        title="Excluir cliente"
        description={toDelete ? `O cliente ${toDelete.name} será removido.` : ""}
        confirmLabel="Excluir"
        isDestructive
      />
    </div>
  );
}
