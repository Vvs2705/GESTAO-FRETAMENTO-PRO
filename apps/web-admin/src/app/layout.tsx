"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { initMsw } from "../lib/msw";
import "../styles/globals.css";

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  initMsw();
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <title>Gestão Fretamento Pro</title>
        <meta
          name="description"
          content="Sistema operacional de gestão para empresas de transporte fretado e turismo"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-background text-foreground transition-colors duration-300">
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </body>
    </html>
  );
}
