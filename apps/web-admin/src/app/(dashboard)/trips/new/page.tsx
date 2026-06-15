"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FormField, TextInput, SelectField, type SelectFieldOption, toast } from "@gestao-fretamento-pro/ui";
import { useList, useSave } from "../../../../lib/hooks/crud";

interface Client { id: string; name: string }
interface Route { id: string; name: string }
interface Vehicle { id: string; plate: string; status: string }
interface Driver { id: string; licenseNumber: string; employee?: { name: string } | null }

export default function NewTripPage() {
  const router = useRouter();

  const clients = useList<Client>("clients", "/clients", { limit: 100 });
  const routes = useList<Route>("routes", "/routes", { limit: 100 });
  const vehicles = useList<Vehicle>("vehicles", "/vehicles", { limit: 100 });
  const drivers = useList<Driver>("drivers", "/drivers", { limit: 100 });

  const save = useSave("trips", "/trips", { onDone: () => router.push("/trips") });

  const [clientId, setClientId] = React.useState("");
  const [routeId, setRouteId] = React.useState("");
  const [vehicleId, setVehicleId] = React.useState("");
  const [driverId, setDriverId] = React.useState("");
  const [scheduledStartAt, setScheduledStartAt] = React.useState("");
  const [passengerCount, setPassengerCount] = React.useState("");
  const [notes, setNotes] = React.useState("");

  const clientOpts: SelectFieldOption[] = (clients.data?.data ?? []).map((c) => ({ value: c.id, label: c.name }));
  const routeOpts: SelectFieldOption[] = (routes.data?.data ?? []).map((r) => ({ value: r.id, label: r.name }));
  const vehicleOpts: SelectFieldOption[] = (vehicles.data?.data ?? [])
    .filter((v) => v.status === "AVAILABLE")
    .map((v) => ({ value: v.id, label: v.plate }));
  const driverOpts: SelectFieldOption[] = (drivers.data?.data ?? []).map((d) => ({
    value: d.id,
    label: d.employee?.name ?? `CNH ${d.licenseNumber}`,
  }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!scheduledStartAt) {
      toast.error("Data obrigatória", "Informe a data/hora de início da viagem.");
      return;
    }
    const data: Record<string, unknown> = { scheduledStartAt: new Date(scheduledStartAt).toISOString() };
    if (clientId) data.clientId = clientId;
    if (routeId) data.routeId = routeId;
    if (vehicleId) data.vehicleId = vehicleId;
    if (driverId) data.driverId = driverId;
    if (passengerCount.trim()) data.passengerCount = Number(passengerCount);
    if (notes.trim()) data.notes = notes.trim();
    save.mutate({ data });
  }

  return (
    <div className="max-w-2xl mx-auto bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-8">
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Cliente">
            <SelectField
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              options={clientOpts}
              placeholder={clients.isLoading ? "Carregando…" : "Selecione o cliente"}
            />
          </FormField>
          <FormField label="Rota">
            <SelectField
              value={routeId}
              onChange={(e) => setRouteId(e.target.value)}
              options={routeOpts}
              placeholder={routes.isLoading ? "Carregando…" : "Selecione a rota"}
            />
          </FormField>
          <FormField label="Veículo" hint="Apenas veículos disponíveis.">
            <SelectField
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              options={vehicleOpts}
              placeholder={vehicles.isLoading ? "Carregando…" : "Selecione o veículo"}
            />
          </FormField>
          <FormField label="Motorista">
            <SelectField
              value={driverId}
              onChange={(e) => setDriverId(e.target.value)}
              options={driverOpts}
              placeholder={drivers.isLoading ? "Carregando…" : "Selecione o motorista"}
            />
          </FormField>
          <FormField label="Início (data/hora)" required>
            <TextInput
              type="datetime-local"
              value={scheduledStartAt}
              onChange={(e) => setScheduledStartAt(e.target.value)}
            />
          </FormField>
          <FormField label="Nº de passageiros">
            <TextInput type="number" min={0} value={passengerCount} onChange={(e) => setPassengerCount(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Observações">
          <TextInput value={notes} onChange={(e) => setNotes(e.target.value)} />
        </FormField>

        <div className="flex justify-between border-t border-slate-100 dark:border-slate-900 pt-4">
          <button
            type="button"
            onClick={() => router.push("/trips")}
            className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={save.isPending}
            className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold disabled:opacity-50"
          >
            {save.isPending ? "Criando…" : "Criar viagem"}
          </button>
        </div>
      </form>
    </div>
  );
}
