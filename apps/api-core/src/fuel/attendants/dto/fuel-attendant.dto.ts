import { IsString, IsNotEmpty, IsOptional, IsArray, IsUUID, IsDateString, MaxLength } from 'class-validator';

export class CreateFuelAttendantDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsOptional()
  employeeId?: string;

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  allowedBranchIds?: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  allowedTankIds?: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  allowedPumpIds?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(30)
  shift?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;

  @IsDateString()
  @IsOptional()
  certificationExpiresAt?: string;
}

export class UpdateFuelAttendantDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  allowedBranchIds?: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  allowedTankIds?: string[];

  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  allowedPumpIds?: string[];

  @IsString()
  @IsOptional()
  @MaxLength(30)
  shift?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  status?: string;

  @IsDateString()
  @IsOptional()
  certificationExpiresAt?: string;
}

export class FuelAttendantResponseDto {
  id!: string;
  tenantId!: string;
  userId!: string;
  employeeId?: string | null;
  allowedBranchIds!: string[];
  allowedTankIds!: string[];
  allowedPumpIds!: string[];
  shift?: string | null;
  status!: string;
  certificationExpiresAt?: Date | null;
  createdAt!: Date;
  updatedAt!: Date;
}
