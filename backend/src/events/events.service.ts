import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../entities/event.entity';
import { Participant } from '../entities/participant.entity';
import { TimeSlot } from '../entities/time-slot.entity';
import { User } from '../entities/user.entity';
import { SchedulerService } from '../scheduler/scheduler.service';
import { ParticipantAvailability } from '@scheduler/shared';

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
    const event = this.eventRepository.create(eventData);
    const savedEvent = await this.eventRepository.save(event);

    if (participantsEmails && participantsEmails.length > 0) {
      const participants = participantsEmails.map(email => this.participantRepository.create({
        eventId: savedEvent.id,
        email: email,
        availability: 'unknown'
      }));
      await this.participantRepository.save(participants);
    }

    // Automatically generate initial slots based on current logic
    await this.generateTimeSlots(savedEvent.id);

    return savedEvent;
  }

  async getEvent(id: string): Promise<{ event: Event, participants: Participant[], timeSlots: TimeSlot[] }> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) throw new Error('Event not found');

    const participants = await this.participantRepository.find({ where: { eventId: id } });
    const timeSlots = await this.timeSlotRepository.find({ 
      where: { eventId: id },
      order: { score: 'DESC', startTime: 'ASC' }
    });

    return { event, participants, timeSlots };
  }

  async addParticipant(eventId: string, email: string): Promise<Participant> {
    const participant = this.participantRepository.create({
      eventId,
      email,
      availability: 'unknown'
    });
    return this.participantRepository.save(participant);
  }

  async generateTimeSlots(eventId: string): Promise<TimeSlot[]> {
    const event = await this.eventRepository.findOne({ where: { id: eventId } });
    if (!event) throw new Error('Event not found');

    const participants = await this.participantRepository.find({ where: { eventId } });
    if (participants.length === 0) return [];

    // Find users for participants (assuming we can match by email for now or they are linked)
    // In a real app, you'd ensure users are linked to participants
    const userIds = participants.map(p => p.userId).filter(Boolean) as string[];
    const users = userIds.length > 0 
      ? await this.userRepository.createQueryBuilder("user").where("user.id IN (:...userIds)", { userIds }).getMany()
      : [];

    const intersections = await this.schedulerService.findIntersections(
      users,
      event.dateRangeStart,
      event.dateRangeEnd,
      event.durationMinutes,
      event.bufferMinutes
    );

    // Save generated slots
    const timeSlots = intersections.map(slot => this.timeSlotRepository.create({
      eventId,
      startTime: slot.start,
      endTime: slot.end,
      score: slot.score
    }));

    // Clear old slots and save new ones
    await this.timeSlotRepository.delete({ eventId });
    return this.timeSlotRepository.save(timeSlots);
  }

  async getEventTimeSlots(eventId: string): Promise<TimeSlot[]> {
    return this.timeSlotRepository.find({ 
      where: { eventId },
      order: { score: 'DESC', startTime: 'ASC' }
    });
  }

  async submitVote(participantId: string, timeSlotId: string, availability: ParticipantAvailability): Promise<Participant> {
    const participant = await this.participantRepository.findOne({ where: { id: participantId } });
    if (!participant) throw new Error('Participant not found');

    participant.timeSlotId = timeSlotId;
    participant.availability = availability;
    return this.participantRepository.save(participant);
  }
}
