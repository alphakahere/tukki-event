import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventsDto } from './dto/query-events.dto';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a URL-friendly slug from event title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Check if user is a member of the organization
   */
  private async checkOrganizationMembership(
    userId: string,
    organizationId: string,
  ) {
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

    return membership;
  }

  /**
   * Create a new event
   */
  async create(userId: string, createEventDto: CreateEventDto) {
    // Check if user is a member of the organization
    await this.checkOrganizationMembership(
      userId,
      createEventDto.organizationId,
    );

    // Validate dates
    const startDate = new Date(createEventDto.startDate);
    const endDate = new Date(createEventDto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Generate slug
    const slug = createEventDto.slug || this.generateSlug(createEventDto.title);

    // Check if slug already exists
    const existingEvent = await this.prisma.event.findUnique({
      where: { slug },
    });

    if (existingEvent) {
      throw new ConflictException('Event with this slug already exists');
    }

    // Create event
    const event = await this.prisma.event.create({
      data: {
        organizationId: createEventDto.organizationId,
        title: createEventDto.title,
        slug,
        description: createEventDto.description,
        startDate,
        endDate,
        location: createEventDto.location,
        venue: createEventDto.venue,
        image: createEventDto.image,
        capacity: createEventDto.capacity,
        status: 'DRAFT',
        isPublished: false,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return event;
  }

  /**
   * Get all events with filters and search
   */
  async findAll(userId: string, query: QueryEventsDto) {
    const {
      search,
      status,
      organizationId,
      startDateFrom,
      startDateTo,
      location,
      sortBy = 'startDate',
      sortOrder = 'asc',
    } = query;

    // Build where clause
    const where: any = {};

    // Only show published events to non-members, or all events to members
    if (!organizationId) {
      where.isPublished = true;
    } else {
      // Check if user is a member of the organization
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      });

      if (!membership) {
        where.isPublished = true;
      }

      where.organizationId = organizationId;
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Date filters
    if (startDateFrom || startDateTo) {
      where.startDate = {};
      if (startDateFrom) {
        where.startDate.gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        where.startDate.lte = new Date(startDateTo);
      }
    }

    // Location filter
    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const events = await this.prisma.event.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            registrations: true,
          },
        },
      },
      orderBy,
    });

    return events.map((event) => ({
      ...event,
      ticketCount: event._count.tickets,
      registrationCount: event._count.registrations,
      availableSpots: event.capacity
        ? event.capacity - event._count.registrations
        : null,
      _count: undefined,
    }));
  }

  /**
   * Get a single event by ID
   */
  async findOne(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user can view this event
    if (!event.isPublished) {
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: event.organizationId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this event');
      }
    }

    return {
      ...event,
      ticketCount: event._count.tickets,
      registrationCount: event._count.registrations,
      availableSpots: event.capacity
        ? event.capacity - event._count.registrations
        : null,
      _count: undefined,
    };
  }

  /**
   * Get a single event by slug
   */
  async findBySlug(slug: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { slug },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            registrations: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user can view this event
    if (!event.isPublished) {
      const membership = await this.prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId: event.organizationId,
          },
        },
      });

      if (!membership) {
        throw new ForbiddenException('You do not have access to this event');
      }
    }

    return {
      ...event,
      ticketCount: event._count.tickets,
      registrationCount: event._count.registrations,
      availableSpots: event.capacity
        ? event.capacity - event._count.registrations
        : null,
      _count: undefined,
    };
  }

  /**
   * Update an event
   */
  async update(id: string, userId: string, updateEventDto: UpdateEventDto) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is a member of the organization
    const membership = await this.checkOrganizationMembership(
      userId,
      event.organizationId,
    );

    // Only owner or admin can update event
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization owner or admin can update events',
      );
    }

    // Validate dates if provided
    if (updateEventDto.startDate || updateEventDto.endDate) {
      const startDate = updateEventDto.startDate
        ? new Date(updateEventDto.startDate)
        : event.startDate;
      const endDate = updateEventDto.endDate
        ? new Date(updateEventDto.endDate)
        : event.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // If updating slug, check uniqueness
    if (updateEventDto.slug && updateEventDto.slug !== event.slug) {
      const existingEvent = await this.prisma.event.findFirst({
        where: {
          slug: updateEventDto.slug,
          NOT: { id },
        },
      });

      if (existingEvent) {
        throw new ConflictException('Event with this slug already exists');
      }
    }

    // Prepare update data
    const updateData: any = { ...updateEventDto };
    if (updateEventDto.startDate) {
      updateData.startDate = new Date(updateEventDto.startDate);
    }
    if (updateEventDto.endDate) {
      updateData.endDate = new Date(updateEventDto.endDate);
    }

    const updatedEvent = await this.prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return updatedEvent;
  }

  /**
   * Delete an event
   */
  async remove(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is a member of the organization
    const membership = await this.checkOrganizationMembership(
      userId,
      event.organizationId,
    );

    // Only owner or admin can delete event
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization owner or admin can delete events',
      );
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  /**
   * Publish an event
   */
  async publish(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tickets: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is a member of the organization
    const membership = await this.checkOrganizationMembership(
      userId,
      event.organizationId,
    );

    // Only owner or admin can publish event
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization owner or admin can publish events',
      );
    }

    // Check if event already published
    if (event.isPublished) {
      throw new BadRequestException('Event is already published');
    }

    // Validate event has at least one ticket before publishing
    if (event._count.tickets === 0) {
      throw new BadRequestException(
        'Event must have at least one ticket type before publishing',
      );
    }

    const publishedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        isPublished: true,
        status: 'PUBLISHED',
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return publishedEvent;
  }

  /**
   * Unpublish an event (back to draft)
   */
  async unpublish(id: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is a member of the organization
    const membership = await this.checkOrganizationMembership(
      userId,
      event.organizationId,
    );

    // Only owner or admin can unpublish event
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization owner or admin can unpublish events',
      );
    }

    if (!event.isPublished) {
      throw new BadRequestException('Event is not published');
    }

    const unpublishedEvent = await this.prisma.event.update({
      where: { id },
      data: {
        isPublished: false,
        status: 'DRAFT',
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return unpublishedEvent;
  }

  /**
   * Get all events for a specific organization
   */
  async findByOrganization(organizationId: string, userId: string) {
    // Check if user is a member of the organization
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    const events = await this.prisma.event.findMany({
      where: {
        organizationId,
        // Show all events if user is a member, otherwise only published
        ...(membership ? {} : { isPublished: true }),
      },
      include: {
        _count: {
          select: {
            tickets: true,
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    return events.map((event) => ({
      ...event,
      ticketCount: event._count.tickets,
      registrationCount: event._count.registrations,
      availableSpots: event.capacity
        ? event.capacity - event._count.registrations
        : null,
      _count: undefined,
    }));
  }
}
