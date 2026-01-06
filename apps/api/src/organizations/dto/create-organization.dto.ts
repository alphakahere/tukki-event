import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'Tech Events Inc' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

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
