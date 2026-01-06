import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  MaxLength,
  IsBoolean,
} from 'class-validator';

export class UpdateTicketDto {
  @ApiProperty({ example: 'General Admission', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'Access to all conference sessions',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 49.99, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 100, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantity?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  saleStart?: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  saleEnd?: string;
}
