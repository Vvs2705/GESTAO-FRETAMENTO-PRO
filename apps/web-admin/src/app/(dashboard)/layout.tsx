"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { Sidebar, TopBar, Breadcrumb, PageHeader } from "@gestao-fretamento-pro/ui";
import { resolvePageMeta } from "../../lib/page-meta";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [selectedFilial, setSelectedFilial] = React.useState("fil_1");
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-xs font-semibold text-slate-400">Carregando autenticação...</span>
      </div>
    );
  }

  const pageMeta = resolvePageMeta(pathname);

  const notifications = [
    { id: "1", title: "Viagem em Atraso", message: "Viagem #4827 está atrasada 15 minutos.", read: false, time: "10 min atrás" },
    { id: "2", title: "Documento de Veículo Vencendo", message: "O DPVAT do veículo ABC-1234 vence em 7 dias.", read: true, time: "2 horas atrás" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar
        currentPath={pathname}
        role={user.role}
        LinkComponent={Link}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />

      <div className="flex flex-col flex-grow overflow-hidden">
        <TopBar
          userName={user.name}
          userRole={user.role}
          notifications={notifications}
          onLogout={logout}
          onMenuClick={() => setMobileNavOpen(true)}
          selectedFilial={selectedFilial}
          onFilialChange={setSelectedFilial}
          filiais={[
            { id: "fil_1", name: "Filial São Paulo" },
            { id: "fil_2", name: "Filial Campinas" },
          ]}
        />

        <div className="flex-grow overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 scrollbar-thin">
          {/* Container centralizado com largura máxima — evita esticar em telas
              grandes/TV (DESIGN.md: telas 1920 esticam os cards). */}
          <div className="mx-auto w-full max-w-[1440px] space-y-6">
            <Breadcrumb items={pageMeta.breadcrumb} LinkComponent={Link} />
            <PageHeader title={pageMeta.title} description={pageMeta.description} />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
