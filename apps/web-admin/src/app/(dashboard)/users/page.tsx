"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DrawerPanel,
  ErrorState,
  FormField,
  TextInput,
  SelectField,
  toast,
} from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useSave, useApiAction } from "../../../lib/hooks/crud";
import { request } from "../../../lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
}
interface Role {
  id: string;
  name: string;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  SUSPENDED: "Suspenso",
};
const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Ativo" },
  { value: "INACTIVE", label: "Inativo" },
  { value: "SUSPENDED", label: "Suspenso" },
];

interface UserForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  roleId: string;
}
const EMPTY: UserForm = { name: "", email: "", password: "", phone: "", roleId: "" };

export default function UsersPage() {
  const { can } = useAuth();
  const list = useList<User>("users", "/users", { limit: 100 });
  const save = useSave<User>("users", "/users", { onDone: () => setOpen(false) });
  const statusAction = useApiAction("users", { successMsg: "Status atualizado." });
  const rolesQuery = useQuery<Role[]>({ queryKey: ["roles"], queryFn: () => request("/roles") as Promise<Role[]> });

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<User | null>(null);
  const [form, setForm] = React.useState<UserForm>(EMPTY);

  const items = list.data?.data ?? [];
  const roleOptions = (rolesQuery.data ?? []).map((r) => ({ value: r.id, label: r.name }));

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setOpen(true);
  }
  function openEdit(u: User) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", phone: u.phone ?? "", roleId: "" });
    setOpen(true);
  }
  function set<K extends keyof UserForm>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) return toast.error("Nome obrigatório", "Informe o nome do usuário.");
    if (!editing) {
      if (!form.email.trim()) return toast.error("E-mail obrigatório", "Informe o e-mail.");
      if (form.password.length < 8) return toast.error("Senha inválida", "A senha deve ter no mínimo 8 caracteres.");
    }
    const data: Record<string, unknown> = { name: form.name.trim() };
    if (form.phone.trim()) data.phone = form.phone.trim();
    if (form.roleId) data.roleId = form.roleId;
    if (!editing) {
      data.email = form.email.trim().toLowerCase();
      data.password = form.password;
    }
    save.mutate(editing ? { id: editing.id, data } : { data });
  }

  function changeStatus(u: User, status: string) {
    if (status === u.status) return;
    statusAction.mutate(() =>
      request(`/users/${u.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
    );
  }

  const columns: ColumnDef<User, unknown>[] = [
    { accessorKey: "name", header: "Nome" },
    { accessorKey: "email", header: "E-mail" },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => STATUS_LABEL[row.original.status] ?? row.original.status,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        can("user.update") ? (
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => openEdit(row.original)} className="text-xs font-semibold text-primary hover:underline">
              Editar
            </button>
            <select
              value={row.original.status}
              onChange={(e) => changeStatus(row.original, e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-1.5 py-1 text-[11px] font-semibold"
              aria-label="Alterar status do usuário"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        ) : null,
    },
  ];

  if (list.isError) {
    return <ErrorState description="Não foi possível carregar os usuários." onRetry={() => list.refetch()} />;
  }

  const canManage = can("user.create");

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <button onClick={openCreate} className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition">
            + Criar usuário
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={list.isLoading}
        emptyTitle="Nenhum usuário cadastrado"
        emptyDescription="Crie o primeiro usuário do sistema."
        {...(canManage ? { emptyActionLabel: "Criar usuário", onEmptyAction: openCreate } : {})}
      />

      <DrawerPanel isOpen={open} onClose={() => setOpen(false)} title={editing ? "Editar usuário" : "Criar usuário"} size="md">
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Nome" required>
            <TextInput value={form.name} onChange={(e) => set("name", e.target.value)} />
          </FormField>
          <FormField label="E-mail" required={!editing}>
            <TextInput type="email" value={form.email} onChange={(e) => set("email", e.target.value)} disabled={!!editing} />
          </FormField>
          {!editing && (
            <FormField label="Senha inicial" required hint="Mínimo 8 caracteres.">
              <TextInput type="password" value={form.password} onChange={(e) => set("password", e.target.value)} />
            </FormField>
          )}
          <FormField label="Telefone">
            <TextInput value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </FormField>
          <FormField label="Cargo" {...(editing ? { hint: "Selecione para alterar o cargo." } : {})}>
            <SelectField
              value={form.roleId}
              onChange={(e) => set("roleId", e.target.value)}
              options={roleOptions}
              placeholder={rolesQuery.isLoading ? "Carregando cargos…" : "Selecione o cargo"}
            />
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
    </div>
  );
}
