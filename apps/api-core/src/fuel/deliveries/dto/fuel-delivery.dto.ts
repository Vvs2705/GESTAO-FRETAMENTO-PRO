import { IsString, IsNumber, IsOptional, IsPositive, IsDateString, IsArray, MaxLength, Min } from 'class-validator';

export class CreateFuelDeliveryDto {
  @IsString() supplierId!: string;
  @IsString() fuelProductId!: string;
  @IsString() fuelTankId!: string;
  @IsDateString() deliveryDate!: string;
  @IsString() @MaxLength(100) invoiceNumber!: string;
  @IsOptional() @IsString() invoiceAccessKey?: string;
  @IsNumber() @IsPositive() contractedLiters!: number;
  @IsNumber() @IsPositive() declaredLiters!: number;
  @IsNumber() @IsPositive() unitPrice!: number;
  @IsNumber() @IsPositive() totalAmount!: number;
  @IsOptional() @IsString() carrierName?: string;
  @IsOptional() @IsString() carrierDocument?: string;
  @IsOptional() @IsString() @MaxLength(10) tankerPlate?: string;
  @IsOptional() @IsString() @MaxLength(10) tankerTrailerPlate?: string;
  @IsOptional() @IsString() tankerDriverName?: string;
  @IsOptional() @IsString() tankerDriverDocument?: string;
  @IsOptional() @IsArray() sealNumbers?: string[];
  @IsOptional() @IsString() notes?: string;
}

export class RegisterDeliveryReceiptDto {
  @IsNumber() @Min(0) receivedLiters!: number;
  @IsNumber() @Min(0) beforeTankLevelLiters!: number;
  @IsNumber() @Min(0) afterTankLevelLiters!: number;
  @IsOptional() @IsString() notes?: string;
}

export class FuelDeliveryResponseDto {
  id!: string;
  tenantId!: string;
  branchId!: string;
  supplierId!: string;
  fuelProductId!: string;
  fuelTankId!: string;
  deliveryDate!: Date;
  invoiceNumber!: string;
  invoiceAccessKey?: string | null;
  contractedLiters!: number;
  declaredLiters!: number;
  receivedLiters?: number | null;
  acceptedLiters?: number | null;
  rejectedLiters?: number | null;
  unitPrice!: number;
  totalAmount!: number;
  carrierName?: string | null;
  tankerPlate?: string | null;
  tankerTrailerPlate?: string | null;
  sealNumbers?: string[] | null;
  beforeTankLevelLiters?: number | null;
  afterTankLevelLiters?: number | null;
  differenceLiters?: number | null;
  differencePercent?: number | null;
  status!: string;
  receivedByUserId?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: Date | null;
  notes?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
