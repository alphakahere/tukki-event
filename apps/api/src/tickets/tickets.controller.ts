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
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketEntity } from './entities/ticket.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('tickets')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('events/:eventId/tickets')
  @ApiOperation({ summary: 'Create a new ticket type for an event' })
  @ApiResponse({
    status: 201,
    description: 'Ticket created successfully',
    type: TicketEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  create(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
    @Body() createTicketDto: CreateTicketDto,
  ) {
    return this.ticketsService.create(userId, eventId, createTicketDto);
  }

  @Get('events/:eventId/tickets')
  @ApiOperation({ summary: 'Get all tickets for an event' })
  @ApiResponse({
    status: 200,
    description: 'List of tickets',
    type: [TicketEntity],
  })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findAll(@Param('eventId') eventId: string) {
    return this.ticketsService.findAll(eventId);
  }

  @Get('tickets/:id')
  @ApiOperation({ summary: 'Get a specific ticket by ID' })
  @ApiResponse({
    status: 200,
    description: 'Ticket details',
    type: TicketEntity,
  })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update a ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket updated successfully',
    type: TicketEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateTicketDto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(userId, id, updateTicketDto);
  }

  @Delete('tickets/:id')
  @ApiOperation({ summary: 'Delete a ticket' })
  @ApiResponse({
    status: 200,
    description: 'Ticket deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Ticket not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete ticket that has been sold',
  })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ticketsService.remove(userId, id);
  }
}
