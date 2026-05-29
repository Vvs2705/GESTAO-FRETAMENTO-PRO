import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum PumpMeterType {
  MECHANICAL = 'mechanical',
  DIGITAL = 'digital',
  INTEGRATED = 'integrated',
  MANUAL = 'manual',
}

export class CreateFuelPumpDto {
  @IsString() @MaxLength(36) branchId!: string;
  @IsString() @MaxLength(36) fuelTankId!: string;
  @IsString() @MaxLength(100) name!: string;
  @IsString() @MaxLength(30) code!: string;
  @IsEnum(PumpMeterType) meterType!: PumpMeterType;
  @IsOptional() @IsString() notes?: string;
}

export class FuelPumpResponseDto {
  id!: string;
  tenantId!: string;
  branchId!: string;
  fuelTankId!: string;
  name!: string;
  code!: string;
  meterType!: string;
  currentMeterReading!: number;
  status!: string;
  lastInspectionAt?: Date | null;
  notes?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
