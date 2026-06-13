import * as React from "react";
import type { Metadata, Viewport } from "next";
import { Providers } from "../lib/providers";
import "../styles/globals.css";

/**
 * Metadata global (Next App Router). O `title.template` garante que toda aba do
 * navegador tenha nome ("<Seção> · Gestão Fretamento Pro") — cada rota define o
 * seu título no `layout.tsx` do segmento. O favicon é servido por
 * `app/icon.svg` (convenção de arquivo do Next). Sistema interno → noindex.
 */
export const metadata: Metadata = {
  title: {
    template: "%s · Gestão Fretamento Pro",
    default: "Gestão Fretamento Pro — Central de Operação da Frota",
  },
  description:
    "Plataforma de gestão de fretamento: operação, frota, abastecimento, manutenção, viagens e financeiro em um só lugar.",
  applicationName: "Gestão Fretamento Pro",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B1220",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased transition-colors duration-300">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
