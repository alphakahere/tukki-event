import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateTicketDto {
  @ApiProperty({ example: 'General Admission' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'Access to all conference sessions',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({ example: 49.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 100, description: 'Total number of tickets available' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
    description: 'When ticket sales start',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  saleStart?: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'When ticket sales end',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  saleEnd?: string;
}
