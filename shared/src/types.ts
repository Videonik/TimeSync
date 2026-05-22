export interface User {
  id: string;
  email: string;
  timezone: string;
  encryptedTokens?: string;
  workingHoursStart?: string;
  workingHoursEnd?: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  durationMinutes: number;
  bufferMinutes?: number;
  status: 'draft' | 'published' | 'completed';
  organizerId: string;
  dateRangeStart: Date;
  dateRangeEnd: Date;
}

export interface TimeSlot {
  id: string;
  eventId: string;
  startTime: Date;
  endTime: Date;
  score?: number; // Calculated rank based on participants
}

export type ParticipantAvailability = 'available' | 'preferred' | 'unavailable' | 'unknown';

export interface Participant {
  id: string;
  eventId: string;
  userId?: string;
  email: string;
  availability: ParticipantAvailability;
  comment?: string;
  timeSlotId?: string;
}
