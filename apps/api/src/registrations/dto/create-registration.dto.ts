import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateRegistrationDto {
  @ApiProperty({ example: 'uuid-of-event' })
  @IsString()
  @IsNotEmpty()
  eventId: string;

  @ApiProperty({ example: 'uuid-of-ticket' })
  @IsString()
  @IsNotEmpty()
  ticketId: string;
}
