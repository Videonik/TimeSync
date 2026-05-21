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

  if (isLoading) return <p>Loading timeslots...</p>;
  if (!slots || slots.length === 0) return <p>No timeslots found. Generate some first!</p>;

  return (
    <div>
      <h2>Select suitable time</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {slots.map(slot => (
          <div key={slot.id} style={{ border: '1px solid #ccc', padding: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <span>{new Date(slot.startTime).toLocaleTimeString()} - {new Date(slot.endTime).toLocaleTimeString()}</span>
            <span style={{ color: slot.score === 100 ? 'green' : 'orange' }}>Match: {slot.score}%</span>
            <div>
              <button onClick={() => handleVote(slot.id, 'available')}>✓</button>
              <button onClick={() => handleVote(slot.id, 'preferred')}>★</button>
              <button onClick={() => handleVote(slot.id, 'unavailable')}>✗</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
