"use client";

import * as React from "react";
import { toast } from "@gestao-fretamento-pro/ui";
import { request, ApiError } from "./api";

/** Categoria de cargo usada pela Sidebar/TopBar (UI). Derivada das permissões reais. */
export type UiRole = "admin" | "ceo" | "operator" | "supervisor" | "driver" | "finance";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  tenantId: string;
  /** Permissões reais vindas do backend (catálogo de 69 chaves). Fonte da verdade do RBAC. */
  permissions: string[];
  /** Nome do cargo no backend (ex.: "CEO", "Operador"). */
  roleName?: string;
  /** Categoria derivada para filtrar o menu lateral. */
  role: UiRole;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Verifica se o usuário possui a permissão exata (ex.: "trip.create"). */
  can: (permission: string) => boolean;
  hasPerm: (permission: string) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/v1";

/** Resposta de /v1/users/me e do bloco user de /v1/auth/login. */
interface MeResponse {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  permissions: string[];
  roleName?: string;
}

/** Deriva a categoria de UI a partir do cargo/permissões reais. */
function deriveRole(permissions: string[], roleName?: string): UiRole {
  const byName: Record<string, UiRole> = {
    CEO: "admin",
    "Gerente Operacional": "supervisor",
    Operador: "operator",
    Motorista: "driver",
    Financeiro: "finance",
  };
  if (roleName && byName[roleName]) return byName[roleName];

  // Fallback robusto para cargos customizados — baseado nas permissões.
  if (permissions.includes("permission.manage") || permissions.includes("role.manage")) {
    return "admin";
  }
  if (permissions.includes("finance.read")) return "finance";
  if (permissions.includes("occurrence.resolve") || permissions.includes("route.create")) {
    return "supervisor";
  }
  if (permissions.includes("trip.create")) return "operator";
  return "driver";
}

function toProfile(me: MeResponse): UserProfile {
  const permissions = me.permissions ?? [];
  const profile: UserProfile = {
    id: me.id,
    name: me.name,
    email: me.email,
    tenantId: me.tenantId,
    permissions,
    role: deriveRole(permissions, me.roleName),
  };
  if (me.roleName) profile.roleName = me.roleName;
  return profile;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Restaura a sessão ao carregar: se há token, busca o perfil real em /v1/users/me.
  React.useEffect(() => {
    let active = true;
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const me = (await request("/users/me")) as MeResponse;
        if (active) setUser(toProfile(me));
      } catch {
        // Token inválido/expirado — limpa e segue deslogado.
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
    } catch {
      throw new ApiError(0, "Não foi possível conectar ao servidor.");
    }

    if (!res.ok) {
      let data: { message?: string; error?: { message?: string } } | null = null;
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }
      // O backend serializa erros como { error: { code, message } }; aceita-se
      // também { message } por retrocompatibilidade.
      const backendMessage = data?.error?.message ?? data?.message;
      // Distingue indisponibilidade de infraestrutura (banco/serviço fora) de
      // credenciais inválidas — não mostrar "senha incorreta" quando a API caiu.
      let message: string;
      if (res.status >= 500) {
        message = "Serviço temporariamente indisponível. Tente novamente em instantes.";
      } else if (res.status === 401) {
        message = backendMessage ?? "E-mail ou senha incorretos.";
      } else {
        message = backendMessage ?? "Não foi possível fazer login.";
      }
      throw new ApiError(res.status, message);
    }

    const payload = (await res.json()) as {
      accessToken: string;
      refreshToken: string;
      user: MeResponse;
    };

    localStorage.setItem("accessToken", payload.accessToken);
    localStorage.setItem("refreshToken", payload.refreshToken);
    // Cookie para os guards de rota do middleware Next.
    document.cookie = `accessToken=${payload.accessToken}; path=/; samesite=lax`;

    setUser(toProfile(payload.user));
    toast.success("Login realizado", "Seja bem-vindo ao Gestão Fretamento Pro!");
  };

  const logout = async () => {
    const refreshToken =
      typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
    try {
      await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken") ?? ""}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Logout local prossegue mesmo se a chamada falhar.
    }
    setUser(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    toast.info("Sessão encerrada", "Até breve!");
    window.location.href = "/login";
  };

  const can = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  };

  const hasPerm = (permission: string): boolean => can(permission);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, can, hasPerm }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
}
