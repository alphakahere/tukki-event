import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateRegistrationDto {
  @ApiProperty({ example: 'QR-CODE-STRING' })
  @IsString()
  @IsNotEmpty()
  qrCode: string;
}
