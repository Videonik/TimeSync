import axios from 'axios';
import type { Event, TimeSlot, Participant, ParticipantAvailability } from '@scheduler/shared';

const api = axios.create({
  baseURL: 'http://localhost:3000', // Update this based on env later
});

export const createEvent = async (eventData: Partial<Event>): Promise<Event> => {
  const { data } = await api.post('/events', eventData);
  return data;
};

export const getEvent = async (id: string): Promise<Event> => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

export const addParticipant = async (eventId: string, email: string): Promise<Participant> => {
  const { data } = await api.post(`/events/${eventId}/participants`, { email });
  return data;
};

export const getEventSlots = async (eventId: string): Promise<TimeSlot[]> => {
  const { data } = await api.get(`/events/${eventId}/slots`);
  return data;
};

export const submitVote = async (
  eventId: string,
  participantId: string,
  timeSlotId: string,
  availability: ParticipantAvailability
): Promise<Participant> => {
  const { data } = await api.post(`/events/${eventId}/vote`, {
    participantId,
    timeSlotId,
    availability,
  });
  return data;
};

export default api;
