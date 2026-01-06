import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a URL-friendly slug from organization name
   */
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Create a new organization
   */
  async create(userId: string, createOrganizationDto: CreateOrganizationDto) {
    const slug =
      createOrganizationDto.slug ||
      this.generateSlug(createOrganizationDto.name);

    // Check if slug already exists
    const existingOrg = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      throw new ConflictException(
        'Organization with this slug already exists',
      );
    }

    // Create organization with owner as first member
    const organization = await this.prisma.organization.create({
      data: {
        name: createOrganizationDto.name,
        slug,
        description: createOrganizationDto.description,
        logo: createOrganizationDto.logo,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return organization;
  }

  /**
   * Get all organizations for a user
   */
  async findAll(userId: string) {
    const organizations = await this.prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: {
          select: {
            members: true,
            events: true,
          },
        },
        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return organizations.map((org) => ({
      ...org,
      memberCount: org._count.members,
      eventCount: org._count.events,
      userRole: org.members[0]?.role,
      _count: undefined,
      members: undefined,
    }));
  }

  /**
   * Get a single organization by ID
   */
  async findOne(id: string, userId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            members: true,
            events: true,
          },
        },
        members: {
          where: {
            userId,
          },
          select: {
            role: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user is a member
    if (organization.members.length === 0) {
      throw new ForbiddenException(
        'You are not a member of this organization',
      );
    }

    return {
      ...organization,
      memberCount: organization._count.members,
      eventCount: organization._count.events,
      userRole: organization.members[0]?.role,
      _count: undefined,
      members: undefined,
    };
  }

  /**
   * Update an organization
   */
  async update(
    id: string,
    userId: string,
    updateOrganizationDto: UpdateOrganizationDto,
  ) {
    // Check if user has permission (owner or admin)
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id,
        },
      },
    });

    if (!membership || (membership.role !== 'OWNER' && membership.role !== 'ADMIN')) {
      throw new ForbiddenException(
        'Only organization owner or admin can update the organization',
      );
    }

    // If updating slug, check uniqueness
    if (updateOrganizationDto.slug) {
      const existingOrg = await this.prisma.organization.findFirst({
        where: {
          slug: updateOrganizationDto.slug,
          NOT: { id },
        },
      });

      if (existingOrg) {
        throw new ConflictException(
          'Organization with this slug already exists',
        );
      }
    }

    const organization = await this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
    });

    return organization;
  }

  /**
   * Delete an organization
   */
  async remove(id: string, userId: string) {
    // Only owner can delete
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: id,
        },
      },
    });

    if (!membership || membership.role !== 'OWNER') {
      throw new ForbiddenException('Only organization owner can delete the organization');
    }

    await this.prisma.organization.delete({
      where: { id },
    });

    return { message: 'Organization deleted successfully' };
  }

  /**
   * Invite a member to the organization
   */
  async inviteMember(
    organizationId: string,
    inviterId: string,
    inviteMemberDto: InviteMemberDto,
  ) {
    // Check if inviter has permission
    const inviterMembership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: inviterId,
          organizationId,
        },
      },
    });

    if (
      !inviterMembership ||
      (inviterMembership.role !== 'OWNER' && inviterMembership.role !== 'ADMIN')
    ) {
      throw new ForbiddenException(
        'Only organization owner or admin can invite members',
      );
    }

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: inviteMemberDto.email },
    });

    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId,
        },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    // Only owner can invite other owners
    if (inviteMemberDto.role === 'OWNER' && inviterMembership.role !== 'OWNER') {
      throw new ForbiddenException('Only organization owner can invite other owners');
    }

    const member = await this.prisma.organizationMember.create({
      data: {
        userId: user.id,
        organizationId,
        role: inviteMemberDto.role || 'STAFF',
        invitedBy: inviterId,
        invitedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return member;
  }

  /**
   * Get all members of an organization
   */
  async getMembers(organizationId: string, userId: string) {
    // Check if user is a member
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this organization',
      );
    }

    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' }, // OWNER first, then ADMIN, then STAFF
        { joinedAt: 'asc' },
      ],
    });

    return members;
  }

  /**
   * Update a member's role
   */
  async updateMemberRole(
    organizationId: string,
    targetUserId: string,
    currentUserId: string,
    updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    // Check current user's permission
    const currentUserMembership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: currentUserId,
          organizationId,
        },
      },
    });

    if (!currentUserMembership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    // Only owner can change roles to/from OWNER
    if (
      (updateMemberRoleDto.role === 'OWNER' ||
        currentUserMembership.role === 'OWNER') &&
      currentUserMembership.role !== 'OWNER'
    ) {
      throw new ForbiddenException('Only organization owner can manage owner role');
    }

    // Only owner or admin can change roles
    if (
      currentUserMembership.role !== 'OWNER' &&
      currentUserMembership.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Only organization owner or admin can change member roles',
      );
    }

    // Can't change your own role
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot change your own role');
    }

    const member = await this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
      data: {
        role: updateMemberRoleDto.role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return member;
  }

  /**
   * Remove a member from the organization
   */
  async removeMember(
    organizationId: string,
    targetUserId: string,
    currentUserId: string,
  ) {
    // Check current user's permission
    const currentUserMembership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: currentUserId,
          organizationId,
        },
      },
    });

    if (!currentUserMembership) {
      throw new ForbiddenException('You are not a member of this organization');
    }

    // Get target member
    const targetMember = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    if (!targetMember) {
      throw new NotFoundException('Member not found in this organization');
    }

    // Can't remove the owner
    if (targetMember.role === 'OWNER') {
      throw new ForbiddenException('Cannot remove organization owner');
    }

    // Only owner or admin can remove members
    if (
      currentUserMembership.role !== 'OWNER' &&
      currentUserMembership.role !== 'ADMIN'
    ) {
      throw new ForbiddenException(
        'Only organization owner or admin can remove members',
      );
    }

    // Admins can't remove other admins
    if (
      currentUserMembership.role === 'ADMIN' &&
      targetMember.role === 'ADMIN'
    ) {
      throw new ForbiddenException('Admins cannot remove other admins');
    }

    await this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }
}
