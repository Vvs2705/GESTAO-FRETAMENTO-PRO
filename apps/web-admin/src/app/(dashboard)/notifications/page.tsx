"use client";

import * as React from "react";
import { ErrorState } from "@gestao-fretamento-pro/ui";
import { useAuth } from "../../../lib/auth-context";
import { useList, useApiAction } from "../../../lib/hooks/crud";
import { request } from "../../../lib/api";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt: string | null;
  createdAt: string;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationsPage() {
  const { can } = useAuth();
  const list = useList<Notification>("notifications", "/notifications", { limit: 100 });
  const markRead = useApiAction("notifications");
  const markAll = useApiAction("notifications", { successMsg: "Todas as notificações marcadas como lidas." });

  if (!can("notification.read")) {
    return (
      <ErrorState
        title="Acesso negado"
        description="Você não tem permissão para visualizar as notificações."
      />
    );
  }

  if (list.isError) {
    return (
      <ErrorState
        description="Não foi possível carregar as notificações."
        onRetry={() => list.refetch()}
      />
    );
  }

  const items = list.data?.data ?? [];
  const hasUnread = items.some((n) => n.readAt === null);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() =>
            markAll.mutate(() => request("/notifications/read-all", { method: "PATCH" }))
          }
          disabled={!hasUnread || markAll.isPending}
          className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          Marcar todas como lidas
        </button>
      </div>

      {list.isLoading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-20 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 border border-slate-200 dark:border-slate-800 rounded-lg">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhuma notificação
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Você está em dia. Novas notificações aparecerão aqui.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => {
            const unread = n.readAt === null;
            return (
              <li
                key={n.id}
                className={
                  unread
                    ? "rounded-lg border border-blue-200 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/20 p-4"
                    : "rounded-lg border border-slate-200 dark:border-slate-800 p-4"
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <p
                      className={
                        unread
                          ? "text-sm font-bold text-slate-900 dark:text-slate-50"
                          : "text-sm font-medium text-slate-700 dark:text-slate-300"
                      }
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {n.body}
                    </p>
                    <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                  {unread && (
                    <button
                      onClick={() =>
                        markRead.mutate(() =>
                          request(`/notifications/${n.id}/read`, { method: "PATCH" }),
                        )
                      }
                      disabled={markRead.isPending}
                      className="shrink-0 text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                    >
                      Marcar lida
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
