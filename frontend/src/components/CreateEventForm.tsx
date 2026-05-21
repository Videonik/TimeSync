import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api';

export const CreateEventForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const mutation = useMutation({
    mutationFn: createEvent,
    onSuccess: (data) => {
      // Mock organizer for now
      navigate(`/event/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      title,
      durationMinutes: duration,
      dateRangeStart: new Date(startDate),
      dateRangeEnd: new Date(endDate),
      organizerId: 'mock-organizer-id', // Would come from auth context
      status: 'published'
    });
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
      <h2>Create Event</h2>
      <input 
        type="text" 
        placeholder="Event Title" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        required
      />
      <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
        <option value={15}>15 minutes</option>
        <option value={30}>30 minutes</option>
        <option value={60}>1 hour</option>
      </select>
      <input 
        type="date" 
        value={startDate} 
        onChange={(e) => setStartDate(e.target.value)} 
        required
      />
      <input 
        type="date" 
        value={endDate} 
        onChange={(e) => setEndDate(e.target.value)} 
        required
      />
      <button type="submit">Create Meeting</button>
    </form>
  );
};
