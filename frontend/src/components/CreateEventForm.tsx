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

  const [participantsInput, setParticipantsInput] = useState('');

  const mutation = useMutation({
    mutationFn: (payload: { eventData: any, emails: string[] }) => createEvent(payload.eventData, payload.emails),
    onSuccess: (data) => {
      navigate(`/event/${data.id}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emails = participantsInput.split(',').map(email => email.trim()).filter(email => email !== '');
    
    mutation.mutate({
      eventData: {
        title,
        durationMinutes: duration,
        dateRangeStart: new Date(startDate),
        dateRangeEnd: new Date(endDate),
        organizerId: 'mock-organizer-id', // Would come from auth context eventually
        status: 'published'
      },
      emails: emails
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Plan a New Meeting</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
          <input 
            type="text" 
            placeholder="e.g. Weekly Sync" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <select 
            value={duration} 
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
          >
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={45}>45 minutes</option>
            <option value={60}>1 hour</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Participants (comma separated emails)</label>
          <input 
            type="text" 
            placeholder="alice@example.com, bob@example.com" 
            value={participantsInput} 
            onChange={(e) => setParticipantsInput(e.target.value)} 
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
        </div>

        <button 
          type="submit"
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-sm"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? 'Creating...' : 'Create Meeting'}
        </button>
      </form>
    </div>
  );
};
