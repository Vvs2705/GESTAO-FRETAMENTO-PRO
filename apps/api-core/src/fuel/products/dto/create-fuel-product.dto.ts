import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateFuelProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  unit?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
