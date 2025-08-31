// src/hooks/useRealtime.js
import { useEffect, useRef, useCallback } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { useSupabase } from '../contexts/SupabaseContext';
import realtimeService from '../services/realtimeService';

export function useRealtimeConversation(conversationId) {
  const { dispatch } = useAppState();
  const { user } = useSupabase();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const unsubscribe = realtimeService.subscribeToConversation(conversationId, {
      onMessage: (payload) => {
        if (payload.eventType === 'INSERT') {
          // Add new message to state
          dispatch({
            type: 'ADD_MESSAGE',
            payload: payload.new
          });
        }
      },
      onConversationUpdate: (payload) => {
        // Update conversation metadata
        dispatch({
          type: 'UPDATE_CONVERSATION',
          payload: payload.new
        });
      },
      onPresenceSync: (presenceState) => {
        // Show who's viewing the conversation
        const users = Object.values(presenceState).flat();
        console.log('Users in conversation:', users);
      },
      onUserJoin: ({ newPresences }) => {
        // Show notification when someone joins
        const user = newPresences[0];
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            message: `${user.user_email} joined the conversation`,
            type: 'info'
          }
        });
      },
      onUserLeave: ({ leftPresences }) => {
        // Show notification when someone leaves
        const user = leftPresences[0];
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            message: `${user.user_email} left the conversation`,
            type: 'info'
          }
        });
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [conversationId, user?.id, dispatch]);
}

export function useRealtimeDocuments() {
  const { dispatch } = useAppState();
  const { user } = useSupabase();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = realtimeService.subscribeToDocuments(user.id, {
      onDocumentAdded: (document) => {
        dispatch({
          type: 'ADD_DOCUMENT',
          payload: document
        });
      },
      onDocumentUpdated: (document) => {
        dispatch({
          type: 'UPDATE_DOCUMENT',
          payload: document
        });
      },
      onDocumentDeleted: (document) => {
        dispatch({
          type: 'DELETE_DOCUMENT',
          payload: document.id
        });
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.id, dispatch]);
}

export function useRealtimeMeeting(meetingId) {
  const { dispatch } = useAppState();
  const { user } = useSupabase();
  const unsubscribeRef = useRef(null);

  const broadcastCursor = useCallback((position) => {
    if (meetingId) {
      realtimeService.broadcastCursor(meetingId, {
        userId: user?.id,
        userEmail: user?.email,
        ...position
      });
    }
  }, [meetingId, user]);

  const broadcastVoice = useCallback((activity) => {
    if (meetingId) {
      realtimeService.broadcastVoiceActivity(meetingId, {
        userId: user?.id,
        userEmail: user?.email,
        ...activity
      });
    }
  }, [meetingId, user]);

  useEffect(() => {
    if (!meetingId || !user?.id) return;

    const unsubscribe = realtimeService.subscribeToMeeting(meetingId, {
      onMeetingUpdate: (meeting) => {
        dispatch({
          type: 'UPDATE_MEETING',
          payload: meeting
        });
      },
      onCursorMove: (cursor) => {
        // Handle cursor movements from other users
        if (cursor.userId !== user.id) {
          dispatch({
            type: 'UPDATE_CURSOR_POSITION',
            payload: cursor
          });
        }
      },
      onVoiceActivity: (voice) => {
        // Handle voice activity from other users
        if (voice.userId !== user.id) {
          dispatch({
            type: 'UPDATE_VOICE_ACTIVITY',
            payload: voice
          });
        }
      }
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [meetingId, user?.id, dispatch]);

  return {
    broadcastCursor,
    broadcastVoice
  };
}

export function useRealtimeUsage() {
  const { dispatch } = useAppState();
  const { user } = useSupabase();
  const unsubscribeRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = realtimeService.subscribeToUsage(user.id, (usage) => {
      dispatch({
        type: 'UPDATE_USAGE',
        payload: usage
      });
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [user?.id, dispatch]);
}