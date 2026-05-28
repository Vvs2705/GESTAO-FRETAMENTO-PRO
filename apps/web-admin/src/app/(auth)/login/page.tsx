"use client";

import * as React from "react";
import { useAuth } from "../../../lib/auth-context";
import { FormField, TextInput, SelectField, toast, Spinner } from "@gestao-fretamento-pro/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("admin@fretamento.com");
  const [role, setRole] = React.useState<any>("admin");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Campo obrigatório", "Insira um e-mail válido.");
      return;
    }
    setLoading(true);
    try {
      await login(email, role);
      window.location.href = "/";
    } catch (_) {
      toast.error("Falha na autenticação", "Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card text-card-foreground border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight">Gestão Fretamento Pro</h1>
          <p className="text-xs text-slate-500">Entre na sua conta operacional</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="E-mail" htmlFor="email" required>
            <TextInput
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@fretamento.com"
            />
          </FormField>

          <FormField label="Cargo / Simulação" htmlFor="role">
            <SelectField
              value={role}
              onChange={(e: any) => setRole(e.target.value)}
              options={[
                { value: "admin", label: "Administrador" },
                { value: "ceo", label: "Diretor / CEO" },
                { value: "operator", label: "Operador de Central" },
                { value: "supervisor", label: "Supervisor de Frota" },
                { value: "driver", label: "Motorista" },
                { value: "finance", label: "Financeiro" },
              ]}
            />
          </FormField>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 select-none text-xs"
          >
            {loading ? <Spinner size="sm" /> : "Acessar Sistema"}
          </button>
        </form>
      </div>
    </main>
  );
}
