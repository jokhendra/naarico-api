import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateUserRoleDto {
  @ApiProperty({
    description: 'User role',
    enum: Role,
    example: Role.SELLER,
  })
  @IsEnum(Role)
  role: Role;
}

