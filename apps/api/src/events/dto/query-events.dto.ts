import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export class QueryEventsDto {
  @ApiProperty({ required: false, description: 'Search in title and description' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiProperty({
    enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'],
    required: false,
    description: 'Filter by event status',
  })
  @IsEnum(['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'])
  @IsOptional()
  status?: string;

  @ApiProperty({ required: false, description: 'Filter by organization ID' })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ required: false, description: 'Filter events starting after this date' })
  @IsDateString()
  @IsOptional()
  startDateFrom?: string;

  @ApiProperty({ required: false, description: 'Filter events starting before this date' })
  @IsDateString()
  @IsOptional()
  startDateTo?: string;

  @ApiProperty({ required: false, description: 'Filter by location' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({
    enum: ['startDate', 'createdAt', 'title'],
    default: 'startDate',
    required: false,
    description: 'Sort by field',
  })
  @IsString()
  @IsOptional()
  sortBy?: string;

  @ApiProperty({
    enum: ['asc', 'desc'],
    default: 'asc',
    required: false,
    description: 'Sort order',
  })
  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc';
}
