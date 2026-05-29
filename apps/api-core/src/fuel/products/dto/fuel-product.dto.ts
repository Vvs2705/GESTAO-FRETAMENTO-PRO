import { IsString, IsOptional, IsBoolean, IsEnum, MaxLength } from 'class-validator';

export enum FuelProductType {
  DIESEL_S10 = 'diesel_s10',
  DIESEL_S500 = 'diesel_s500',
  GASOLINE = 'gasoline',
  ETHANOL = 'ethanol',
  ARLA32 = 'arla32',
  ELECTRIC_CHARGE = 'electric_charge',
  OTHER = 'other',
}

export enum FuelProductUnit {
  LITER = 'liter',
  KWH = 'kwh',
}

export class CreateFuelProductDto {
  @IsString()
  @MaxLength(30)
  code!: string;

  @IsString()
  @MaxLength(100)
  name!: string;

  @IsEnum(FuelProductType)
  type!: FuelProductType;

  @IsOptional()
  @IsEnum(FuelProductUnit)
  unit?: FuelProductUnit;
}

export class FuelProductResponseDto {
  id!: string;
  tenantId?: string | null;
  code!: string;
  name!: string;
  type!: string;
  unit!: string;
  active!: boolean;
}
