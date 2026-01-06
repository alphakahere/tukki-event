import { ApiProperty } from '@nestjs/swagger';

export class EventEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;

  @ApiProperty({ required: false })
  location?: string;

  @ApiProperty({ required: false })
  venue?: string;

  @ApiProperty({ required: false })
  image?: string;

  @ApiProperty({ enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'] })
  status: string;

  @ApiProperty({ required: false })
  capacity?: number;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  organization?: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({ required: false })
  ticketCount?: number;

  @ApiProperty({ required: false })
  registrationCount?: number;

  @ApiProperty({ required: false })
  availableSpots?: number;
}
