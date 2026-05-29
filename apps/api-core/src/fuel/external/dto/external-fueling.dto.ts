import { IsString, IsNumber, IsOptional, IsPositive, IsDateString, IsEnum, MaxLength } from 'class-validator';

export enum PaymentMethod {
  CASH = 'cash',
  CORPORATE_CARD = 'corporate_card',
  INVOICE = 'invoice',
  PIX = 'pix',
  REIMBURSEMENT = 'reimbursement',
  OTHER = 'other',
}

export class CreateExternalFuelingDto {
  @IsOptional() @IsString() branchId?: string;
  @IsString() vehicleId!: string;
  @IsString() driverId!: string;
  @IsOptional() @IsString() fuelStationId?: string;
  @IsOptional() @IsString() @MaxLength(200) stationNameFree?: string;
  @IsString() fuelProductId!: string;
  @IsNumber() odometer!: number;
  @IsNumber() @IsPositive() liters!: number;
  @IsNumber() @IsPositive() unitPrice!: number;
  @IsNumber() @IsPositive() totalAmount!: number;
  @IsEnum(PaymentMethod) paymentMethod!: PaymentMethod;
  @IsOptional() @IsString() receiptNumber?: string;
  @IsOptional() @IsString() receiptPhotoUrl?: string;
  @IsOptional() @IsString() receiptAccessKey?: string;
  @IsDateString() occurredAt!: string;
  @IsOptional() @IsNumber() latitude?: number;
  @IsOptional() @IsNumber() longitude?: number;
  @IsOptional() @IsString() tripId?: string;
  @IsOptional() @IsString() notes?: string;
  // Mobile sync
  @IsOptional() @IsString() @MaxLength(100) clientGeneratedId?: string;
  @IsOptional() @IsString() @MaxLength(100) deviceId?: string;
  @IsOptional() @IsDateString() localCreatedAt?: string;
  @IsOptional() @IsString() @MaxLength(255) idempotencyKey?: string;
}
