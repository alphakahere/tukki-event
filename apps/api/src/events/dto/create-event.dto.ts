import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateEventDto {
  @ApiProperty({ example: 'uuid-of-organization' })
  @IsString()
  @IsNotEmpty()
  organizationId: string;

  @ApiProperty({ example: 'Tech Conference 2024' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example: 'tech-conference-2024',
    description: 'URL-friendly slug (lowercase, alphanumeric, hyphens)',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only',
  })
  slug?: string;

  @ApiProperty({
    example: 'Join us for the biggest tech conference of the year!',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  description?: string;

  @ApiProperty({ example: '2024-12-20T09:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2024-12-20T18:00:00.000Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 'Paris, France', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;

  @ApiProperty({ example: 'Convention Center Paris', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(200)
  venue?: string;

  @ApiProperty({ example: 'https://example.com/event-image.jpg', required: false })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiProperty({ example: 500, description: 'Maximum number of attendees', required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  capacity?: number;
}
