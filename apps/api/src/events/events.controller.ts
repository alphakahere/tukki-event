import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EventEntity } from './entities/event.entity';

@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
    type: EventEntity,
  })
  @ApiResponse({ status: 403, description: 'Not a member of organization' })
  @ApiResponse({ status: 409, description: 'Event slug already exists' })
  @ApiResponse({ status: 400, description: 'Invalid dates' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventsService.create(userId, createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all events with filters' })
  @ApiResponse({
    status: 200,
    description: 'Events retrieved successfully',
    type: [EventEntity],
  })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['DRAFT', 'PUBLISHED', 'ONGOING', 'COMPLETED', 'CANCELLED'] })
  @ApiQuery({ name: 'organizationId', required: false })
  @ApiQuery({ name: 'startDateFrom', required: false })
  @ApiQuery({ name: 'startDateTo', required: false })
  @ApiQuery({ name: 'location', required: false })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['startDate', 'createdAt', 'title'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  findAll(@CurrentUser('id') userId: string, @Query() query: QueryEventsDto) {
    return this.eventsService.findAll(userId, query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get event by slug' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventEntity,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Access denied to unpublished event' })
  findBySlug(@Param('slug') slug: string, @CurrentUser('id') userId: string) {
    return this.eventsService.findBySlug(slug, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event retrieved successfully',
    type: EventEntity,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Access denied to unpublished event' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event (Owner/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
    type: EventEntity,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Event slug already exists' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, userId, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event (Owner/Admin only)' })
  @ApiResponse({ status: 200, description: 'Event deleted successfully' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.remove(id, userId);
  }

  @Post(':id/publish')
  @ApiOperation({ summary: 'Publish event (Owner/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Event published successfully',
    type: EventEntity,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Event already published or missing tickets' })
  publish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.publish(id, userId);
  }

  @Post(':id/unpublish')
  @ApiOperation({ summary: 'Unpublish event back to draft (Owner/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Event unpublished successfully',
    type: EventEntity,
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  @ApiResponse({ status: 400, description: 'Event is not published' })
  unpublish(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.eventsService.unpublish(id, userId);
  }
}
