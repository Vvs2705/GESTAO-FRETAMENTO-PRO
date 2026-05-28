import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: [
        "trip-draft",
        "trip-confirmed",
        "trip-in-progress",
        "trip-delayed",
        "trip-completed",
        "trip-canceled",
        "occurrence-open",
        "occurrence-critical",
        "occurrence-resolved",
        "vehicle-available",
        "vehicle-in-maintenance",
        "vehicle-unavailable",
        "document-valid",
        "document-expiring",
        "document-expired",
      ],
    },
    showDot: {
      control: "boolean",
    },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const TripDraft: Story = {
  args: {
    status: "trip-draft",
    label: "Rascunho",
    showDot: true,
  },
};

export const TripConfirmed: Story = {
  args: {
    status: "trip-confirmed",
    label: "Confirmado",
    showDot: true,
  },
};

export const TripInProgress: Story = {
  args: {
    status: "trip-in-progress",
    label: "Em Andamento",
    showDot: true,
  },
};

export const OccurrenceCritical: Story = {
  args: {
    status: "occurrence-critical",
    label: "Crítico",
    showDot: true,
  },
};

export const VehicleAvailable: Story = {
  args: {
    status: "vehicle-available",
    label: "Disponível",
    showDot: true,
  },
};
