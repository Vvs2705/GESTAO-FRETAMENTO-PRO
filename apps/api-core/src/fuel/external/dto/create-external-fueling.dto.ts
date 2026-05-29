import {
  IsString, IsNumber, IsOptional, IsPositive, IsDateString, MaxLength, Min,
} from 'class-validator';

export class CreateExternalFuelingDto {
  @IsString()
  vehicleId!: string;

  @IsString()
  driverId!: string;

  @IsString()
  fuelProductId!: string;

  @IsOptional()
  @IsString()
  fuelStationId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  stationNameFree?: string;

  @IsNumber()
  @Min(0)
  odometer!: number;

  @IsNumber()
  @IsPositive()
  liters!: number;

  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @IsNumber()
  @IsPositive()
  totalAmount!: number;

  @IsString()
  @MaxLength(50)
  paymentMethod!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  receiptPhotoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  receiptAccessKey?: string;

  @IsDateString()
  occurredAt!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  tripId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientGeneratedId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  deviceId?: string;

  @IsOptional()
  @IsDateString()
  localCreatedAt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  idempotencyKey?: string;
}
