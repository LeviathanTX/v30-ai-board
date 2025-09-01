// src/contexts/AppStateContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppStateContext = createContext();

// Default advisors
const defaultAdvisors = [
  {
    id: '0',
    name: 'Alex Morgan',
    role: 'Board Meeting Host',
    expertise: ['Meeting Facilitation', 'Executive Communication', 'Strategic Synthesis', 'Decision Frameworks'],
    personality: {
      traits: ['diplomatic', 'organized', 'insightful', 'articulate'],
      communication_style: 'facilitator'
    },
    avatar_emoji: '🎯',
    voice_profile: {
      style: 'professional',
      gender: 'neutral'
    },
    is_custom: false,
    is_host: true
  },
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Chief Strategy Officer',
    expertise: ['Strategic Planning', 'Market Analysis', 'Growth Strategy'],
    personality: {
      traits: ['analytical', 'visionary', 'direct'],
      communication_style: 'professional'
    },
    avatar_emoji: '👩‍💼',
    voice_profile: {
      style: 'professional',
      gender: 'female'
    },
    is_custom: false
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'CFO',
    expertise: ['Financial Planning', 'Risk Management', 'Investment Strategy'],
    personality: {
      traits: ['detail-oriented', 'conservative', 'thorough'],
      communication_style: 'formal'
    },
    avatar_emoji: '👨‍💼',
    voice_profile: {
      style: 'authoritative',
      gender: 'male'
    },
    is_custom: false
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'CMO',
    expertise: ['Brand Strategy', 'Digital Marketing', 'Customer Experience'],
    personality: {
      traits: ['creative', 'enthusiastic', 'innovative'],
      communication_style: 'energetic'
    },
    avatar_emoji: '👩‍🎨',
    voice_profile: {
      style: 'friendly',
      gender: 'female'
    },
    is_custom: false
  }
];

// Initial state
const initialState = {
  // Documents
  documents: [],
  selectedDocument: null,
  documentsLoading: false,
  
  // Advisors - Pre-populate with default advisors
  advisors: defaultAdvisors,
  selectedAdvisors: defaultAdvisors, // Auto-select all advisors
  customAdvisors: [],
  advisorsLoading: false,
  
  // Conversations
  conversations: [],
  activeConversation: null,
  conversationMessages: [],
  conversationsLoading: false,
  
  // AI Meeting State
  isMeetingActive: false,
  meetingTranscript: [],
  meetingDocuments: [],
  
  // User
  user: null,
  subscription: null,
  
  // UI State
  notifications: [],
  lastVoiceCommand: null,
  searchQuery: '',
  
  // Settings
  settings: {
    theme: 'light',
    voiceEnabled: true,
    autoSave: true,
    notificationsEnabled: true
  }
};

// Action types
export const actionTypes = {
  // Documents
  SET_DOCUMENTS: 'SET_DOCUMENTS',
  ADD_DOCUMENT: 'ADD_DOCUMENT',
  UPDATE_DOCUMENT: 'UPDATE_DOCUMENT',
  DELETE_DOCUMENT: 'DELETE_DOCUMENT',
  SELECT_DOCUMENT: 'SELECT_DOCUMENT',
  SET_DOCUMENTS_LOADING: 'SET_DOCUMENTS_LOADING',
  
  // Advisors
  SET_ADVISORS: 'SET_ADVISORS',
  ADD_ADVISOR: 'ADD_ADVISOR',
  UPDATE_ADVISOR: 'UPDATE_ADVISOR',
  DELETE_ADVISOR: 'DELETE_ADVISOR',
  SELECT_ADVISORS: 'SELECT_ADVISORS',
  ADD_SELECTED_ADVISOR: 'ADD_SELECTED_ADVISOR',
  REMOVE_SELECTED_ADVISOR: 'REMOVE_SELECTED_ADVISOR',
  SET_ADVISORS_LOADING: 'SET_ADVISORS_LOADING',
  
  // Conversations
  SET_CONVERSATIONS: 'SET_CONVERSATIONS',
  ADD_CONVERSATION: 'ADD_CONVERSATION',
  UPDATE_CONVERSATION: 'UPDATE_CONVERSATION',
  DELETE_CONVERSATION: 'DELETE_CONVERSATION',
  SET_ACTIVE_CONVERSATION: 'SET_ACTIVE_CONVERSATION',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_CONVERSATIONS_LOADING: 'SET_CONVERSATIONS_LOADING',
  
  // Meeting
  START_MEETING: 'START_MEETING',
  END_MEETING: 'END_MEETING',
  ADD_MEETING_MESSAGE: 'ADD_MEETING_MESSAGE',
  SET_MEETING_DOCUMENTS: 'SET_MEETING_DOCUMENTS',
  
  // User
  SET_USER: 'SET_USER',
  SET_SUBSCRIPTION: 'SET_SUBSCRIPTION',
  
  // UI
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION',
  SET_VOICE_COMMAND: 'SET_VOICE_COMMAND',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  
  // Settings
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  
  // Bulk operations
  RESET_STATE: 'RESET_STATE',
  LOAD_USER_DATA: 'LOAD_USER_DATA'
};

// Reducer
function appStateReducer(state, action) {
  switch (action.type) {
    // Documents
    case actionTypes.SET_DOCUMENTS:
      return { ...state, documents: action.payload, documentsLoading: false };
    
    case actionTypes.ADD_DOCUMENT:
      return { ...state, documents: [...state.documents, action.payload] };
    
    case actionTypes.UPDATE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.map(doc =>
          doc.id === action.payload.id ? { ...doc, ...action.payload } : doc
        )
      };
    
    case actionTypes.DELETE_DOCUMENT:
      return {
        ...state,
        documents: state.documents.filter(doc => doc.id !== action.payload),
        selectedDocument: state.selectedDocument?.id === action.payload ? null : state.selectedDocument
      };
    
    case actionTypes.SELECT_DOCUMENT:
      return { ...state, selectedDocument: action.payload };
    
    case actionTypes.SET_DOCUMENTS_LOADING:
      return { ...state, documentsLoading: action.payload };
    
    // Advisors
    case actionTypes.SET_ADVISORS:
      return { ...state, advisors: action.payload, advisorsLoading: false };
    
    case actionTypes.ADD_ADVISOR:
      return { ...state, customAdvisors: [...state.customAdvisors, action.payload] };
    
    case actionTypes.UPDATE_ADVISOR:
      return {
        ...state,
        customAdvisors: state.customAdvisors.map(advisor =>
          advisor.id === action.payload.id ? { ...advisor, ...action.payload } : advisor
        )
      };
    
    case actionTypes.DELETE_ADVISOR:
      return {
        ...state,
        customAdvisors: state.customAdvisors.filter(advisor => advisor.id !== action.payload),
        selectedAdvisors: state.selectedAdvisors.filter(advisor => advisor.id !== action.payload)
      };
    
    case actionTypes.SELECT_ADVISORS:
      return { ...state, selectedAdvisors: action.payload };
    
    case actionTypes.ADD_SELECTED_ADVISOR:
      return { 
        ...state, 
        selectedAdvisors: [...state.selectedAdvisors, action.payload]
      };
    
    case actionTypes.REMOVE_SELECTED_ADVISOR:
      return { 
        ...state, 
        selectedAdvisors: state.selectedAdvisors.filter(advisor => advisor.id !== action.payload)
      };
    
    case actionTypes.SET_ADVISORS_LOADING:
      return { ...state, advisorsLoading: action.payload };
    
    // Conversations
    case actionTypes.SET_CONVERSATIONS:
      return { ...state, conversations: action.payload, conversationsLoading: false };
    
    case actionTypes.ADD_CONVERSATION:
      return { ...state, conversations: [action.payload, ...state.conversations] };
    
    case actionTypes.UPDATE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.map(conv =>
          conv.id === action.payload.id ? { ...conv, ...action.payload } : conv
        ),
        activeConversation: state.activeConversation?.id === action.payload.id 
          ? { ...state.activeConversation, ...action.payload }
          : state.activeConversation
      };
    
    case actionTypes.DELETE_CONVERSATION:
      return {
        ...state,
        conversations: state.conversations.filter(conv => conv.id !== action.payload),
        activeConversation: state.activeConversation?.id === action.payload ? null : state.activeConversation
      };
    
    case actionTypes.SET_ACTIVE_CONVERSATION:
      return { 
        ...state, 
        activeConversation: action.payload,
        conversationMessages: action.payload?.messages || []
      };
    
    case actionTypes.ADD_MESSAGE:
      return {
        ...state,
        conversationMessages: [...state.conversationMessages, action.payload]
      };
    
    case actionTypes.SET_CONVERSATIONS_LOADING:
      return { ...state, conversationsLoading: action.payload };
    
    // Meeting
    case actionTypes.START_MEETING:
      return { 
        ...state, 
        isMeetingActive: true,
        meetingTranscript: [],
        meetingDocuments: action.payload?.documents || []
      };
    
    case actionTypes.END_MEETING:
      return { 
        ...state, 
        isMeetingActive: false,
        meetingTranscript: [],
        meetingDocuments: []
      };
    
    case actionTypes.ADD_MEETING_MESSAGE:
      return { 
        ...state, 
        meetingTranscript: [...state.meetingTranscript, action.payload]
      };
    
    case actionTypes.SET_MEETING_DOCUMENTS:
      return { ...state, meetingDocuments: action.payload };
    
    // User
    case actionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    case actionTypes.SET_SUBSCRIPTION:
      return { ...state, subscription: action.payload };
    
    // UI
    case actionTypes.ADD_NOTIFICATION:
      return { 
        ...state, 
        notifications: [...state.notifications, {
          id: Date.now(),
          ...action.payload
        }]
      };
    
    case actionTypes.REMOVE_NOTIFICATION:
      return { 
        ...state, 
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };
    
    case actionTypes.SET_VOICE_COMMAND:
      return { ...state, lastVoiceCommand: action.payload };
    
    case actionTypes.SET_SEARCH_QUERY:
      return { ...state, searchQuery: action.payload };
    
    // Settings
    case actionTypes.UPDATE_SETTINGS:
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload }
      };
    
    // Bulk operations
    case actionTypes.RESET_STATE:
      return initialState;
    
    case actionTypes.LOAD_USER_DATA:
      return { 
        ...state, 
        ...action.payload,
        documentsLoading: false,
        advisorsLoading: false,
        conversationsLoading: false
      };
    
    default:
      return state;
  }
}

// Provider component
export function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const savedDocuments = localStorage.getItem('documents');
        if (savedDocuments) {
          dispatch({ type: actionTypes.SET_DOCUMENTS, payload: JSON.parse(savedDocuments) });
        }

        const savedConversations = localStorage.getItem('conversations');
        if (savedConversations) {
          dispatch({ type: actionTypes.SET_CONVERSATIONS, payload: JSON.parse(savedConversations) });
        }

        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
          dispatch({ type: actionTypes.UPDATE_SETTINGS, payload: JSON.parse(savedSettings) });
        }
      } catch (error) {
        logger.error('Error loading local data:', error);
      }
    };

    loadLocalData();
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('documents', JSON.stringify(state.documents));
  }, [state.documents]);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(state.conversations));
  }, [state.conversations]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(state.settings));
  }, [state.settings]);

  const value = {
    state,
    dispatch,
    actions: actionTypes
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

// Hook to use app state
export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return context;
}

export default AppStateContext;