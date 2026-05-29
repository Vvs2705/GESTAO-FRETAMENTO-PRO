import { IsString, IsOptional, IsEmail, MaxLength, IsBoolean } from 'class-validator';

export class CreateFuelSupplierDto {
  @IsString() @MaxLength(200) legalName!: string;
  @IsOptional() @IsString() @MaxLength(200) tradeName?: string;
  @IsString() @MaxLength(20) document!: string;
  @IsOptional() @IsString() @MaxLength(200) contactName?: string;
  @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() notes?: string;
}

export class ApproveFuelSupplierDto {
  @IsBoolean() approved!: boolean;
}

export class FuelSupplierResponseDto {
  id!: string;
  tenantId!: string;
  legalName!: string;
  tradeName?: string | null;
  document!: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  approved!: boolean;
  status!: string;
  notes?: string | null;
  createdAt!: Date;
  updatedAt!: Date;
}
