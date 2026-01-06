import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrganizationEntity } from './entities/organization.entity';
import { OrganizationMemberEntity } from './entities/organization-member.entity';
import { EventsService } from '../events/events.service';
import { EventEntity } from '../events/entities/event.entity';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly eventsService: EventsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully',
    type: OrganizationEntity,
  })
  @ApiResponse({ status: 409, description: 'Organization slug already exists' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(userId, createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all organizations for current user' })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully',
    type: [OrganizationEntity],
  })
  findAll(@CurrentUser('id') userId: string) {
    return this.organizationsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({
    status: 200,
    description: 'Organization retrieved successfully',
    type: OrganizationEntity,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 403, description: 'Not a member of this organization' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update organization (Owner/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully',
    type: OrganizationEntity,
  })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, userId, updateOrganizationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete organization (Owner only)' })
  @ApiResponse({ status: 200, description: 'Organization deleted successfully' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  @ApiResponse({ status: 403, description: 'Only owner can delete organization' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.organizationsService.remove(id, userId);
  }

  // ==================== MEMBER MANAGEMENT ====================

  @Post(':id/members')
  @ApiOperation({ summary: 'Invite a member to organization (Owner/Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Member invited successfully',
    type: OrganizationMemberEntity,
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  inviteMember(
    @Param('id') organizationId: string,
    @CurrentUser('id') userId: string,
    @Body() inviteMemberDto: InviteMemberDto,
  ) {
    return this.organizationsService.inviteMember(
      organizationId,
      userId,
      inviteMemberDto,
    );
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'Get all members of organization' })
  @ApiResponse({
    status: 200,
    description: 'Members retrieved successfully',
    type: [OrganizationMemberEntity],
  })
  @ApiResponse({ status: 403, description: 'Not a member of this organization' })
  getMembers(
    @Param('id') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.organizationsService.getMembers(organizationId, userId);
  }

  @Patch(':id/members/:userId')
  @ApiOperation({ summary: 'Update member role (Owner/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Member role updated successfully',
    type: OrganizationMemberEntity,
  })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Cannot change your own role' })
  updateMemberRole(
    @Param('id') organizationId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') currentUserId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
  ) {
    return this.organizationsService.updateMemberRole(
      organizationId,
      targetUserId,
      currentUserId,
      updateMemberRoleDto,
    );
  }

  @Delete(':id/members/:userId')
  @ApiOperation({ summary: 'Remove member from organization (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  removeMember(
    @Param('id') organizationId: string,
    @Param('userId') targetUserId: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    return this.organizationsService.removeMember(
      organizationId,
      targetUserId,
      currentUserId,
    );
  }

  // ==================== EVENTS ====================

  @Get(':id/events')
  @ApiOperation({ summary: 'Get all events for organization' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventEntity],
  })
  @ApiResponse({ status: 403, description: 'Not a member of this organization' })
  getEvents(
    @Param('id') organizationId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.eventsService.findByOrganization(organizationId, userId);
  }
}
