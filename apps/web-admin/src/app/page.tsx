"use client";

import * as React from "react";
import {
  StatusBadge,
  KpiCard,
  AlertCard,
  DataTable,
  FilterBar,
  Timeline,
  ConfirmModal,
  DrawerPanel,
  CommandPalette,
} from "@gestao-fretamento-pro/ui";
import { MapPin, Truck, Users, Plus, Layers } from "lucide-react";

export default function HomePage() {
  const [period, setPeriod] = React.useState("month");
  const [tenant, setTenant] = React.useState("");
  const [filial, setFilial] = React.useState("");

  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = React.useState(false);

  React.useEffect(() => {
    const handleGlobalPalette = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalPalette);
    return () => window.removeEventListener("keydown", handleGlobalPalette);
  }, []);

  const commandItems = [
    {
      id: "cmd-new-trip",
      title: "Criar Nova Viagem",
      subtitle: "Wizard de alocação de viagem",
      category: "acoes" as const,
      action: () => alert("Ação: Criar Nova Viagem"),
      icon: <Plus className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: "cmd-trip-1",
      title: "Viagem #4829 - Rota Campinas Executivo",
      subtitle: "Em andamento - Motorista: José Silva",
      category: "viagens" as const,
      action: () => setIsDrawerOpen(true),
    },
    {
      id: "cmd-veh-1",
      title: "Veículo ABC-1234 (Marcopolo Paradiso)",
      subtitle: "Disponível - Próxima revisão em 2.500 km",
      category: "veiculos" as const,
      action: () => alert("Visualizar Veículo ABC-1234"),
    },
    {
      id: "cmd-drv-1",
      title: "José Silva (CNH E - Venc. 12/2026)",
      subtitle: "Escalado na Viagem #4829",
      category: "motoristas" as const,
      action: () => alert("Visualizar Motorista José Silva"),
    },
    {
      id: "cmd-settings",
      title: "Configurações do Tenant",
      subtitle: "Parâmetros globais do sistema",
      category: "atalhos" as const,
      action: () => alert("Ir para Configurações"),
    },
  ];

  const timelineItems = [
    {
      id: 1,
      title: "Viagem Concluída",
      description: "José Silva encerrou a viagem com sucesso na filial Campinas.",
      timestamp: "Hoje, 10:45",
      status: "success" as const,
    },
    {
      id: 2,
      title: "Ocorrência Grave",
      description: "Pneu furado na rodovia Anhanguera. Veículo substituído pelo suporte.",
      timestamp: "Ontem, 16:30",
      status: "error" as const,
    },
    {
      id: 3,
      title: "Viagem Iniciada",
      description: "Viagem confirmada com 32 passageiros embarcados.",
      timestamp: "Ontem, 14:00",
      status: "active" as const,
    },
  ];

  const columns = [
    {
      accessorKey: "id",
      header: "ID/Número",
    },
    {
      accessorKey: "client",
      header: "Cliente",
    },
    {
      accessorKey: "route",
      header: "Rota",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }: any) => {
        const val = getValue();
        return <StatusBadge status={val} />;
      },
    },
  ];

  const data = [
    {
      id: "#4829",
      client: "Dell Computadores",
      route: "Campinas ➔ SP Centro",
      status: "trip-in-progress" as const,
    },
    {
      id: "#4828",
      client: "Bosch Tecnologia",
      route: "Valinhos ➔ Hortolândia",
      status: "trip-completed" as const,
    },
    {
      id: "#4827",
      client: "Unicamp Turismo",
      route: "Barão Geraldo ➔ Congonhas",
      status: "trip-delayed" as const,
    },
  ];

  return (
    <main className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase mb-1">
            <Layers className="w-4 h-4" />
            Gestão Fretamento Pro
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-50 tracking-tight">
            Painel Operacional — Fase 1
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Verifique abaixo a renderização correta de design tokens e componentes fundamentais.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setIsPaletteOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm transition-all select-none flex items-center gap-2"
          >
            <span className="font-mono text-[10px] bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded border border-slate-300/40 dark:border-slate-700/40">
              Ctrl+K
            </span>
            Busca Global
          </button>
        </div>
      </div>

      <FilterBar
        selectedPeriod={period}
        selectedTenant={tenant}
        selectedFilial={filial}
        onPeriodChange={setPeriod}
        onTenantChange={setTenant}
        onFilialChange={setFilial}
        tenants={[
          { id: "ten_1", name: "Empresa Alfa Transportes" },
          { id: "ten_2", name: "Empresa Beta Turismo" },
        ]}
        filiais={[
          { id: "fil_1", name: "Filial Principal" },
          { id: "fil_2", name: "Filial Campinas" },
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Viagens Ativas"
          value={12}
          trend="+15%"
          trendDirection="up"
          description="Viagens gerenciadas no momento"
          status="info"
          icon={<MapPin className="w-5 h-5" />}
        />
        <KpiCard
          label="Frota Disponível"
          value="94%"
          trend="+1.2%"
          trendDirection="up"
          description="Disponibilidade operacional"
          status="success"
          icon={<Truck className="w-5 h-5" />}
        />
        <KpiCard
          label="Ocorrências Críticas"
          value={3}
          trend="-2"
          trendDirection="down"
          description="Ações operacionais necessárias"
          status="critical"
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          label="Consumo Estimado"
          value="-- --"
          loading={true}
          description="Carregando telemetria..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AlertCard
          severity="critical"
          title="Alerta Crítico: Manutenção Reincidente"
          description="Veículo ABC-1234 registrou 3 falhas de motor nos últimos 15 dias. Deslocamento suspenso."
          actionLabel="Agendar OS"
          onAction={() => alert("Abrindo Ordem de Serviço...")}
        />
        <AlertCard
          severity="success"
          title="Atualização Concluída"
          description="Os design tokens semânticos e primitivos foram carregados com sucesso no escopo :root."
          onClose={() => alert("Alerta fechado")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Monitoramento de Viagens
          </h2>
          <DataTable
            columns={columns}
            data={data}
            onRowClick={() => {
              setIsDrawerOpen(true);
            }}
          />
        </div>

        <div className="space-y-3 p-6 bg-card border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
            Auditoria / Histórico
          </h2>
          <Timeline items={timelineItems} />
        </div>
      </div>

      <div className="flex gap-2 justify-center border-t border-slate-200 dark:border-slate-800 pt-6">
        <button
          onClick={() => setIsConfirmOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition-all select-none"
        >
          Excluir Registro
        </button>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 text-xs font-semibold bg-primary hover:opacity-90 text-white rounded-lg shadow transition-all select-none"
        >
          Detalhes da Viagem
        </button>
      </div>

      <ConfirmModal
        isOpen={isConfirmOpen}
        isDestructive={true}
        title="Deseja realmente excluir este registro?"
        description="Esta ação é permanente e não poderá ser desfeita. Todos os relatórios auditáveis desta viagem serão excluídos permanentemente."
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={async () => {
          setIsConfirmOpen(false);
          alert("Registro excluído.");
        }}
      />

      <DrawerPanel
        isOpen={isDrawerOpen}
        title="Detalhes da Viagem #4829"
        onClose={() => setIsDrawerOpen(false)}
        footer={
          <>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors select-none"
            >
              Fechar
            </button>
            <button
              onClick={() => alert("Reenviar dados")}
              className="px-3.5 py-2 text-xs font-semibold bg-primary text-white rounded-lg shadow hover:opacity-90 select-none"
            >
              Reenviar Telemetria
            </button>
          </>
        }
      >
        <div className="space-y-6">
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Status da Viagem
            </div>
            <StatusBadge status="trip-in-progress" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                Rota
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Campinas ➔ SP Centro
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                Motorista
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                José Silva
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                Veículo
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                ABC-1234 (Marcopolo)
              </div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                Passageiros
              </div>
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                32 Embarcados
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Histórico Operacional
            </div>
            <Timeline items={timelineItems.slice(2)} />
          </div>
        </div>
      </DrawerPanel>

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        items={commandItems}
      />
    </main>
  );
}
