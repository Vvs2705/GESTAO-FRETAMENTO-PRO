"use client";

import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/query-client";
import { AuthProvider } from "../lib/auth-context";
import { ToastProvider } from "@gestao-fretamento-pro/ui";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
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
