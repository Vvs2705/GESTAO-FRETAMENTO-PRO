import type { Meta, StoryObj } from "@storybook/react";
import { AlertCard } from "./AlertCard";

const meta: Meta<typeof AlertCard> = {
  title: "Components/AlertCard",
  component: AlertCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AlertCard>;

export const Info: Story = {
  args: {
    title: "Atualização de Rota",
    description: "A rota SP ➔ Campinas foi atualizada com novos pontos de parada.",
    severity: "info",
  },
};

export const Warning: Story = {
  args: {
    title: "Documentação Expirando",
    description: "O documento CRLV do veículo ABC-1234 expira em 5 dias.",
    severity: "warning",
  },
};

export const Danger: Story = {
  args: {
    title: "Manutenção Atrasada",
    description: "A revisão preventiva do veículo XYZ-5678 está atrasada há 1200km.",
    severity: "danger",
  },
};
