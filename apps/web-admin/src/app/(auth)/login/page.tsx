"use client";

import * as React from "react";
import { useAuth } from "../../../lib/auth-context";
import { FormField, TextInput, toast, Spinner } from "@gestao-fretamento-pro/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Campos obrigatórios", "Informe e-mail e senha.");
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      window.location.href = "/";
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Verifique suas credenciais.";
      toast.error("Falha na autenticação", message);
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
              placeholder="seu.email@empresa.com"
            />
          </FormField>

          <FormField label="Senha" htmlFor="password" required>
            <TextInput
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
