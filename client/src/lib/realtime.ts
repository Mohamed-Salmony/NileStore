import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Realtime subscription for support tickets
export const subscribeToTickets = (
  onInsert?: (payload: any) => void,
  onUpdate?: (payload: any) => void,
  onDelete?: (payload: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel('support_tickets_changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'support_tickets'
      },
      (payload) => {
        console.log('New ticket created:', payload);
        onInsert?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'support_tickets'
      },
      (payload) => {
        console.log('Ticket updated:', payload);
        onUpdate?.(payload);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'support_tickets'
      },
      (payload) => {
        console.log('Ticket deleted:', payload);
        onDelete?.(payload);
      }
    )
    .subscribe();

  return channel;
};

// Realtime subscription for ticket messages
export const subscribeToTicketMessages = (
  ticketId: string,
  onNewMessage?: (payload: any) => void
): RealtimeChannel => {
  const channel = supabase
    .channel(`ticket_messages_${ticketId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'ticket_messages',
        filter: `ticket_id=eq.${ticketId}`
      },
      (payload) => {
        console.log('New message received:', payload);
        onNewMessage?.(payload);
      }
    )
    .subscribe();

  return channel;
};

// Unsubscribe from a channel
export const unsubscribeFromChannel = (channel: RealtimeChannel) => {
  supabase.removeChannel(channel);
};
