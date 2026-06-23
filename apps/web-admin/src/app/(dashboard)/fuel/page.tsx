"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  KpiCard,
  AlertCard,
  FuelStockGauge,
  DrawerPanel,
  FormField,
  TextInput,
  SelectField,
  ErrorState,
  toast,
} from "@gestao-fretamento-pro/ui";
import {
  Droplet,
  AlertTriangle,
  Truck,
  TrendingUp,
  Gauge,
  Plus,
} from "lucide-react";
import { request } from "../../../lib/api";
import { useList, useSave } from "../../../lib/hooks/crud";
import { useAuth } from "../../../lib/auth-context";

interface FuelStats {
  totalLiters: number;
  totalCost: number;
  averageKmPerLiter: number | null;
  costPerKm: number | null;
  totalRecords: number;
}

interface FuelTankStockItem {
  tankId: string;
  tankName: string;
  currentVolumeLiters: number;
  capacityLiters: number;
  fillPercent: number;
}
interface FuelLitersByProductItem {
  fuelType: string;
  totalLiters: number;
  recordCount: number;
}
interface FuelAnalytics {
  stockByTank?: FuelTankStockItem[];
  litersByProduct?: FuelLitersByProductItem[];
  avgKmPerLiter?: number | null;
  deliveriesInPeriod?: number;
}

interface FuelAnomalyRecord {
  id: string;
  vehicleId: string;
  fuelType: string;
  liters: number;
  totalAmount: number;
  odometer: number;
  anomalyReason: string | null;
  suppliedAt: string;
}

interface Vehicle {
  id: string;
  plate: string;
  model: string | null;
}

const FUEL_OPTIONS = [
  { value: "DIESEL", label: "Diesel" },
  { value: "GASOLINE", label: "Gasolina" },
  { value: "ETHANOL", label: "Etanol" },
  { value: "GNV", label: "GNV" },
];

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

interface FuelForm {
  vehicleId: string;
  fuelType: string;
  liters: string;
  unitPrice: string;
  totalAmount: string;
  odometer: string;
  suppliedAt: string;
  fuelStationName: string;
  notes: string;
}

function emptyForm(): FuelForm {
  return {
    vehicleId: "",
    fuelType: "DIESEL",
    liters: "",
    unitPrice: "",
    totalAmount: "",
    odometer: "",
    suppliedAt: new Date().toISOString().slice(0, 16),
    fuelStationName: "",
    notes: "",
  };
}

export default function FuelDashboardPage() {
  const { can } = useAuth();

  const stats = useQuery<FuelStats>({
    queryKey: ["fuel-records", "stats"],
    queryFn: () => request("/fuel-records/stats") as Promise<FuelStats>,
  });
  const analytics = useQuery<FuelAnalytics>({
    queryKey: ["analytics", "fuel"],
    queryFn: () => request("/dashboards/fuel") as Promise<FuelAnalytics>,
  });
  const anomalies = useList<FuelAnomalyRecord>("fuel-records", "/fuel-records/anomalies", { limit: 50 });
  const vehicles = useList<Vehicle>("vehicles", "/vehicles", { limit: 100 });

  const save = useSave("fuel-records", "/fuel-records", {
    onDone: () => setDrawerOpen(false),
  });

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [form, setForm] = React.useState<FuelForm>(emptyForm());

  const s = stats.data ?? ({} as Partial<FuelStats>);
  const a = analytics.data ?? ({} as Partial<FuelAnalytics>);
  const tanks = a.stockByTank ?? [];
  const anomalyItems = anomalies.data?.data ?? [];
  const vehicleList = vehicles.data?.data ?? [];
  const plateById = new Map(vehicleList.map((v) => [v.id, v.plate]));

  const avgKmPerLiter = s.averageKmPerLiter ?? a.avgKmPerLiter ?? null;

  function set<K extends keyof FuelForm>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function openCreate() {
    setForm(emptyForm());
    setDrawerOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.vehicleId) {
      toast.error("Veículo obrigatório", "Selecione o veículo abastecido.");
      return;
    }
    const liters = Number(form.liters);
    const unitPrice = Number(form.unitPrice);
    const totalAmount = Number(form.totalAmount);
    const odometer = Number(form.odometer);
    if (!(liters > 0) || !(unitPrice > 0) || !(totalAmount > 0)) {
      toast.error("Valores inválidos", "Litros, preço/litro e valor total devem ser maiores que zero.");
      return;
    }
    if (!(odometer >= 0) || Number.isNaN(odometer)) {
      toast.error("Hodômetro inválido", "Informe a leitura do hodômetro.");
      return;
    }
    if (!form.suppliedAt) {
      toast.error("Data obrigatória", "Informe a data do abastecimento.");
      return;
    }

    const data: Record<string, unknown> = {
      vehicleId: form.vehicleId,
      fuelType: form.fuelType,
      liters,
      unitPrice,
      totalAmount,
      odometer,
      suppliedAt: new Date(form.suppliedAt).toISOString(),
    };
    if (form.fuelStationName.trim()) data.fuelStationName = form.fuelStationName.trim();
    if (form.notes.trim()) data.notes = form.notes.trim();

    // O hook useSave já exibe o erro do backend (ex.: hodômetro decremental)
    // via toast usando ApiError.message.
    save.mutate({ data });
  }

  const anomalyCount = anomalyItems.length;

  if (stats.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar os dados de combustível."
        onRetry={() => stats.refetch()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {can("fuel.create") && (
          <button
            onClick={openCreate}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Lançar abastecimento
          </button>
        )}
      </div>

      {/* Top operational metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Litros Abastecidos"
          value={`${(s.totalLiters ?? 0).toLocaleString("pt-BR")} L`}
          status="info"
          icon={<Droplet className="w-4 h-4 text-info" />}
          description={`${s.totalRecords ?? 0} abastecimentos no período`}
        />
        <KpiCard
          label="Custo Total"
          value={brl.format(s.totalCost ?? 0)}
          status="normal"
          icon={<TrendingUp className="w-4 h-4 text-primary" />}
          description="Gasto consolidado de combustível"
        />
        <KpiCard
          label="Média km/L"
          value={avgKmPerLiter != null ? avgKmPerLiter.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—"}
          status="success"
          icon={<Gauge className="w-4 h-4 text-success" />}
          description={s.costPerKm != null ? `${brl.format(s.costPerKm)} por km` : "Rendimento médio da frota"}
        />
        <KpiCard
          label="Divergências"
          value={anomalyCount > 0 ? `${anomalyCount} alerta(s)` : "Sem alertas"}
          trend={anomalyCount > 0 ? "Revisar" : "OK"}
          status={anomalyCount > 0 ? "warning" : "success"}
          icon={<AlertTriangle className="w-4 h-4 text-warning" />}
          description="Abastecimentos com anomalia detectada"
        />
      </div>

      {/* Active Tank Levels (FuelStockGauges) */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-bold text-foreground">Status dos Tanques Compartilhados</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Monitoramento ativo de tanques internos</p>
        </div>
        {tanks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tanks.map((t) => (
              <FuelStockGauge
                key={t.tankId}
                name={t.tankName}
                capacity={t.capacityLiters}
                currentLevel={t.currentVolumeLiters}
                thresholdPercent={20}
              />
            ))}
          </div>
        ) : (
          <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl text-center text-xs text-slate-400">
            Nenhum tanque interno cadastrado.
          </div>
        )}
      </div>

      {/* Main Fueling Alert (only when anomalies exist) */}
      {anomalyCount > 0 && anomalyItems[0] && (
        <AlertCard
          severity="warning"
          title="Anomalia de Abastecimento Detectada"
          description={
            anomalyItems[0].anomalyReason ??
            `Abastecimento do veículo ${plateById.get(anomalyItems[0].vehicleId) ?? anomalyItems[0].vehicleId} marcado para auditoria.`
          }
        />
      )}

      {/* Bottom panels: liters by product and Anomalies */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Anomalies panel */}
        <div className="lg:col-span-2 bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-4 h-4 text-warning" /> Abastecimentos com Divergência
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Registros sinalizados para auditoria</p>
          </div>

          {anomalyItems.length > 0 ? (
            <div className="space-y-3">
              {anomalyItems.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 bg-slate-50 dark:bg-[#0B1220]/40 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{plateById.get(rec.vehicleId) ?? rec.vehicleId}</span>
                      <span className="text-[9px] font-mono bg-slate-700 px-2 py-0.5 rounded text-slate-300">{rec.fuelType}</span>
                    </div>
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      Anomalia
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-medium text-slate-400">
                    <div>
                      <span className="block uppercase text-[8px] font-bold">Litros</span>
                      <span className="text-slate-200">{rec.liters.toLocaleString("pt-BR")} L</span>
                    </div>
                    <div>
                      <span className="block uppercase text-[8px] font-bold">Valor</span>
                      <span className="text-slate-200">{brl.format(rec.totalAmount)}</span>
                    </div>
                    <div>
                      <span className="block uppercase text-[8px] font-bold">Hodômetro</span>
                      <span className="text-slate-200">{rec.odometer.toLocaleString("pt-BR")} km</span>
                    </div>
                    <div>
                      <span className="block uppercase text-[8px] font-bold">Data</span>
                      <span className="text-slate-200">{new Date(rec.suppliedAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>

                  {rec.anomalyReason && (
                    <p className="text-[11px] text-amber-500/90 font-medium">{rec.anomalyReason}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">Nenhuma divergência registrada.</p>
          )}
        </div>

        {/* Liters by product panel */}
        <div className="bg-card p-6 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground">
              <Droplet className="w-4 h-4 text-primary" /> Consumo por Produto
            </h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Litros por tipo de combustível</p>
          </div>

          {(a.litersByProduct ?? []).length > 0 ? (
            <div className="space-y-3">
              {(a.litersByProduct ?? []).map((p) => (
                <div
                  key={p.fuelType}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B1220]/40 rounded-xl border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                      <Droplet className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">{p.fuelType}</span>
                      <span className="text-[8px] text-slate-400 uppercase font-semibold">{p.recordCount} registros</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200">{p.totalLiters.toLocaleString("pt-BR")} L</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">Sem dados de consumo no período.</p>
          )}
        </div>
      </div>

      {/* Drawer: lançar abastecimento */}
      <DrawerPanel
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Lançar abastecimento"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Veículo" required>
            <SelectField
              value={form.vehicleId}
              onChange={(e) => set("vehicleId", e.target.value)}
              options={vehicleList.map((v) => ({
                value: v.id,
                label: v.model ? `${v.plate} — ${v.model}` : v.plate,
              }))}
              placeholder="Selecione o veículo"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Combustível" required>
              <SelectField
                value={form.fuelType}
                onChange={(e) => set("fuelType", e.target.value)}
                options={FUEL_OPTIONS}
              />
            </FormField>
            <FormField label="Hodômetro (km)" required>
              <TextInput
                type="number"
                min={0}
                value={form.odometer}
                onChange={(e) => set("odometer", e.target.value)}
                placeholder="124890"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormField label="Litros" required>
              <TextInput
                type="number"
                step="0.01"
                min={0}
                value={form.liters}
                onChange={(e) => set("liters", e.target.value)}
                placeholder="150"
              />
            </FormField>
            <FormField label="Preço/Litro" required>
              <TextInput
                type="number"
                step="0.01"
                min={0}
                value={form.unitPrice}
                onChange={(e) => set("unitPrice", e.target.value)}
                placeholder="5.78"
              />
            </FormField>
            <FormField label="Valor Total" required>
              <TextInput
                type="number"
                step="0.01"
                min={0}
                value={form.totalAmount}
                onChange={(e) => set("totalAmount", e.target.value)}
                placeholder="867.00"
              />
            </FormField>
          </div>

          <FormField label="Data do abastecimento" required>
            <TextInput
              type="datetime-local"
              value={form.suppliedAt}
              onChange={(e) => set("suppliedAt", e.target.value)}
            />
          </FormField>

          <FormField label="Posto / Fornecedor">
            <TextInput
              value={form.fuelStationName}
              onChange={(e) => set("fuelStationName", e.target.value)}
              placeholder="Ipiranga, Tanque interno…"
            />
          </FormField>

          <FormField label="Observações">
            <TextInput value={form.notes} onChange={(e) => set("notes", e.target.value)} />
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
              {save.isPending ? "Salvando…" : "Registrar"}
            </button>
          </div>
        </form>
      </DrawerPanel>
    </div>
  );
}
