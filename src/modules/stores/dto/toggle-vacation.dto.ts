import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ToggleVacationDto {
  @ApiProperty({
    description: 'Enable or disable vacation mode',
    example: true,
  })
  @IsBoolean()
  isOnVacation: boolean;

  @ApiPropertyOptional({
    description: 'Message to display during vacation',
    example: 'Store is on vacation. We will be back on January 15th!',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  vacationMessage?: string;
}

