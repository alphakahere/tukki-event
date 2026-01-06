import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiProperty({ example: 'Tech Events Inc', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @ApiProperty({
    example: 'tech-events-inc',
    description: 'URL-friendly slug (lowercase, alphanumeric, hyphens)',
    required: false
  })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens only'
  })
  slug?: string;

  @ApiProperty({
    example: 'We organize amazing tech events',
    required: false
  })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    example: 'https://example.com/logo.png',
    required: false
  })
  @IsString()
  @IsOptional()
  logo?: string;
}
