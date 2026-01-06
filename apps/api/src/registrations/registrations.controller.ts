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
import { RegistrationsService } from './registrations.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import { ValidateRegistrationDto } from './dto/validate-registration.dto';
import { RegistrationEntity } from './entities/registration.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('registrations')
@Controller('api/v1')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegistrationsController {
  constructor(private readonly registrationsService: RegistrationsService) {}

  @Post('registrations')
  @ApiOperation({ summary: 'Register for an event' })
  @ApiResponse({
    status: 201,
    description: 'Registration created successfully',
    type: RegistrationEntity,
  })
  @ApiResponse({ status: 400, description: 'Bad request - Validation failed' })
  @ApiResponse({ status: 404, description: 'Event or ticket not found' })
  @ApiResponse({ status: 409, description: 'Already registered for this event' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createRegistrationDto: CreateRegistrationDto,
  ) {
    return this.registrationsService.create(userId, createRegistrationDto);
  }

  @Get('registrations')
  @ApiOperation({ summary: 'Get all registrations for current user' })
  @ApiResponse({
    status: 200,
    description: 'List of user registrations',
    type: [RegistrationEntity],
  })
  findAll(@CurrentUser('id') userId: string) {
    return this.registrationsService.findAll(userId);
  }

  @Get('registrations/:id')
  @ApiOperation({ summary: 'Get a specific registration by ID' })
  @ApiResponse({
    status: 200,
    description: 'Registration details',
    type: RegistrationEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.registrationsService.findOne(id, userId);
  }

  @Patch('registrations/:id/cancel')
  @ApiOperation({ summary: 'Cancel a registration' })
  @ApiResponse({
    status: 200,
    description: 'Registration cancelled successfully',
    type: RegistrationEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Registration not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot cancel after attending or already cancelled',
  })
  cancel(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.registrationsService.cancel(id, userId);
  }

  @Post('registrations/validate')
  @ApiOperation({ summary: 'Validate a registration using QR code (check-in)' })
  @ApiResponse({
    status: 200,
    description: 'Registration validated and marked as attended',
    type: RegistrationEntity,
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Invalid QR code' })
  @ApiResponse({
    status: 400,
    description: 'Cannot validate registration with current status',
  })
  validate(
    @CurrentUser('id') userId: string,
    @Body() validateRegistrationDto: ValidateRegistrationDto,
  ) {
    return this.registrationsService.validate(userId, validateRegistrationDto);
  }

  @Get('events/:eventId/registrations')
  @ApiOperation({ summary: 'Get all registrations for an event (organizers only)' })
  @ApiResponse({
    status: 200,
    description: 'List of event registrations',
    type: [RegistrationEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Not authorized' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  findByEvent(
    @Param('eventId') eventId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.registrationsService.findByEvent(eventId, userId);
  }
}
