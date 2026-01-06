import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Check if user is a member of the event's organization
   */
  private async checkEventAccess(userId: string, eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: event.organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not a member of this event organization',
      );
    }

    return { event, membership };
  }

  /**
   * Create a new ticket type for an event
   */
  async create(userId: string, eventId: string, createTicketDto: CreateTicketDto) {
    const { event, membership } = await this.checkEventAccess(userId, eventId);

    // Only owner or admin can create tickets
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization owner or admin can create tickets',
      );
    }

    // Validate sale dates if provided
    if (createTicketDto.saleStart && createTicketDto.saleEnd) {
      const saleStart = new Date(createTicketDto.saleStart);
      const saleEnd = new Date(createTicketDto.saleEnd);

      if (saleEnd <= saleStart) {
        throw new BadRequestException('Sale end date must be after sale start date');
      }

      // Sale period should be before or during event
      if (saleStart > event.endDate) {
        throw new BadRequestException('Sale start date cannot be after event end date');
      }
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        eventId,
        name: createTicketDto.name,
        description: createTicketDto.description,
        price: createTicketDto.price,
        quantity: createTicketDto.quantity,
        soldCount: 0,
        isActive: true,
        saleStart: createTicketDto.saleStart ? new Date(createTicketDto.saleStart) : null,
        saleEnd: createTicketDto.saleEnd ? new Date(createTicketDto.saleEnd) : null,
      },
    });

    return ticket;
  }

  /**
   * Get all tickets for an event
   */
  async findAll(eventId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    const tickets = await this.prisma.ticket.findMany({
      where: { eventId },
      orderBy: { createdAt: 'asc' },
    });

    const now = new Date();

    return tickets.map((ticket) => ({
      ...ticket,
      availableCount: ticket.quantity - ticket.soldCount,
      isAvailable:
        ticket.isActive &&
        ticket.quantity > ticket.soldCount &&
        (!ticket.saleStart || ticket.saleStart <= now) &&
        (!ticket.saleEnd || ticket.saleEnd >= now),
    }));
  }

  /**
   * Get a single ticket by ID
   */
  async findOne(ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const now = new Date();

    return {
      ...ticket,
      availableCount: ticket.quantity - ticket.soldCount,
      isAvailable:
        ticket.isActive &&
        ticket.quantity > ticket.soldCount &&
        (!ticket.saleStart || ticket.saleStart <= now) &&
        (!ticket.saleEnd || ticket.saleEnd >= now),
    };
  }

  /**
   * Update a ticket
   */
  async update(
    userId: string,
    ticketId: string,
    updateTicketDto: UpdateTicketDto,
  ) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const { membership } = await this.checkEventAccess(userId, ticket.eventId);

    // Only owner or admin can update tickets
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization owner or admin can update tickets',
      );
    }

    // Validate sale dates if both are provided
    if (updateTicketDto.saleStart && updateTicketDto.saleEnd) {
      const saleStart = new Date(updateTicketDto.saleStart);
      const saleEnd = new Date(updateTicketDto.saleEnd);

      if (saleEnd <= saleStart) {
        throw new BadRequestException('Sale end date must be after sale start date');
      }
    }

    // Don't allow decreasing quantity below sold count
    if (updateTicketDto.quantity !== undefined) {
      if (updateTicketDto.quantity < ticket.soldCount) {
        throw new BadRequestException(
          `Cannot set quantity below sold count (${ticket.soldCount})`,
        );
      }
    }

    const updateData: any = { ...updateTicketDto };
    if (updateTicketDto.saleStart) {
      updateData.saleStart = new Date(updateTicketDto.saleStart);
    }
    if (updateTicketDto.saleEnd) {
      updateData.saleEnd = new Date(updateTicketDto.saleEnd);
    }

    const updatedTicket = await this.prisma.ticket.update({
      where: { id: ticketId },
      data: updateData,
    });

    const now = new Date();

    return {
      ...updatedTicket,
      availableCount: updatedTicket.quantity - updatedTicket.soldCount,
      isAvailable:
        updatedTicket.isActive &&
        updatedTicket.quantity > updatedTicket.soldCount &&
        (!updatedTicket.saleStart || updatedTicket.saleStart <= now) &&
        (!updatedTicket.saleEnd || updatedTicket.saleEnd >= now),
    };
  }

  /**
   * Delete a ticket
   */
  async remove(userId: string, ticketId: string) {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const { membership } = await this.checkEventAccess(userId, ticket.eventId);

    // Only owner or admin can delete tickets
    if (membership.role !== 'OWNER' && membership.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only organization owner or admin can delete tickets',
      );
    }

    // Don't allow deleting tickets that have been sold
    if (ticket.soldCount > 0) {
      throw new BadRequestException(
        'Cannot delete ticket that has been sold',
      );
    }

    await this.prisma.ticket.delete({
      where: { id: ticketId },
    });

    return { message: 'Ticket deleted successfully' };
  }
}
