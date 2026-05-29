"use client";

import * as React from "react";
import { useAuth } from "../../../lib/auth-context";
import { FormField, TextInput, toast, Spinner, Logo } from "@gestao-fretamento-pro/ui";

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
    <main className="min-h-screen flex flex-col items-center justify-between bg-[#0B1220] px-4 py-8 relative overflow-hidden select-none">
      {/* Decorative premium radial gradients for Command Mobility Design atmosphere */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-info/5 blur-[120px] pointer-events-none" />

      {/* Spacer to push card to center */}
      <div className="flex-grow flex items-center justify-center w-full">
        <div className="bg-[#102A43]/50 backdrop-blur-md text-slate-100 border border-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Logo size="lg" variant="symbol" className="bg-primary/10 p-3 rounded-xl border border-primary/20" />
            <div className="space-y-1">
              <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">
                Gestão Fretamento <span className="text-primary">Pro</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Command Mobility Platform
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="E-mail Corporativo" htmlFor="email" required>
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@vstack.com"
                className="bg-[#0B1220]/80 border-slate-700 text-white placeholder-slate-500 focus:border-primary text-xs"
              />
            </FormField>

            <FormField label="Senha Operacional" htmlFor="password" required>
              <div className="space-y-1.5">
                <TextInput
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-[#0B1220]/80 border-slate-700 text-white placeholder-slate-500 focus:border-primary text-xs"
                />
                <div className="flex justify-end">
                  <a
                    href="/forgot-password"
                    className="text-[10px] font-semibold text-primary hover:text-primary/80 hover:underline transition-all"
                  >
                    Esqueci minha senha
                  </a>
                </div>
              </div>
            </FormField>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/95 text-white font-bold rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 select-none text-xs shadow-lg shadow-primary/20 mt-6"
            >
              {loading ? <Spinner size="sm" /> : "Acessar Painel de Controle"}
            </button>
          </form>
        </div>
      </div>

      {/* Corporate signature footer */}
      <footer className="text-center space-y-1">
        <p className="text-[9px] font-semibold text-slate-500 tracking-wider uppercase select-none">
          product by <span className="text-slate-400 font-bold">Vstack-solutions</span>
        </p>
        <p className="text-[8px] text-slate-600 font-mono select-none">v1.2.0 • Estável</p>
      </footer>
    </main>
  );
}
