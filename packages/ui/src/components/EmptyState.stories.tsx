import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState } from "./EmptyState";

const meta: Meta<typeof EmptyState> = {
  title: "Components/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "Nenhuma viagem encontrada",
    description: "Não há viagens programadas para o período selecionado.",
    actionLabel: "Criar Nova Viagem",
    onAction: () => alert("Criar Nova Viagem clicado!"),
  },
};

export const WithoutAction: Story = {
  args: {
    title: "Sem ocorrências críticas",
    description: "Nenhuma ocorrência de alta gravidade foi registrada hoje.",
  },
};
