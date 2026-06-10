"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { AuthProvider } from "../lib/auth-context";
import { ToastProvider } from "@gestao-fretamento-pro/ui";
import { initMsw } from "../lib/msw";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = React.useState(false);

  React.useEffect(() => {
    initMsw().then(() => {
      setMswReady(true);
    });
  }, []);

  // Defer rendering of children until MSW is active in development/test environment
  if (!mswReady && process.env.NODE_ENV === "development") {
    return (
      <html lang="pt-BR" className="dark">
        <body className="min-h-screen flex items-center justify-center bg-[#0B1220] text-slate-400 font-sans">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 animate-pulse">
              Inicializando ambiente operacional...
            </span>
          </div>
        </body>
      </html>
    );
  }

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <title>Gestão Fretamento Pro — Central de Operação da Frota</title>
        <meta
          name="description"
          content="Plataforma de gestão de fretamento: operação, frota, abastecimento, manutenção, viagens e financeiro em um só lugar."
        />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
