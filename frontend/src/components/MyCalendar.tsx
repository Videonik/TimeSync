import React, { useState, useEffect } from 'react';
import api from '../api';

interface BusySlot {
  id: string;
  startTime: string;
  endTime: string;
  title?: string;
}

export const MyCalendar: React.FC = () => {
  const [slots, setSlots] = useState<BusySlot[]>([]);
  const [date, setDate] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // For demo/MVP, assuming a fixed user ID if auth is not fully implemented
  // You would normally get this from your auth context

  // Try to get userId from localStorage or fallback to a generated local id to avoid
  // foreign key errors if 'mock-user-id' does not exist in the DB
  const [userId, setUserId] = useState<string | null>(localStorage.getItem('userId'));

  useEffect(() => {
    // If we don't have a userId, we fetch the current profile to get it.
    const fetchUserIdAndSlots = async () => {
      try {
        let currentUserId = userId;
        if (!currentUserId) {
           const profileRes = await api.get('/auth/me');
           currentUserId = profileRes.data.userId;
           setUserId(currentUserId);
           localStorage.setItem('userId', currentUserId as string);
        }

        if (currentUserId) {
          const res = await api.get(`/users/${currentUserId}/busy-slots`);
          setSlots(res.data);
        }
      } catch (error) {
         console.error('Failed to fetch profile or slots', error);
      }
    };
    fetchUserIdAndSlots();
  }, [userId]);

  const fetchSlots = async () => {
    if (!userId) return;
    try {
      const res = await api.get(`/users/${userId}/busy-slots`);
      setSlots(res.data);
    } catch (error) {
      console.error('Failed to fetch busy slots', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !start || !end) return;

    setLoading(true);
    try {
      const startTime = new Date(`${date}T${start}`).toISOString();
      const endTime = new Date(`${date}T${end}`).toISOString();

      await api.post(`/users/${userId}/busy-slots`, { startTime, endTime, title });

      setDate('');
      setStart('');
      setEnd('');
      setTitle('');
      fetchSlots();
    } catch (error) {
      console.error('Failed to create busy slot', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/busy-slots/${id}`);
      fetchSlots();
    } catch (error) {
      console.error('Failed to delete busy slot', error);
    }
  };

  return (
    <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Мой календарь занятости</h2>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Дата</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Название (опционально)</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Встреча, обед..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Начало</label>
            <input type="time" value={start} onChange={e => setStart(e.target.value)} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Конец</label>
            <input type="time" value={end} onChange={e => setEnd(e.target.value)} required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
          Добавить время занятости
        </button>
      </form>

      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Мои записи</h3>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm">У вас пока нет записей о занятости.</p>
        ) : (
          <ul className="space-y-3">
            {slots.map(slot => {
              const startDt = new Date(slot.startTime);
              const endDt = new Date(slot.endTime);
              return (
                <li key={slot.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">{slot.title || 'Занято'}</div>
                    <div className="text-sm text-gray-500">
                      {startDt.toLocaleDateString('ru-RU')} с {startDt.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})} по {endDt.toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(slot.id)} className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                    Удалить
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
