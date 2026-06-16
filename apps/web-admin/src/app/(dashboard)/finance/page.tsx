"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
  KpiCard,
  DataTable,
  DrawerPanel,
  ConfirmModal,
  FormField,
  TextInput,
  TextareaField,
  SelectField,
  RankingChart,
  ErrorState,
  StatusBadge,
  toast,
} from "@gestao-fretamento-pro/ui";
import { DollarSign, Droplet, Wrench, TrendingUp } from "lucide-react";
import { useAuth } from "../../../lib/auth-context";
import { useSave, useRemove } from "../../../lib/hooks/crud";
import { request } from "../../../lib/api";

/** Resposta de GET /finance/summary. */
interface FinanceSummary {
  period: { from: string; to: string };
  totalRevenue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  margin: number;
}

/** Item de GET /finance/revenue-by-client (array). */
interface RevenueByClientItem {
  clientId: string;
  clientName: string;
  tripCount: number;
  totalTrips: number;
  completedTrips: number;
}

/** Item de GET /finance/cost-by-vehicle (array). */
interface CostByVehicleItem {
  vehicleId: string;
  vehiclePlate: string;
  vehicleType: string;
  fuelCost: number;
  maintenanceCost: number;
  totalCost: number;
  totalKm: number | null;
}

/** Resposta de GET /finance/cost-centers (array). */
interface CostCenter {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const NUM = new Intl.NumberFormat("pt-BR");

const TYPE_LABEL: Record<string, string> = {
  BUS: "Ônibus",
  VAN: "Van",
  MICRO_BUS: "Micro-ônibus",
};

/** Primeiro dia do mês corrente em formato yyyy-MM-dd. */
function firstOfMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Hoje em formato yyyy-MM-dd. */
function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

interface CostCenterForm {
  code: string;
  name: string;
  description: string;
  active: string;
}

const EMPTY_FORM: CostCenterForm = {
  code: "",
  name: "",
  description: "",
  active: "true",
};

const ACTIVE_OPTIONS = [
  { value: "true", label: "Ativo" },
  { value: "false", label: "Inativo" },
];

export default function FinancePage() {
  const { can } = useAuth();

  const [from, setFrom] = React.useState(firstOfMonth());
  const [to, setTo] = React.useState(today());

  const canRead = can("finance.read");
  const period = { from, to };

  const summary = useQuery<FinanceSummary>({
    queryKey: ["finance-summary", period],
    queryFn: () => request("/finance/summary", { params: period }) as Promise<FinanceSummary>,
    enabled: canRead,
  });

  const revenue = useQuery<RevenueByClientItem[]>({
    queryKey: ["finance-revenue-by-client", period],
    queryFn: () =>
      request("/finance/revenue-by-client", { params: period }) as Promise<RevenueByClientItem[]>,
    enabled: canRead,
  });

  const cost = useQuery<CostByVehicleItem[]>({
    queryKey: ["finance-cost-by-vehicle", period],
    queryFn: () =>
      request("/finance/cost-by-vehicle", { params: period }) as Promise<CostByVehicleItem[]>,
    enabled: canRead,
  });

  const costCenters = useQuery<CostCenter[]>({
    queryKey: ["finance-cost-centers"],
    queryFn: () => request("/finance/cost-centers") as Promise<CostCenter[]>,
    enabled: canRead,
  });

  const save = useSave<CostCenter>("finance-cost-centers", "/finance/cost-centers", {
    onDone: () => setDrawerOpen(false),
  });
  const remove = useRemove("finance-cost-centers", "/finance/cost-centers");

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CostCenter | null>(null);
  const [form, setForm] = React.useState<CostCenterForm>(EMPTY_FORM);
  const [toDelete, setToDelete] = React.useState<CostCenter | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDrawerOpen(true);
  }

  function openEdit(c: CostCenter) {
    setEditing(c);
    setForm({
      code: c.code,
      name: c.name,
      description: c.description ?? "",
      active: c.active ? "true" : "false",
    });
    setDrawerOpen(true);
  }

  function set<K extends keyof CostCenterForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing && form.code.trim().length === 0) {
      toast.error("Código obrigatório", "Informe o código do centro de custo.");
      return;
    }
    if (form.name.trim().length === 0) {
      toast.error("Nome obrigatório", "Informe o nome do centro de custo.");
      return;
    }

    if (editing) {
      // UpdateCostCenterDto não aceita `code`.
      const data: Record<string, unknown> = {
        name: form.name.trim(),
        active: form.active === "true",
      };
      if (form.description.trim()) data.description = form.description.trim();
      save.mutate({ id: editing.id, data });
    } else {
      const data: Record<string, unknown> = {
        code: form.code.trim(),
        name: form.name.trim(),
        active: form.active === "true",
      };
      if (form.description.trim()) data.description = form.description.trim();
      save.mutate({ data });
    }
  }

  const revenueItems = revenue.data ?? [];
  const costItems = cost.data ?? [];
  const costCenterItems = costCenters.data ?? [];

  const revenueChartData = React.useMemo(
    () => revenueItems.map((r) => ({ name: r.clientName, value: r.tripCount })),
    [revenueItems],
  );
  const costChartData = React.useMemo(
    () => costItems.map((c) => ({ name: c.vehiclePlate, value: c.totalCost })),
    [costItems],
  );

  const costColumns: ColumnDef<CostByVehicleItem, unknown>[] = [
    { accessorKey: "vehiclePlate", header: "Veículo" },
    {
      accessorKey: "vehicleType",
      header: "Tipo",
      cell: ({ row }) => TYPE_LABEL[row.original.vehicleType] ?? row.original.vehicleType,
    },
    {
      accessorKey: "fuelCost",
      header: "Combustível",
      cell: ({ row }) => BRL.format(row.original.fuelCost),
    },
    {
      accessorKey: "maintenanceCost",
      header: "Manutenção",
      cell: ({ row }) => BRL.format(row.original.maintenanceCost),
    },
    {
      accessorKey: "totalCost",
      header: "Custo total",
      cell: ({ row }) => (
        <span className="font-semibold">{BRL.format(row.original.totalCost)}</span>
      ),
    },
    {
      accessorKey: "totalKm",
      header: "Km no período",
      cell: ({ row }) => (row.original.totalKm != null ? `${NUM.format(row.original.totalKm)} km` : "—"),
    },
  ];

  const centerColumns: ColumnDef<CostCenter, unknown>[] = [
    { accessorKey: "code", header: "Código" },
    { accessorKey: "name", header: "Nome" },
    {
      accessorKey: "description",
      header: "Descrição",
      cell: ({ row }) => row.original.description ?? "—",
    },
    {
      accessorKey: "active",
      header: "Situação",
      cell: ({ row }) =>
        row.original.active ? (
          <StatusBadge status="vehicle-available" label="Ativo" />
        ) : (
          <StatusBadge status="vehicle-unavailable" label="Inativo" />
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          {can("finance.update") && (
            <button
              onClick={() => openEdit(row.original)}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Editar
            </button>
          )}
          {can("finance.update") && (
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

  if (!canRead) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 border border-slate-200 dark:border-slate-800 rounded-lg">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Acesso restrito ao módulo financeiro
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Você não possui permissão para visualizar dados financeiros.
        </p>
      </div>
    );
  }

  const margin = summary.data?.margin ?? 0;

  return (
    <div className="space-y-8">
      {/* Filtro de período */}
      <div className="flex flex-wrap items-end gap-3">
        <FormField label="De">
          <TextInput type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </FormField>
        <FormField label="Até">
          <TextInput type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </FormField>
      </div>

      {/* Seção 1: KPIs */}
      {summary.isError ? (
        <ErrorState
          description="Não foi possível carregar o resumo financeiro."
          onRetry={() => summary.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Receita do período"
            value={BRL.format(summary.data?.totalRevenue ?? 0)}
            loading={summary.isLoading}
            status="info"
            icon={<DollarSign className="w-4 h-4" />}
            description="Contratos ativos no período"
          />
          <KpiCard
            label="Custo com combustível"
            value={BRL.format(summary.data?.totalFuelCost ?? 0)}
            loading={summary.isLoading}
            status="warning"
            icon={<Droplet className="w-4 h-4" />}
          />
          <KpiCard
            label="Custo com manutenção"
            value={BRL.format(summary.data?.totalMaintenanceCost ?? 0)}
            loading={summary.isLoading}
            status="warning"
            icon={<Wrench className="w-4 h-4" />}
            description="Ordens concluídas no período"
          />
          <KpiCard
            label="Margem"
            value={BRL.format(margin)}
            loading={summary.isLoading}
            status={margin >= 0 ? "success" : "critical"}
            icon={<TrendingUp className="w-4 h-4" />}
            description="Receita menos custos"
          />
        </div>
      )}

      {/* Seção 2: Receita por cliente e custo por veículo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card text-card-foreground rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Viagens por cliente
          </h2>
          {revenue.isError ? (
            <ErrorState
              description="Não foi possível carregar a receita por cliente."
              onRetry={() => revenue.refetch()}
            />
          ) : revenue.isLoading ? (
            <p className="text-xs text-slate-400">Carregando…</p>
          ) : revenueChartData.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhuma viagem registrada no período.</p>
          ) : (
            <RankingChart data={revenueChartData} color="#3B82F6" />
          )}
        </div>

        <div className="bg-card text-card-foreground rounded-lg border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Custo por veículo
          </h2>
          {cost.isError ? (
            <ErrorState
              description="Não foi possível carregar o custo por veículo."
              onRetry={() => cost.refetch()}
            />
          ) : costChartData.length === 0 && !cost.isLoading ? (
            <p className="text-xs text-slate-400">Nenhum custo registrado no período.</p>
          ) : (
            <DataTable
              columns={costColumns}
              data={costItems}
              loading={cost.isLoading}
              emptyTitle="Sem custos no período"
              emptyDescription="Nenhum abastecimento ou manutenção foi lançado para os veículos."
            />
          )}
        </div>
      </div>

      {/* Seção 3: CRUD de Centros de Custo */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Centros de custo
          </h2>
          {can("finance.create") && (
            <button
              onClick={openCreate}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition"
            >
              + Novo centro de custo
            </button>
          )}
        </div>

        {costCenters.isError ? (
          <ErrorState
            description="Não foi possível carregar os centros de custo."
            onRetry={() => costCenters.refetch()}
          />
        ) : (
          <DataTable
            columns={centerColumns}
            data={costCenterItems}
            loading={costCenters.isLoading}
            emptyTitle="Nenhum centro de custo cadastrado"
            emptyDescription="Cadastre o primeiro centro de custo para organizar suas despesas."
            {...(can("finance.create")
              ? { emptyActionLabel: "Novo centro de custo", onEmptyAction: openCreate }
              : {})}
          />
        )}
      </div>

      {/* Drawer de criar/editar centro de custo */}
      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? `Editar centro de custo ${editing.code}` : "Novo centro de custo"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="Código"
            required={!editing}
            hint={editing ? "O código não pode ser alterado." : "Identificador único (máx. 30 caracteres)."}
          >
            <TextInput
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="CC-001"
              maxLength={30}
              disabled={!!editing}
            />
          </FormField>
          <FormField label="Nome" required>
            <TextInput
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Operação São Paulo"
              maxLength={100}
            />
          </FormField>
          <FormField label="Descrição">
            <TextareaField
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Detalhes opcionais sobre o centro de custo."
            />
          </FormField>
          <FormField label="Situação">
            <SelectField
              value={form.active}
              onChange={(e) => set("active", e.target.value)}
              options={ACTIVE_OPTIONS}
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
        title="Excluir centro de custo"
        description={
          toDelete
            ? `O centro de custo ${toDelete.code} — ${toDelete.name} será removido. Esta ação não pode ser desfeita.`
            : ""
        }
        confirmLabel="Excluir"
        isDestructive
      />
    </div>
  );
}
