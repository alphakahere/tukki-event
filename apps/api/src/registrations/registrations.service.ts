import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ValidateRegistrationDto } from './dto/validate-registration.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RegistrationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Generate a unique QR code
   */
  private generateQRCode(): string {
    return `TKE-${uuidv4()}`.toUpperCase();
  }

  /**
   * Register a user for an event
   */
  async create(userId: string, createRegistrationDto: CreateRegistrationDto) {
    const { eventId, ticketId } = createRegistrationDto;

    // Check if event exists and is published
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (!event.isPublished) {
      throw new BadRequestException('Event is not published yet');
    }

    // Check if ticket exists and belongs to event
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (ticket.eventId !== eventId) {
      throw new BadRequestException('Ticket does not belong to this event');
    }

    // Check if ticket is active
    if (!ticket.isActive) {
      throw new BadRequestException('Ticket is not available');
    }

    // Check sale period
    const now = new Date();
    if (ticket.saleStart && ticket.saleStart > now) {
      throw new BadRequestException('Ticket sales have not started yet');
    }
    if (ticket.saleEnd && ticket.saleEnd < now) {
      throw new BadRequestException('Ticket sales have ended');
    }

    // Check if tickets are available
    if (ticket.soldCount >= ticket.quantity) {
      throw new BadRequestException('No more tickets available');
    }

    // Check event capacity
    if (event.capacity) {
      const registrationCount = await this.prisma.registration.count({
        where: {
          eventId,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
      });

      if (registrationCount >= event.capacity) {
        throw new BadRequestException('Event is at full capacity');
      }
    }

    // Check if user already registered for this event
    const existingRegistration = await this.prisma.registration.findFirst({
      where: {
        userId,
        eventId,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (existingRegistration) {
      throw new ConflictException('You are already registered for this event');
    }

    // Generate QR code
    const qrCode = this.generateQRCode();

    // Create registration in a transaction
    const registration = await this.prisma.$transaction(async (tx) => {
      // Increment sold count
      await tx.ticket.update({
        where: { id: ticketId },
        data: {
          soldCount: { increment: 1 },
        },
      });

      // Create registration
      return tx.registration.create({
        data: {
          userId,
          eventId,
          ticketId,
          qrCode,
          status: 'PENDING', // Will be CONFIRMED after payment
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
          event: {
            select: {
              id: true,
              title: true,
              slug: true,
              startDate: true,
              endDate: true,
              location: true,
              venue: true,
            },
          },
          ticket: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      });
    });

    return registration;
  }

  /**
   * Get all registrations for current user
   */
  async findAll(userId: string) {
    const registrations = await this.prisma.registration.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            location: true,
            venue: true,
            image: true,
          },
        },
        ticket: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return registrations;
  }

  /**
   * Get a single registration by ID
   */
  async findOne(id: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        event: {
          select: {
            id: true,
            title: true,
            slug: true,
            startDate: true,
            endDate: true,
            location: true,
            venue: true,
            image: true,
          },
        },
        ticket: {
          select: {
            id: true,
            name: true,
            price: true,
            description: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Only owner or event organizers can view registration
    if (registration.userId !== userId) {
      const event = await this.prisma.event.findUnique({
        where: { id: registration.eventId },
      });

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
          'You do not have access to this registration',
        );
      }
    }

    return registration;
  }

  /**
   * Cancel a registration
   */
  async cancel(id: string, userId: string) {
    const registration = await this.prisma.registration.findUnique({
      where: { id },
    });

    if (!registration) {
      throw new NotFoundException('Registration not found');
    }

    // Only owner can cancel
    if (registration.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own registration');
    }

    // Can't cancel if already attended
    if (registration.status === 'ATTENDED') {
      throw new BadRequestException('Cannot cancel after attending');
    }

    // Can't cancel if already cancelled
    if (registration.status === 'CANCELLED') {
      throw new BadRequestException('Registration is already cancelled');
    }

    // Cancel in transaction
    const cancelledRegistration = await this.prisma.$transaction(async (tx) => {
      // Decrement sold count
      await tx.ticket.update({
        where: { id: registration.ticketId },
        data: {
          soldCount: { decrement: 1 },
        },
      });

      // Update registration status
      return tx.registration.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });
    });

    return cancelledRegistration;
  }

  /**
   * Validate a registration using QR code (mark as attended)
   */
  async validate(userId: string, validateRegistrationDto: ValidateRegistrationDto) {
    const { qrCode } = validateRegistrationDto;

    const registration = await this.prisma.registration.findUnique({
      where: { qrCode },
      include: {
        event: true,
      },
    });

    if (!registration) {
      throw new NotFoundException('Invalid QR code');
    }

    // Check if user is authorized to validate (must be organization member)
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: registration.event.organizationId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException(
        'You are not authorized to validate registrations for this event',
      );
    }

    // Can't validate if not confirmed
    if (registration.status !== 'CONFIRMED') {
      throw new BadRequestException(
        `Cannot validate registration with status: ${registration.status}`,
      );
    }

    // Update status to ATTENDED
    const validatedRegistration = await this.prisma.registration.update({
      where: { id: registration.id },
      data: {
        status: 'ATTENDED',
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
        event: {
          select: {
            id: true,
            title: true,
          },
        },
        ticket: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return validatedRegistration;
  }

  /**
   * Get all registrations for an event (organizers only)
   */
  async findByEvent(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if user is organization member
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
        'You are not authorized to view registrations for this event',
      );
    }

    const registrations = await this.prisma.registration.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        ticket: {
          select: {
            id: true,
            name: true,
            price: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return registrations;
  }
}
