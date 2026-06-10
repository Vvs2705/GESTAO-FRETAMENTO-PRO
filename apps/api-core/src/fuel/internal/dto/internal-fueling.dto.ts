import {
  IsString, IsNumber, IsOptional, IsPositive, IsDateString,
  MaxLength, Min,
} from 'class-validator';

export class CreateInternalFuelingDto {
  @IsString() vehicleId!: string;
  @IsOptional() @IsString() driverId?: string;
  @IsString() fuelTankId!: string;
  @IsOptional() @IsString() fuelPumpId?: string;
  @IsString() fuelProductId!: string;
  @IsNumber() @Min(0) odometer!: number;
  @IsOptional() @IsNumber() @Min(0) hourmeter?: number;
  @IsNumber() @IsPositive() liters!: number;
  @IsOptional() @IsNumber() @Min(0) meterBefore?: number;
  @IsOptional() @IsNumber() @Min(0) meterAfter?: number;
  @IsOptional() @IsString() tripId?: string;
  @IsOptional() @IsString() routeId?: string;
  @IsDateString() occurredAt!: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsString() notes?: string;
  // Mobile sync
  @IsOptional() @IsString() @MaxLength(100) clientGeneratedId?: string;
  @IsOptional() @IsString() @MaxLength(100) deviceId?: string;
  @IsOptional() @IsDateString() localCreatedAt?: string;
  @IsOptional() @IsString() @MaxLength(255) idempotencyKey?: string;
}

export class InternalFuelingResponseDto {
  id!: string;
  tenantId!: string;
  branchId!: string;
  vehicleId!: string;
  driverId?: string | null;
  attendantUserId!: string;
  fuelTankId!: string;
  fuelPumpId?: string | null;
  fuelProductId!: string;
  odometer!: number;
  hourmeter?: number | null;
  liters!: number;
  meterBefore?: number | null;
  meterAfter?: number | null;
  unitCostCalculated?: number | null;
  totalCostCalculated?: number | null;
  tripId?: string | null;
  routeId?: string | null;
  occurredAt!: Date;
  status!: string;
  anomalyFlag!: boolean;
  anomalyReason?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: Date | null;
  notes?: string | null;
  clientGeneratedId?: string | null;
  idempotencyKey?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
