# Playbook de Integração (padrão único)

Objetivo: **um padrão** para o time replicar em todas as telas, garantindo consistência. Usa o que já existe: `lib/api.ts` (`request()`), React Query (já no `Providers`) e o design system.

---

## 1. Hooks base sobre `request()` (GAP-010)

Criar `apps/web-admin/src/lib/hooks/crud.ts`:

```ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request, ApiError } from "../api";
import { toast } from "@gestao-fretamento-pro/ui";

export function useList<T>(key: string, path: string, params?: Record<string, any>) {
  return useQuery<T>({ queryKey: [key, params], queryFn: () => request(path, { params }) });
}

export function useEntity<T>(key: string, path: string, id?: string) {
  return useQuery<T>({ queryKey: [key, id], queryFn: () => request(`${path}/${id}`), enabled: !!id });
}

export function useSave<T>(key: string, path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; data: any }) =>
      request(input.id ? `${path}/${input.id}` : path, {
        method: input.id ? "PATCH" : "POST",
        body: JSON.stringify(input.data),
      }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [key] }); toast.success("Salvo", "Registro salvo com sucesso."); },
    onError: (e: ApiError) => toast.error("Erro ao salvar", e.message),
  });
}

export function useRemove(key: string, path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => request(`${path}/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: [key] }); toast.success("Removido", "Registro removido."); },
    onError: (e: ApiError) => toast.error("Erro ao remover", e.message),
  });
}
```

---

## 2. Tela de referência — Veículos (GAP-020) ponta a ponta

Substituir `apps/web-admin/src/app/(dashboard)/vehicles/page.tsx` (hoje stub de 5 linhas) por:

```tsx
"use client";
import * as React from "react";
import {
  DataTable, DrawerPanel, FormField, TextInput, SelectField, ConfirmModal,
  StatusBadge, EmptyState, ErrorState, LoadingSkeleton, toast,
} from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useSave, useRemove } from "../../../lib/hooks/crud";

interface Vehicle { id: string; plate: string; model: string; year: number; status: string; }

export default function VehiclesPage() {
  const { can } = useAuth();
  const { data, isLoading, isError, refetch } = useList<{ items: Vehicle[] }>("vehicles", "/vehicles");
  const save = useSave("vehicles", "/vehicles");
  const remove = useRemove("vehicles", "/vehicles");
  const [editing, setEditing] = React.useState<Vehicle | null>(null);
  const [open, setOpen] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<Vehicle | null>(null);

  if (isLoading) return <LoadingSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const items = data?.items ?? [];
  const columns = [
    { accessorKey: "plate", header: "Placa" },
    { accessorKey: "model", header: "Modelo" },
    { accessorKey: "year", header: "Ano" },
    { accessorKey: "status", header: "Status", cell: ({ getValue }: any) => <StatusBadge status={getValue()} /> },
    // + coluna de ações (Editar / Excluir) condicionada a can(...)
  ];

  async function onSubmit(form: Partial<Vehicle>) {
    await save.mutateAsync({ id: editing?.id, data: form });
    setOpen(false); setEditing(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {can("vehicle.create") && (
          <button onClick={() => { setEditing(null); setOpen(true); }}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold">
            Cadastrar veículo
          </button>
        )}
      </div>

      {items.length === 0
        ? <EmptyState title="Nenhum veículo" description="Cadastre o primeiro veículo da frota." />
        : <DataTable columns={columns} data={items} />}

      <DrawerPanel open={open} onClose={() => setOpen(false)} title={editing ? "Editar veículo" : "Cadastrar veículo"}>
        {/* react-hook-form recomendado; abaixo simplificado */}
        <form onSubmit={(e) => { e.preventDefault();
          const f = new FormData(e.currentTarget);
          onSubmit({ plate: String(f.get("plate")), model: String(f.get("model")), year: Number(f.get("year")) });
        }} className="space-y-4">
          <FormField label="Placa" required><TextInput name="plate" defaultValue={editing?.plate} /></FormField>
          <FormField label="Modelo" required><TextInput name="model" defaultValue={editing?.model} /></FormField>
          <FormField label="Ano" required><TextInput name="year" type="number" defaultValue={editing?.year} /></FormField>
          <button type="submit" disabled={save.isPending}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold">
            {save.isPending ? "Salvando…" : "Salvar"}
          </button>
        </form>
      </DrawerPanel>

      <ConfirmModal open={!!toDelete} onConfirm={async () => { if (toDelete) await remove.mutateAsync(toDelete.id); setToDelete(null); }}
        onCancel={() => setToDelete(null)} title="Excluir veículo" message="Esta ação não pode ser desfeita." />
    </div>
  );
}
```

> **Regras do padrão (valem para todas as telas):**
> 1. Dados sempre via `useList`/`useEntity` — **nunca** array fixo no componente.
> 2. Criar/editar em `DrawerPanel` com `FormField` + inputs do design system; preferir `react-hook-form` + os validators de `@gestao-fretamento-pro/validators` (já existem: placa, CNH, etc.).
> 3. Excluir/ações destrutivas sempre via `ConfirmModal`.
> 4. `LoadingSkeleton` / `EmptyState` / `ErrorState` obrigatórios.
> 5. Botões de ação condicionados a `can("<permissao>")`.
> 6. Erros do backend exibidos com a `message` real via `toast` (o `ApiError` já carrega `message` e `data`).
> 7. Confirmar o **formato da resposta** de cada `GET` lista (ex.: `{ items, nextCursor }` — paginação por cursor existe no backend) e ajustar os tipos.

---

## 3. Conferir contrato com o OpenAPI
Antes de cada tela, validar request/response no contrato gerado: `openapi/v1/api.yaml` (ou Swagger em `/<api>/docs`). Os DTOs do backend são a fonte da verdade dos campos.

---

## 4. Correções de infra/config (EPIC 0)

**Vercel — variável de ambiente (GAP-001):**
```
NEXT_PUBLIC_API_URL = https://<dominio-da-api-core>/v1
```
Setar em Production, Preview e Development. Sem ela, `BASE_URL` cai no `http://localhost:3000/v1` (ver `lib/api.ts:17` e `auth-context.tsx:36`).

**api-core — CORS (GAP-002):** garantir que `CORS_ORIGINS` (env da api-core) inclua `https://gestao-fretamento-web.vercel.app` (e domínios de preview, se necessário).

**MSW (GAP-003):** mantém-se **dev-only** (`initMsw` já gated em `NODE_ENV==="development"`). Hoje só mocka auth; ao ligar as telas, rodar a api-core localmente **ou** ampliar os handlers em `lib/msw.ts`. Nunca habilitar MSW em produção.

---

## 5. Definição de Pronto (cada tela)
- [ ] Lista vem da API (sem dado fixo) com loading/empty/error.
- [ ] Criar/editar persistem via API e atualizam a lista (invalidation).
- [ ] Ações destrutivas com confirmação.
- [ ] Botões respeitam RBAC (`can`).
- [ ] Erros do backend exibidos ao usuário.
- [ ] Sem `console.log`/`alert`/dados mock remanescentes.
- [ ] Tipos alinhados ao OpenAPI.
