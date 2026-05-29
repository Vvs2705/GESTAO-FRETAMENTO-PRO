import { IsString, IsNumber, IsOptional, IsPositive, Min, MaxLength } from 'class-validator';

export class CreateFuelTankDto {
  @IsString() @MaxLength(36) branchId!: string;
  @IsString() @MaxLength(36) fuelProductId!: string;
  @IsString() @MaxLength(100) name!: string;
  @IsString() @MaxLength(30) code!: string;
  @IsNumber() @IsPositive() capacityLiters!: number;
  @IsOptional() @IsNumber() @Min(0) minimumStockLiters?: number;
  @IsOptional() @IsNumber() @Min(0) warningStockLiters?: number;
  @IsOptional() @IsString() physicalLocation?: string;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateFuelTankDto {
  @IsOptional() @IsString() @MaxLength(100) name?: string;
  @IsOptional() @IsNumber() @Min(0) minimumStockLiters?: number;
  @IsOptional() @IsNumber() @Min(0) warningStockLiters?: number;
  @IsOptional() @IsString() physicalLocation?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() notes?: string;
}

export class FuelTankResponseDto {
  id!: string;
  tenantId!: string;
  branchId!: string;
  fuelProductId!: string;
  name!: string;
  code!: string;
  capacityLiters!: number;
  currentStockLiters!: number;
  minimumStockLiters!: number;
  warningStockLiters!: number;
  physicalLocation?: string | null;
  status!: string;
  stockPercent!: number;
  isLow!: boolean;
  isCritical!: boolean;
  lastCalibrationAt?: Date | null;
  notes?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
