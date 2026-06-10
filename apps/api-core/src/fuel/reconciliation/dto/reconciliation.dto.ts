import { IsString, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator';

export class CreateReconciliationDto {
  @IsUUID()
  @IsNotEmpty()
  fuelTankId!: string;

  @IsNumber()
  @IsPositive()
  measuredLiters!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ReconciliationResponseDto {
  fuelTankId!: string;
  bookStockLiters!: number;
  measuredLiters!: number;
  differenceLiters!: number;
  status!: string; // aligned | adjusted
  occurredAt!: Date;
}
