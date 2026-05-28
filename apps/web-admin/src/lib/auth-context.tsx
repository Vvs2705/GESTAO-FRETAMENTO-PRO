"use client";

import * as React from "react";
import { toast } from "@gestao-fretamento-pro/ui";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "admin" | "ceo" | "operator" | "supervisor" | "driver" | "finance";
  tenantId: string;
}

interface AuthContextType {
  user: UserProfile | null;
  login: (email: string, role: UserProfile["role"]) => Promise<void>;
  logout: () => void;
  can: (action: string) => boolean;
  hasPerm: (permission: string) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<UserProfile | null>(null);

  React.useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      setUser(JSON.parse(saved));
    }
  }, []);

  const login = async (email: string, role: UserProfile["role"]) => {
    const mockUser: UserProfile = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: email.split("@")[0] || "Usuário",
      email,
      role,
      tenantId: "ten_1",
    };
    setUser(mockUser);
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("accessToken", "mock-token");
    localStorage.setItem("refreshToken", "mock-refresh");
    // Set cookie for middleware route guards
    document.cookie = "accessToken=mock-token; path=/";
    toast.success("Login realizado", "Seja bem-vindo ao Gestão Fretamento Pro!");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    document.cookie = "accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    toast.info("Sessão encerrada", "Até breve!");
    window.location.href = "/login";
  };

  const can = (action: string): boolean => {
    if (!user) return false;
    if (user.role === "admin" || user.role === "ceo") return true;

    switch (action) {
      case "finance.read":
        return user.role === "finance";
      case "operations.write":
        return ["operator", "supervisor"].includes(user.role);
      case "occurrences.escalate":
        return ["supervisor", "operator"].includes(user.role);
      default:
        return false;
    }
  };

  const hasPerm = (permission: string): boolean => can(permission);

  return (
    <AuthContext.Provider value={{ user, login, logout, can, hasPerm }}>
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
