import type { Meta, StoryObj } from "@storybook/react";
import { KpiCard } from "./KpiCard";

const meta: Meta<typeof KpiCard> = {
  title: "Components/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

export const Default: Story = {
  args: {
    label: "Receita Mensal",
    value: "R$ 45.230,00",
    trend: 12.5,
    trendLabel: "vs mês anterior",
    status: "success",
  },
};

export const CriticalTrend: Story = {
  args: {
    label: "Veículos Parados",
    value: "8 Veículos",
    trend: -4.2,
    trendLabel: "vs semana anterior",
    status: "danger",
  },
};

export const Neutral: Story = {
  args: {
    label: "Abastecimentos Suspeitos",
    value: "2 Casos",
    trend: 0,
    trendLabel: "sem alteração",
    status: "warning",
  },
};
