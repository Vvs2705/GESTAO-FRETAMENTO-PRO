"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  DataTable,
  DrawerPanel,
  ConfirmModal,
  ErrorState,
  FormField,
  TextInput,
  NumberInput,
  toast,
} from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useSave, useRemove, useApiAction } from "../../../lib/hooks/crud";
import { request } from "../../../lib/api";

/* ------------------------------------------------------------------ */
/* Tipos (derivados dos contratos reais da api-core)                   */
/* ------------------------------------------------------------------ */

interface Tenant {
  id: string;
  name: string;
  tradeName: string | null;
  document: string;
  plan: string;
  status: string;
}

interface Branch {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  address: string | null;
  phone: string | null;
  status: string;
}

interface Role {
  id: string;
  name: string;
  department: string | null;
  hierarchyLevel: number;
  description: string | null;
  isSystem: boolean;
  _count?: { rolePermissions: number };
}

type Tab = "company" | "branches" | "roles";

const TABS: { value: Tab; label: string }[] = [
  { value: "company", label: "Dados da empresa" },
  { value: "branches", label: "Filiais" },
  { value: "roles", label: "Cargos & permissões" },
];

/* ------------------------------------------------------------------ */
/* Página                                                              */
/* ------------------------------------------------------------------ */

export default function SettingsPage() {
  const { can } = useAuth();
  // Cargo admin como proxy para editar dados sensíveis da organização.
  const isAdmin = can("role.manage");
  const [tab, setTab] = React.useState<Tab>("company");

  return (
    <div className="space-y-6">
      <nav className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={
              tab === t.value
                ? "px-4 py-2 text-xs font-semibold border-b-2 border-primary text-primary"
                : "px-4 py-2 text-xs font-semibold border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "company" && <CompanySection canEdit={isAdmin} />}
      {tab === "branches" && <BranchesSection />}
      {tab === "roles" && <RolesSection />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1) Dados da empresa                                                 */
/* ------------------------------------------------------------------ */

function CompanySection({ canEdit }: { canEdit: boolean }) {
  const tenant = useQuery<Tenant>({
    queryKey: ["tenant-current"],
    queryFn: () => request("/tenants/current") as Promise<Tenant>,
  });
  const save = useApiAction("tenant-current", { successMsg: "Dados da empresa atualizados." });

  const [name, setName] = React.useState("");
  const [tradeName, setTradeName] = React.useState("");

  React.useEffect(() => {
    if (tenant.data) {
      setName(tenant.data.name ?? "");
      setTradeName(tenant.data.tradeName ?? "");
    }
  }, [tenant.data]);

  if (tenant.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar os dados da empresa."
        onRetry={() => tenant.refetch()}
      />
    );
  }

  if (tenant.isLoading || !tenant.data) {
    return <p className="text-xs text-slate-400">Carregando dados da empresa…</p>;
  }

  const data = tenant.data;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Nome inválido", "Informe a razão social (mín. 2 caracteres).");
      return;
    }
    const body: Record<string, unknown> = { name: name.trim() };
    if (tradeName.trim()) body.tradeName = tradeName.trim();
    save.mutate(() =>
      request("/tenants/current", { method: "PATCH", body: JSON.stringify(body) }),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
      <FormField label="Razão social" required>
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={!canEdit}
          maxLength={200}
          placeholder="Empresa de Fretamento Ltda."
        />
      </FormField>

      <FormField label="Nome fantasia">
        <TextInput
          value={tradeName}
          onChange={(e) => setTradeName(e.target.value)}
          disabled={!canEdit}
          maxLength={200}
          placeholder="Nome comercial"
        />
      </FormField>

      <div className="grid grid-cols-2 gap-3">
        <FormField label="CNPJ" hint="Documento fiscal (somente leitura).">
          <TextInput value={data.document} disabled readOnly />
        </FormField>
        <FormField label="Plano" hint="Gerido pela administração da plataforma.">
          <TextInput value={data.plan} disabled readOnly />
        </FormField>
      </div>

      {canEdit ? (
        <div className="flex justify-end border-t border-slate-100 dark:border-slate-900 pt-4">
          <button
            type="submit"
            disabled={save.isPending}
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {save.isPending ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      ) : (
        <p className="text-[11px] text-slate-400">
          Você não tem permissão para editar os dados da empresa.
        </p>
      )}
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* 2) Filiais                                                          */
/* ------------------------------------------------------------------ */

interface BranchForm {
  name: string;
  city: string;
  state: string;
  address: string;
  phone: string;
}

const EMPTY_BRANCH: BranchForm = { name: "", city: "", state: "", address: "", phone: "" };

function BranchesSection() {
  const { can } = useAuth();
  const branches = useQuery<Branch[]>({
    queryKey: ["branches"],
    queryFn: () => request("/tenants/branches") as Promise<Branch[]>,
  });
  const save = useSave<Branch>("branches", "/tenants/branches", {
    onDone: () => setDrawerOpen(false),
  });

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Branch | null>(null);
  const [form, setForm] = React.useState<BranchForm>(EMPTY_BRANCH);

  const items = branches.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_BRANCH);
    setDrawerOpen(true);
  }

  function openEdit(b: Branch) {
    setEditing(b);
    setForm({
      name: b.name,
      city: b.city,
      state: b.state,
      address: b.address ?? "",
      phone: b.phone ?? "",
    });
    setDrawerOpen(true);
  }

  function set<K extends keyof BranchForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Nome inválido", "Informe o nome da filial (mín. 2 caracteres).");
      return;
    }
    if (form.city.trim().length < 2) {
      toast.error("Cidade inválida", "Informe a cidade da filial.");
      return;
    }
    if (form.state.trim().length !== 2) {
      toast.error("UF inválida", "Informe a sigla do estado com 2 letras (ex.: SP).");
      return;
    }
    const data: Record<string, unknown> = {
      name: form.name.trim(),
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
    };
    if (form.address.trim()) data.address = form.address.trim();
    if (form.phone.trim()) data.phone = form.phone.trim();

    save.mutate(editing ? { id: editing.id, data } : { data });
  }

  const columns: ColumnDef<Branch, unknown>[] = [
    { accessorKey: "name", header: "Filial" },
    { accessorKey: "city", header: "Cidade" },
    { accessorKey: "state", header: "UF" },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => row.original.phone ?? "—",
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) =>
        can("branch.update") ? (
          <div className="flex items-center justify-end">
            <button
              onClick={() => openEdit(row.original)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Editar
            </button>
          </div>
        ) : null,
    },
  ];

  if (branches.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar as filiais."
        onRetry={() => branches.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {can("branch.create") && (
          <button
            onClick={openCreate}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
          >
            + Cadastrar filial
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={branches.isLoading}
        emptyTitle="Nenhuma filial cadastrada"
        emptyDescription="Cadastre a primeira filial da empresa."
        {...(can("branch.create")
          ? { emptyActionLabel: "Cadastrar filial", onEmptyAction: openCreate }
          : {})}
      />

      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? `Editar filial ${editing.name}` : "Cadastrar filial"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nome" required>
            <TextInput
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={200}
            />
          </FormField>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <FormField label="Cidade" required>
                <TextInput
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  maxLength={100}
                />
              </FormField>
            </div>
            <FormField label="UF" required>
              <TextInput
                value={form.state}
                onChange={(e) => set("state", e.target.value.toUpperCase())}
                maxLength={2}
                placeholder="SP"
              />
            </FormField>
          </div>
          <FormField label="Endereço">
            <TextInput
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              maxLength={500}
            />
          </FormField>
          <FormField label="Telefone">
            <TextInput
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              maxLength={30}
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3) Cargos & permissões                                              */
/* ------------------------------------------------------------------ */

interface RoleForm {
  name: string;
  department: string;
  hierarchyLevel: string;
  description: string;
}

const EMPTY_ROLE: RoleForm = { name: "", department: "", hierarchyLevel: "0", description: "" };

function RolesSection() {
  const { can } = useAuth();
  const canManage = can("role.manage");
  const roles = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: () => request("/roles") as Promise<Role[]>,
  });
  const save = useSave<Role>("roles", "/roles", { onDone: () => setDrawerOpen(false) });
  const remove = useRemove("roles", "/roles");

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Role | null>(null);
  const [form, setForm] = React.useState<RoleForm>(EMPTY_ROLE);
  const [toDelete, setToDelete] = React.useState<Role | null>(null);

  const items = roles.data ?? [];

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_ROLE);
    setDrawerOpen(true);
  }

  function openEdit(r: Role) {
    setEditing(r);
    setForm({
      name: r.name,
      department: r.department ?? "",
      hierarchyLevel: String(r.hierarchyLevel ?? 0),
      description: r.description ?? "",
    });
    setDrawerOpen(true);
  }

  function set<K extends keyof RoleForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.name.trim().length < 2) {
      toast.error("Nome inválido", "Informe o nome do cargo (mín. 2 caracteres).");
      return;
    }
    const level = Number(form.hierarchyLevel);
    if (!Number.isInteger(level) || level < 0 || level > 10) {
      toast.error("Nível inválido", "O nível hierárquico deve ser um inteiro entre 0 e 10.");
      return;
    }
    const data: Record<string, unknown> = {
      name: form.name.trim(),
      hierarchyLevel: level,
    };
    if (form.department.trim()) data.department = form.department.trim();
    if (form.description.trim()) data.description = form.description.trim();

    save.mutate(editing ? { id: editing.id, data } : { data });
  }

  const columns: ColumnDef<Role, unknown>[] = [
    {
      accessorKey: "name",
      header: "Cargo",
      cell: ({ row }) => (
        <span className="flex items-center gap-2">
          {row.original.name}
          {row.original.isSystem && (
            <span className="text-[10px] font-semibold text-slate-400 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
              Sistema
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: "department",
      header: "Departamento",
      cell: ({ row }) => row.original.department ?? "—",
    },
    { accessorKey: "hierarchyLevel", header: "Nível" },
    {
      id: "permissions",
      header: "Permissões",
      cell: ({ row }) => row.original._count?.rolePermissions ?? 0,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        if (row.original.isSystem || !canManage) return null;
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => openEdit(row.original)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Editar
            </button>
            <button
              onClick={() => setToDelete(row.original)}
              className="text-xs font-semibold text-red-500 hover:underline"
            >
              Excluir
            </button>
          </div>
        );
      },
    },
  ];

  if (roles.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar os cargos."
        onRetry={() => roles.refetch()}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {canManage && (
          <button
            onClick={openCreate}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
          >
            + Criar cargo
          </button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={roles.isLoading}
        emptyTitle="Nenhum cargo cadastrado"
        emptyDescription="Crie o primeiro cargo para organizar as permissões da equipe."
        {...(canManage ? { emptyActionLabel: "Criar cargo", onEmptyAction: openCreate } : {})}
      />

      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? `Editar cargo ${editing.name}` : "Criar cargo"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Nome do cargo" required>
            <TextInput
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={100}
              placeholder="Gerente Operacional"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Departamento">
              <TextInput
                value={form.department}
                onChange={(e) => set("department", e.target.value)}
                maxLength={100}
                placeholder="Operações"
              />
            </FormField>
            <FormField label="Nível hierárquico" hint="0 (mais alto) a 10.">
              <NumberInput
                min={0}
                max={10}
                value={form.hierarchyLevel}
                onChange={(e) => set("hierarchyLevel", e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Descrição">
            <TextInput
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              maxLength={500}
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
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) remove.mutate(toDelete.id);
          setToDelete(null);
        }}
        title="Excluir cargo"
        description={
          toDelete
            ? `O cargo ${toDelete.name} será removido. Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        isDestructive
      />
    </div>
  );
}
