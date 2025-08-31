// src/services/realtimeService.js
import { supabase } from './supabase';

class RealtimeService {
  constructor() {
    this.subscriptions = new Map();
  }

  // Subscribe to conversation updates
  subscribeToConversation(conversationId, callbacks) {
    const channelName = `conversation:${conversationId}`;
    
    // Unsubscribe from existing channel if exists
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (callbacks.onMessage) {
            callbacks.onMessage(payload);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `id=eq.${conversationId}`
        },
        (payload) => {
          if (callbacks.onConversationUpdate) {
            callbacks.onConversationUpdate(payload);
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        if (callbacks.onPresenceSync) {
          callbacks.onPresenceSync(state);
        }
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        if (callbacks.onUserJoin) {
          callbacks.onUserJoin({ key, newPresences });
        }
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        if (callbacks.onUserLeave) {
          callbacks.onUserLeave({ key, leftPresences });
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && callbacks.onSubscribed) {
          callbacks.onSubscribed();
          
          // Track user presence
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              user_id: user.id,
              user_email: user.email,
              online_at: new Date().toISOString()
            });
          }
        }
      });

    this.subscriptions.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  // Subscribe to document updates
  subscribeToDocuments(userId, callbacks) {
    const channelName = `documents:${userId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'documents',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              if (callbacks.onDocumentAdded) {
                callbacks.onDocumentAdded(payload.new);
              }
              break;
            case 'UPDATE':
              if (callbacks.onDocumentUpdated) {
                callbacks.onDocumentUpdated(payload.new);
              }
              break;
            case 'DELETE':
              if (callbacks.onDocumentDeleted) {
                callbacks.onDocumentDeleted(payload.old);
              }
              break;
          }
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  // Subscribe to meeting updates
  subscribeToMeeting(meetingId, callbacks) {
    const channelName = `meeting:${meetingId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'meetings',
          filter: `id=eq.${meetingId}`
        },
        (payload) => {
          if (callbacks.onMeetingUpdate) {
            callbacks.onMeetingUpdate(payload.new);
          }
        }
      )
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        if (callbacks.onCursorMove) {
          callbacks.onCursorMove(payload);
        }
      })
      .on('broadcast', { event: 'voice' }, ({ payload }) => {
        if (callbacks.onVoiceActivity) {
          callbacks.onVoiceActivity(payload);
        }
      })
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  // Broadcast cursor position (for collaborative features)
  broadcastCursor(meetingId, position) {
    const channel = this.subscriptions.get(`meeting:${meetingId}`);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: position
      });
    }
  }

  // Broadcast voice activity
  broadcastVoiceActivity(meetingId, activity) {
    const channel = this.subscriptions.get(`meeting:${meetingId}`);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'voice',
        payload: activity
      });
    }
  }

  // Subscribe to usage updates
  subscribeToUsage(userId, callback) {
    const channelName = `usage:${userId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'usage_logs',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    this.subscriptions.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  // Unsubscribe from a channel
  unsubscribe(channelName) {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      supabase.removeChannel(channel);
      this.subscriptions.delete(channelName);
    }
  }

  // Unsubscribe from all channels
  unsubscribeAll() {
    for (const [name, channel] of this.subscriptions) {
      supabase.removeChannel(channel);
    }
    this.subscriptions.clear();
  }
}

export const realtimeService = new RealtimeService();
export default realtimeService;