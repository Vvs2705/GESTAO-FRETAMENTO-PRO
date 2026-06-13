"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./query-client";
import { AuthProvider } from "./auth-context";
import { ToastProvider } from "@gestao-fretamento-pro/ui";
import { initMsw } from "./msw";

/**
 * Providers de cliente (React Query, Auth, Toasts) + bootstrap do Mock Service
 * Worker. Mantido fora do `layout.tsx` para que o layout raiz permaneça um
 * Server Component e possa exportar a Metadata API do Next (title/description/
 * favicon por página). Ver app/layout.tsx.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = React.useState(false);

  React.useEffect(() => {
    initMsw().then(() => {
      setMswReady(true);
    });
  }, []);

  // Em desenvolvimento, adia a renderização até o MSW estar ativo para evitar
  // requisições reais antes dos handlers de mock serem registrados.
  if (!mswReady && process.env.NODE_ENV === "development") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1220] text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">
            Inicializando ambiente operacional...
          </span>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <ToastProvider />
      </AuthProvider>
    </QueryClientProvider>
  );
}
