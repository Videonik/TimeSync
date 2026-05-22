import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Participant } from '../entities/participant.entity';
import { TimeSlot } from '../entities/time-slot.entity';
import { SchedulerService } from '../scheduler/scheduler.service';
import { User } from '../entities/user.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(Participant)
    private participantRepository: Repository<Participant>,
    @InjectRepository(TimeSlot)
    private timeSlotRepository: Repository<TimeSlot>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private schedulerService: SchedulerService,
  ) {}

  async createEvent(eventData: Partial<Event>, participantsEmails: string[]): Promise<Event> {
    const user = await this.userRepository.findOne({ where: { id: eventData.organizerId } });
    if (!user) {
        throw new BadRequestException('Organizer not found');
    }

    const event = this.eventRepository.create(eventData);
    await this.eventRepository.save(event);

    const participants = participantsEmails.map(email => 
      this.participantRepository.create({
        email,
        eventId: event.id,
      })
    );
    await this.participantRepository.save(participants);

    await this.generateTimeSlots(event.id);

    return event;
  }

  async getEvent(id: string): Promise<{ event: Event, participants: Participant[], timeSlots: TimeSlot[] }> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');

    const participants = await this.participantRepository.find({ where: { eventId: id } });
    const timeSlots = await this.timeSlotRepository.find({ where: { eventId: id }, order: { startTime: 'ASC' } });

    return { event, participants, timeSlots };
  }

  async addParticipant(eventId: string, email: string): Promise<Participant> {
    const participant = this.participantRepository.create({ eventId, email });
    return this.participantRepository.save(participant);
  }

  async generateTimeSlots(eventId: string): Promise<TimeSlot[]> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new NotFoundException('Event not found');
    
    const participants = await this.participantRepository.find({ where: { eventId } });

    const generatedSlots = await this.schedulerService.findOptimalSlots(
      event,
      participants.map(p => p.email),
      event.durationMinutes
    );

    const timeSlots = generatedSlots.map(slot => this.timeSlotRepository.create({
      eventId: event.id,
      startTime: slot.start,
      endTime: slot.end,
    }));

    await this.timeSlotRepository.save(timeSlots);
    return timeSlots;
  }

  async getEventTimeSlots(eventId: string): Promise<TimeSlot[]> {
    return this.timeSlotRepository.find({ where: { eventId }, order: { startTime: 'ASC' } });
  }

  async submitVote(participantId: string, timeSlotId: string, availability: 'available' | 'preferred' | 'unavailable'): Promise<Participant> {
     // For a real app, you'd store votes per slot in a join table or a JSON array on the participant.
     // For MVP, updating participant status for demo
     const participant = await this.participantRepository.findOne({ where: { id: participantId } });
     if (!participant) throw new NotFoundException('Participant not found');
     
     participant.status = availability;
     return this.participantRepository.save(participant);
  }
}
