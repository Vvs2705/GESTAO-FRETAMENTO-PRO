"use client";

import * as React from "react";
import { FormField, TextInput, toast } from "@gestao-fretamento-pro/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Recuperação solicitada", "Se o e-mail estiver cadastrado, você receberá as instruções de redefinição.");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-8 max-w-md w-full shadow-2xl space-y-6">
        <div className="text-center">
          <h1 className="text-xl font-bold">Recuperar Senha</h1>
          <p className="text-xs text-slate-500 mt-1">Insira seu e-mail para receber o link de recuperação</p>
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

          <button type="submit" className="w-full py-2 bg-primary text-white rounded-lg font-semibold text-xs hover:opacity-90">
            Enviar Link
          </button>
        </form>
      </div>
    </main>
  );
}
