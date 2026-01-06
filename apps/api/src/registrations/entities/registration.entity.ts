import { ApiProperty } from '@nestjs/swagger';

export class RegistrationEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  eventId: string;

  @ApiProperty()
  ticketId: string;

  @ApiProperty({ enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'ATTENDED'] })
  status: string;

  @ApiProperty()
  qrCode: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ required: false })
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };

  @ApiProperty({ required: false })
  event?: {
    id: string;
    title: string;
    slug: string;
    startDate: Date;
    endDate: Date;
  };

  @ApiProperty({ required: false })
  ticket?: {
    id: string;
    name: string;
    price: number;
  };

  @ApiProperty({ required: false })
  payment?: {
    id: string;
    amount: number;
    status: string;
  };
}
