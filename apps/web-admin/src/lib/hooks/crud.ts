"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { request, ApiError } from "../api";
import { toast } from "@gestao-fretamento-pro/ui";

/** Formato de paginação por cursor retornado pela api-core (CursorPage<T>). */
export interface CursorPage<T> {
  data: T[];
  pagination: { nextCursor: string | null; hasMore: boolean; limit: number };
}

function errMessage(e: unknown, fallback: string): string {
  return e instanceof ApiError ? e.message : fallback;
}

/** Lista paginada (GET) — retorna o CursorPage cru; use `.data?.data` para os itens. */
export function useList<T>(
  key: string,
  path: string,
  params?: Record<string, string | number | boolean>,
) {
  return useQuery<CursorPage<T>>({
    queryKey: [key, params ?? {}],
    queryFn: () => request(path, params ? { params } : {}) as Promise<CursorPage<T>>,
  });
}

/** Detalhe de uma entidade (GET /:id). */
export function useEntity<T>(key: string, path: string, id?: string) {
  return useQuery<T>({
    queryKey: [key, "one", id],
    queryFn: () => request(`${path}/${id}`) as Promise<T>,
    enabled: !!id,
  });
}

/** Cria (POST) ou atualiza (PATCH /:id) na mesma rota base. */
export function useSave<T = unknown>(
  key: string,
  path: string,
  opts?: { onDone?: () => void },
) {
  const qc = useQueryClient();
  return useMutation<T, Error, { id?: string; data: unknown }>({
    mutationFn: (input) =>
      request(input.id ? `${path}/${input.id}` : path, {
        method: input.id ? "PATCH" : "POST",
        body: JSON.stringify(input.data),
      }) as Promise<T>,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      toast.success("Salvo", "Registro salvo com sucesso.");
      opts?.onDone?.();
    },
    onError: (e) => toast.error("Erro ao salvar", errMessage(e, "Falha ao salvar o registro.")),
  });
}

/** Remove (DELETE /:id). */
export function useRemove(key: string, path: string) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, string>({
    mutationFn: (id) => request(`${path}/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      toast.success("Removido", "Registro removido com sucesso.");
    },
    onError: (e) => toast.error("Erro ao remover", errMessage(e, "Falha ao remover o registro.")),
  });
}

/**
 * Mutação genérica para endpoints de ação (mudança de status, resolver,
 * escalar, etc.). Recebe a função que faz a chamada e invalida a key ao fim.
 */
export function useApiAction(key: string, opts?: { successMsg?: string }) {
  const qc = useQueryClient();
  return useMutation<unknown, Error, () => Promise<unknown>>({
    mutationFn: (fn) => fn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
      if (opts?.successMsg) toast.success("Pronto", opts.successMsg);
    },
    onError: (e) => toast.error("Erro", errMessage(e, "Falha na operação.")),
  });
}
