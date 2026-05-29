import {
  IsString, IsNumber, IsOptional, IsPositive, IsDateString, MaxLength,
} from 'class-validator';

export class CreateFuelDeliveryDto {
  @IsString()
  supplierId!: string;

  @IsString()
  fuelProductId!: string;

  @IsString()
  fuelTankId!: string;

  @IsDateString()
  deliveryDate!: string;

  @IsString()
  @MaxLength(100)
  invoiceNumber!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  invoiceAccessKey?: string;

  @IsNumber()
  @IsPositive()
  contractedLiters!: number;

  @IsNumber()
  @IsPositive()
  declaredLiters!: number;

  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @IsNumber()
  @IsPositive()
  totalAmount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  carrierName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  carrierDocument?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  tankerPlate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  tankerDriverName?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AttachDeliveryEvidenceDto {
  @IsString()
  fileUrl!: string;

  @IsString()
  @MaxLength(50)
  type!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
