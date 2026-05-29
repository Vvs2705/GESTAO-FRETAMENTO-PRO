import { IsString, IsOptional, IsEnum, MaxLength } from 'class-validator';

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export class CreateFuelIncidentDto {
  @IsString() branchId!: string;
  @IsOptional() @IsString() relatedInternalFuelingId?: string;
  @IsOptional() @IsString() relatedExternalFuelingId?: string;
  @IsOptional() @IsString() relatedFuelDeliveryId?: string;
  @IsOptional() @IsString() vehicleId?: string;
  @IsOptional() @IsString() fuelTankId?: string;
  @IsEnum(IncidentSeverity) severity!: IncidentSeverity;
  @IsString() @MaxLength(100) type!: string;
  @IsString() description!: string;
  @IsOptional() @IsString() responsibleUserId?: string;
}

export class ResolveFuelIncidentDto {
  @IsString() resolution!: string;
}
