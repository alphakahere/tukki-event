import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: ['OWNER', 'ADMIN', 'STAFF'],
    example: 'ADMIN'
  })
  @IsEnum(['OWNER', 'ADMIN', 'STAFF'])
  role: 'OWNER' | 'ADMIN' | 'STAFF';
}
