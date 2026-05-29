import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  tenantId!: string;

  @ApiProperty({ required: false })
  employeeId?: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty()
  status!: string;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class UserWithPermissionsDto extends UserResponseDto {
  @ApiProperty({ required: false })
  roleId?: string;

  @ApiProperty({ required: false })
  roleName?: string;

  @ApiProperty({ type: [String] })
  permissions!: string[];
}

/**
 * Strips sensitive fields from a Prisma user record.
 * passwordHash is NEVER returned.
 */
export function toUserResponse(user: {
  id: string;
  tenantId: string;
  employeeId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  status: string;
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): UserResponseDto {
  const dto: UserResponseDto = {
    id: user.id,
    tenantId: user.tenantId,
    name: user.name,
    email: user.email,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  if (user.employeeId) {
    dto.employeeId = user.employeeId;
  }
  if (user.phone) {
    dto.phone = user.phone;
  }
  if (user.lastLoginAt) {
    dto.lastLoginAt = user.lastLoginAt;
  }

  return dto;
}
