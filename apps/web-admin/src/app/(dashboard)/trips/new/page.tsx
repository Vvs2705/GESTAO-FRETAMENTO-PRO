"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { FormField, TextInput, SelectField, toast, ProgressBar } from "@gestao-fretamento-pro/ui";

export default function NewTripWizardPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [client, setClient] = React.useState("");
  const [route, setRoute] = React.useState("");

  const handleNext = () => {
    if (step === 1 && !client) {
      toast.error("Campo obrigatório", "Selecione o cliente.");
      return;
    }
    if (step === 2 && !route) {
      toast.error("Campo obrigatório", "Defina a rota.");
      return;
    }
    if (step < 8) {
      setStep(step + 1);
    } else {
      toast.success("Sucesso", "Viagem criada com sucesso no pipeline de agendamentos!");
      router.push("/trips");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-card border border-slate-200 dark:border-slate-800 rounded-xl p-8 space-y-6">
      <div className="space-y-2">
        <span className="text-[10px] font-bold text-slate-400">PASSO {step} DE 8</span>
        <ProgressBar value={(step / 8) * 100} />
      </div>

      {step === 1 && (
        <FormField label="Cliente" required>
          <SelectField
            value={client}
            onChange={(e: any) => setClient(e.target.value)}
            options={[
              { value: "dell", label: "Dell Computadores" },
              { value: "bosch", label: "Bosch Tecnologia" },
            ]}
            placeholder="Selecione o cliente"
          />
        </FormField>
      )}

      {step === 2 && (
        <FormField label="Rota" required>
          <TextInput
            value={route}
            onChange={(e) => setRoute(e.target.value)}
            placeholder="EX: São Paulo Centro para Campinas Filial A"
          />
        </FormField>
      )}

      {step > 2 && (
        <div className="py-6 text-center text-xs text-slate-400">
          Simulação de alocação de motoristas, veículos e confirmação geral (Passo {step}).
        </div>
      )}

      <div className="flex justify-between border-t border-slate-100 dark:border-slate-900 pt-4">
        <button
          disabled={step === 1}
          onClick={() => setStep(step - 1)}
          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold disabled:opacity-50"
        >
          Voltar
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-semibold"
        >
          {step === 8 ? "Concluir" : "Avançar"}
        </button>
      </div>
    </div>
  );
}
