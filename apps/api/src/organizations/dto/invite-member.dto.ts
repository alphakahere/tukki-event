import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({ example: 'member@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    enum: ['OWNER', 'ADMIN', 'STAFF'],
    default: 'STAFF',
    required: false
  })
  @IsEnum(['OWNER', 'ADMIN', 'STAFF'])
  @IsOptional()
  role?: 'OWNER' | 'ADMIN' | 'STAFF';
}
