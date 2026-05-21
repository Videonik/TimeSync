import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEventSlots, submitVote } from '../api';
import type { ParticipantAvailability } from '@scheduler/shared';

export const VotingGrid: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  // Hardcoded for demo purposes
  const mockParticipantId = 'mock-participant-id'; 

  const { data: slots, isLoading } = useQuery({
    queryKey: ['eventSlots', id],
    queryFn: () => getEventSlots(id!),
    enabled: !!id,
  });

  const voteMutation = useMutation({
    mutationFn: ({ slotId, vote }: { slotId: string; vote: ParticipantAvailability }) => 
      submitVote(id!, mockParticipantId, slotId, vote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventSlots', id] });
    },
  });

  const handleVote = (slotId: string, vote: ParticipantAvailability) => {
    voteMutation.mutate({ slotId, vote });
  };

  if (isLoading) return <div className="text-center py-10 text-gray-500">Loading timeslots...</div>;
  if (!slots || slots.length === 0) return (
    <div className="text-center py-10 text-gray-500 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      No timeslots found. Generate some first!
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Select Suitable Time</h2>
      
      <div className="flex flex-col gap-4">
        {slots.map(slot => (
          <div 
            key={slot.id} 
            className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mb-4 sm:mb-0">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 font-medium">
                  {new Date(slot.startTime).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                <span className="text-lg font-semibold text-gray-800">
                  {new Date(slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  slot.score === 100 ? 'bg-green-100 text-green-700' : 
                  (slot.score ?? 0) > 50 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                }`}>
                  {slot.score}% Match
                </span>
              </div>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <button 
                onClick={() => handleVote(slot.id, 'available')}
                className="flex-1 sm:flex-none p-2 rounded-md bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700 transition-colors border border-green-200 font-medium text-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                title="Available"
              >
                Available
              </button>
              <button 
                onClick={() => handleVote(slot.id, 'preferred')}
                className="flex-1 sm:flex-none p-2 rounded-md bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:text-yellow-700 transition-colors border border-yellow-200 font-medium text-sm focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                title="Preferred"
              >
                Preferred
              </button>
              <button 
                onClick={() => handleVote(slot.id, 'unavailable')}
                className="flex-1 sm:flex-none p-2 rounded-md bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors border border-red-200 font-medium text-sm focus:ring-2 focus:ring-red-400 focus:outline-none"
                title="Unavailable"
              >
                Busy
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
