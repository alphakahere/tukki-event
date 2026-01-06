import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationPermissionGuard } from './guards/organization-permission.guard';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationPermissionGuard],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
