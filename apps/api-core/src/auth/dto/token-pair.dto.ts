import { ApiProperty } from '@nestjs/swagger';

export class TokenUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ type: [String] })
  permissions!: string[];
}

export class TokenPairDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty()
  accessTokenExpiresAt!: Date;

  @ApiProperty()
  refreshTokenExpiresAt!: Date;

  @ApiProperty({ type: TokenUserDto })
  user!: TokenUserDto;
}
