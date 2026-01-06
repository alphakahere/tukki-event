import { ApiProperty } from '@nestjs/swagger';

export class OrganizationEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ required: false })
  logo?: string;

  @ApiProperty()
  ownerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  memberCount?: number;

  @ApiProperty({ required: false })
  eventCount?: number;
}
