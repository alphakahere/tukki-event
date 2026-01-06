import { ApiProperty } from '@nestjs/swagger';

export class TicketEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty()
  price: number;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  soldCount: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  saleStart?: Date;

  @ApiProperty({ required: false })
  saleEnd?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  availableCount?: number;

  @ApiProperty({ required: false })
  isAvailable?: boolean;
}
