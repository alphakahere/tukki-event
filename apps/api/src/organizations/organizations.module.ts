import { Module } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsController } from './organizations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationPermissionGuard } from './guards/organization-permission.guard';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [PrismaModule, EventsModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationPermissionGuard],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
