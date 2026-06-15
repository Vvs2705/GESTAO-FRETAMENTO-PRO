"use client";

import * as React from "react";
import { EmptyState } from "@gestao-fretamento-pro/ui";
import { FolderOpen } from "lucide-react";

/**
 * Módulo de Documentos — atualmente SEM backend correspondente (não há controller
 * `documents` na api-core; a entidade `Document` existe no schema Prisma, mas
 * faltam serviço/endpoints de upload e controle de vencimentos). Ver
 * docs/auditoria GAP-053. Enquanto o backend não existe, exibimos um estado
 * informativo honesto em vez de uma tela vazia/fake.
 */
export default function DocumentsPage() {
  return (
    <EmptyState
      icon={<FolderOpen className="w-8 h-8" />}
      title="Módulo de Documentos em construção"
      description="O backend de documentos (upload de licenças/seguros e controle de vencimentos) ainda não está disponível. Esta área será habilitada assim que os endpoints forem publicados (GAP-053)."
    />
  );
}
