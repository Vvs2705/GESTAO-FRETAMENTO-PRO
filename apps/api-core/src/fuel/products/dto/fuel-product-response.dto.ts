export class FuelProductResponseDto {
  id: string;
  tenantId: string;
  code: string;
  name: string;
  unit: string;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
