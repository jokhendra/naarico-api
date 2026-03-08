import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StoreStatus } from '@prisma/client';

export class UpdateStoreStatusDto {
  @ApiProperty({
    description: 'Store status',
    enum: StoreStatus,
    example: StoreStatus.APPROVED,
  })
  @IsEnum(StoreStatus)
  status: StoreStatus;
}

