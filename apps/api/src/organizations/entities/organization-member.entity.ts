import { ApiProperty } from '@nestjs/swagger';

export class OrganizationMemberEntity {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty({ enum: ['OWNER', 'ADMIN', 'STAFF'] })
  role: string;

  @ApiProperty({ required: false })
  invitedBy?: string;

  @ApiProperty({ required: false })
  invitedAt?: Date;

  @ApiProperty()
  joinedAt: Date;

  @ApiProperty({ required: false })
  user?: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
}
