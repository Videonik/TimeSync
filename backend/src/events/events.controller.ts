import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';
import { Event } from '../entities/event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  async createEvent(@Body() body: { eventData: Partial<Event>, participantsEmails: string[] }) {
    return this.eventsService.createEvent(body.eventData, body.participantsEmails);
  }

  @Get(':id')
  async getEvent(@Param('id') id: string) {
    return this.eventsService.getEvent(id);
  }

  @Post(':id/participants')
  async addParticipant(
    @Param('id') eventId: string,
    @Body('email') email: string
  ) {
    return this.eventsService.addParticipant(eventId, email);
  }

  @Post(':id/generate-slots')
  async generateSlots(@Param('id') eventId: string) {
    return this.eventsService.generateTimeSlots(eventId);
  }

  @Get(':id/slots')
  async getSlots(@Param('id') eventId: string) {
    return this.eventsService.getEventTimeSlots(eventId);
  }

  @Post(':id/vote')
  async submitVote(
    @Param('id') eventId: string,
    @Body('participantId') participantId: string,
    @Body('timeSlotId') timeSlotId: string,
    @Body('availability') availability: any
  ) {
    return this.eventsService.submitVote(participantId, timeSlotId, availability);
  }
}
