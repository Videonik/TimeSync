import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api';
import { jwtDecode } from 'jwt-decode';

export const CreateEventForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [participantsInput, setParticipantsInput] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserId(decoded.sub);
      } catch (e) {
        console.error('Failed to parse token', e);
      }
    }
  }, []);

  const mutation = useMutation({
    mutationFn: (payload: { eventData: any, emails: string[] }) => createEvent(payload.eventData, payload.emails),
    onSuccess: (data) => {
      navigate(`/event/${data.id}`);
    },
    onError: (error: any) => {
      alert('Ошибка при создании встречи: ' + (error.response?.data?.message || error.message));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      alert('Пожалуйста, войдите через Яндекс!');
      return;
    }

    const emails = participantsInput.split(',').map(email => email.trim()).filter(email => email !== '');
    
    mutation.mutate({
      eventData: {
        title,
        durationMinutes: duration,
        bufferMinutes: buffer,
        dateRangeStart: new Date(startDate),
        dateRangeEnd: new Date(endDate),
        organizerId: userId,
        status: 'published'
      },
      emails: emails
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 max-w-md w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Запланировать встречу</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Название встречи</label>
          <input 
            type="text" 
            placeholder="например, Еженедельный синк"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Длительность</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
            >
              <option value={15}>15 минут</option>
              <option value={30}>30 минут</option>
              <option value={45}>45 минут</option>
              <option value={60}>1 час</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Буферное время</label>
            <select
              value={buffer}
              onChange={(e) => setBuffer(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white"
            >
              <option value={0}>Без буфера</option>
              <option value={5}>5 минут</option>
              <option value={10}>10 минут</option>
              <option value={15}>15 минут</option>
              <option value={30}>30 минут</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Участники (email через запятую)</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
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
          {mutation.isPending ? 'Создание...' : 'Создать встречу'}
        </button>
      </form>
    </div>
  );
};
