import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

export const ORGANIZATION_PERMISSIONS_KEY = 'organizationPermissions';

export enum OrganizationPermission {
  OWNER_ONLY = 'OWNER_ONLY',
  ADMIN_OR_OWNER = 'ADMIN_OR_OWNER',
  ANY_MEMBER = 'ANY_MEMBER',
}

export const RequireOrganizationPermission = (
  permission: OrganizationPermission,
) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata(
      ORGANIZATION_PERMISSIONS_KEY,
      permission,
      descriptor.value,
    );
    return descriptor;
  };
};

@Injectable()
export class OrganizationPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<OrganizationPermission>(
      ORGANIZATION_PERMISSIONS_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const organizationId = request.params.id || request.params.organizationId;

    if (!organizationId) {
      throw new ForbiddenException('Organization ID is required');
    }

    // Check if organization exists
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check membership
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this organization',
      );
    }

    // Check permissions based on role
    switch (requiredPermission) {
      case OrganizationPermission.OWNER_ONLY:
        if (membership.role !== 'OWNER') {
          throw new ForbiddenException('Only organization owner can perform this action');
        }
        break;

      case OrganizationPermission.ADMIN_OR_OWNER:
        if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
          throw new ForbiddenException('Only organization owner or admin can perform this action');
        }
        break;

      case OrganizationPermission.ANY_MEMBER:
        // Already checked membership above
        break;

      default:
        return false;
    }

    return true;
  }
}
