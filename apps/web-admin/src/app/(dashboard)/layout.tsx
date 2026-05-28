"use client";

import * as React from "react";
import { useAuth } from "../../lib/auth-context";
import { Sidebar, TopBar, Breadcrumb } from "@gestao-fretamento-pro/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [selectedFilial, setSelectedFilial] = React.useState("fil_1");

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-400">Carregando autenticação...</span>
      </div>
    );
  }

  const notifications = [
    { id: "1", title: "Viagem em Atraso", message: "Viagem #4827 está atrasada 15 minutos.", read: false, time: "10 min atrás" },
    { id: "2", title: "Documento de Veículo Vencendo", message: "O DPVAT do veículo ABC-1234 vence em 7 dias.", read: true, time: "2 horas atrás" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentPath={typeof window !== "undefined" ? window.location.pathname : "/"}
        role={user.role}
        onNavigate={(path) => {
          window.location.href = path;
        }}
      />
      
      <div className="flex flex-col flex-grow overflow-hidden">
        <TopBar
          userName={user.name}
          userRole={user.role}
          notifications={notifications}
          onLogout={logout}
          selectedFilial={selectedFilial}
          onFilialChange={setSelectedFilial}
          filiais={[
            { id: "fil_1", name: "Filial São Paulo" },
            { id: "fil_2", name: "Filial Campinas" },
          ]}
        />

        <div className="flex-grow overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin">
          <Breadcrumb
            items={[
              { label: "Dashboard", path: "/" },
              { label: "Visão Geral" },
            ]}
          />
          {children}
        </div>
      </div>
    </div>
  );
}
