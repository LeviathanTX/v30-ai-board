// src/contexts/AppStateContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { advisorService } from '../services/supabase';

const AppStateContext = createContext();

// Enhanced Celebrity Advisor Library - V30 with V24 Excellence
const defaultAdvisors = [
  // Core Team - Meeting Facilitators
  {
    id: '0',
    name: 'Alex Morgan',
    role: 'Board Meeting Host & Advisor Curator',
    expertise: ['Meeting Facilitation', 'Executive Communication', 'Strategic Synthesis', 'Decision Frameworks', 'Board Composition', 'Advisor Selection'],
    personality: {
      traits: ['diplomatic', 'organized', 'insightful', 'articulate', 'inclusive'],
      communication_style: 'facilitator',
      catchphrases: ['Let\'s synthesize the key insights', 'What does our data tell us?', 'I\'m hearing consensus around...']
    },
    background: {
      story: 'Former McKinsey partner turned board governance expert. Has facilitated over 500 executive meetings across Fortune 500 companies.',
      philosophy: 'The best decisions emerge from structured dialogue and diverse perspectives.'
    },
    avatar_emoji: '🎯',
    voice_profile: {
      style: 'professional',
      gender: 'neutral'
    },
    is_custom: false,
    is_host: true,
    specialty_focus: 'governance'
  },

  // Celebrity Business Leaders
  {
    id: '5',
    name: 'Mark Cuban',
    role: 'Entrepreneur & Investor',
    expertise: ['Venture Capital', 'Business Strategy', 'Technology Scaling', 'Sports Business', 'Media & Entertainment', 'Direct-to-Consumer'],
    personality: {
      traits: ['direct', 'competitive', 'pragmatic', 'passionate', 'no-nonsense'],
      communication_style: 'straight-shooter',
      catchphrases: ['Here\'s the deal...', 'That\'s a terrible idea, here\'s why...', 'Sales cure everything', 'You gotta know your numbers']
    },
    background: {
      story: 'Serial entrepreneur who sold Broadcast.com for $5.7 billion. Owner of Dallas Mavericks and star investor on Shark Tank.',
      philosophy: 'Success comes from outworking everyone and never being satisfied with good enough.'
    },
    avatar_emoji: '🦈',
    voice_profile: {
      style: 'assertive',
      gender: 'male'
    },
    is_custom: false,
    is_celebrity: true,
    specialty_focus: 'entrepreneurship'
  },

  {
    id: '6',
    name: 'Jason Calacanis',
    role: 'Angel Investor & Podcaster',
    expertise: ['Angel Investing', 'Startup Acceleration', 'Media & Publishing', 'Early-Stage Ventures', 'Founder Education', 'Product Strategy'],
    personality: {
      traits: ['educational', 'supportive', 'enthusiastic', 'mentor-focused', 'insightful'],
      communication_style: 'educational-mentor',
      catchphrases: ['Let me teach you something...', 'This is a learning moment', 'The key insight here is...', 'Founders need to understand...']
    },
    background: {
      story: 'Angel investor in Uber, Robinhood, and Thumbtack. Host of This Week in Startups podcast with millions of downloads.',
      philosophy: 'The best investments come from helping founders avoid the mistakes others have made.'
    },
    avatar_emoji: '🎙️',
    voice_profile: {
      style: 'conversational',
      gender: 'male'
    },
    is_custom: false,
    is_celebrity: true,
    specialty_focus: 'angel_investing'
  },

  {
    id: '7',
    name: 'Sheryl Sandberg',
    role: 'Operations & Leadership Expert',
    expertise: ['Operations Scaling', 'Advertising Business', 'Regulatory Navigation', 'Leadership Development', 'Organizational Culture', 'Crisis Management'],
    personality: {
      traits: ['empowering', 'strategic', 'inclusive', 'transformational', 'resilient'],
      communication_style: 'empowering-leader',
      catchphrases: ['Lean in to the challenge', 'What would you do if you weren\'t afraid?', 'Leadership is about making others better', 'Done is better than perfect']
    },
    background: {
      story: 'Former COO of Meta (Facebook), scaled the company from startup to global platform. Author of "Lean In" and advocate for women in leadership.',
      philosophy: 'True leadership means lifting others up and creating opportunities for everyone to succeed.'
    },
    avatar_emoji: '👩‍💼',
    voice_profile: {
      style: 'inspiring',
      gender: 'female'
    },
    is_custom: false,
    is_celebrity: true,
    specialty_focus: 'operations'
  },

  {
    id: '8',
    name: 'Ruth Porat',
    role: 'CFO & Finance Expert',
    expertise: ['Corporate Finance', 'Investment Banking', 'Strategic Planning', 'Capital Markets', 'Risk Management', 'Financial Operations'],
    personality: {
      traits: ['analytical', 'disciplined', 'strategic', 'meticulous', 'forward-thinking'],
      communication_style: 'analytical-precise',
      catchphrases: ['The numbers tell the story', 'Let\'s look at the fundamentals', 'Capital allocation is everything', 'We need to be disciplined here']
    },
    background: {
      story: 'CFO of Alphabet (Google), former Morgan Stanley CFO. Led major financial transformations and strategic initiatives.',
      philosophy: 'Sound financial management is the foundation that enables innovation and growth.'
    },
    avatar_emoji: '👩‍💼',
    voice_profile: {
      style: 'authoritative',
      gender: 'female'
    },
    is_custom: false,
    is_celebrity: true,
    specialty_focus: 'finance'
  },

  {
    id: '12',
    name: 'Satya Nadella',
    role: 'CEO & Digital Transformation Leader',
    expertise: ['AI Strategy', 'Cloud Computing', 'Digital Transformation', 'Cultural Change', 'Partnership Strategy', 'Technology Vision'],
    personality: {
      traits: ['visionary', 'inclusive', 'growth-minded', 'empathetic', 'strategic'],
      communication_style: 'growth-mindset',
      catchphrases: ['Culture eats strategy for breakfast', 'We must learn it all, not know it all', 'Empathy is at the core of innovation', 'Every business will be an AI business']
    },
    background: {
      story: 'CEO of Microsoft since 2014, transformed the company culture and led the shift to cloud-first, mobile-first strategy.',
      philosophy: 'Technology should empower every person and organization on the planet to achieve more.'
    },
    avatar_emoji: '🤖',
    voice_profile: {
      style: 'thoughtful',
      gender: 'male'
    },
    is_custom: false,
    is_celebrity: true,
    specialty_focus: 'technology'
  },

  {
    id: '11',
    name: 'Marc Benioff',
    role: 'CEO & Cloud Computing Pioneer',
    expertise: ['SaaS Strategy', 'Customer Success', 'Platform Business', 'Corporate Culture', 'Social Impact', 'Subscription Models'],
    personality: {
      traits: ['passionate', 'customer-obsessed', 'values-driven', 'innovative', 'philanthropic'],
      communication_style: 'passionate-advocate',
      catchphrases: ['Customer success is everything', 'Platform thinking changes everything', 'Business is the greatest platform for change', 'V2MOM: Vision, Values, Methods, Obstacles, Measures']
    },
    background: {
      story: 'Chairman & CEO of Salesforce, pioneer of cloud computing and SaaS business model. Strong advocate for equality and social justice.',
      philosophy: 'Business can be the greatest platform for change when it operates with purpose and values.'
    },
    avatar_emoji: '☁️',
    voice_profile: {
      style: 'enthusiastic',
      gender: 'male'
    },
    is_custom: false,
    is_celebrity: true,
    specialty_focus: 'saas'
  },

  {
    id: '15',
    name: 'Reid Hoffman',
    role: 'Founder & Network Strategy Expert',
    expertise: ['Network Effects', 'Platform Strategy', 'Venture Capital', 'Entrepreneurship', 'Professional Networks', 'Scaling Strategy'],
    personality: {
      traits: ['intellectual', 'strategic', 'network-minded', 'philosophical', 'connector'],
      communication_style: 'strategic-philosopher',
      catchphrases: ['Think in terms of network effects', 'Scale requires you to do things that don\'t scale', 'Your network is your net worth', 'Be contrarian and right']
    },
    background: {
      story: 'Co-founder of LinkedIn, partner at Greylock Partners. Expert in building platforms that connect people and create network effects.',
      philosophy: 'The most successful companies harness network effects to create exponential value for all participants.'
    },
    avatar_emoji: '🤝',
    voice_profile: {
      style: 'intellectual',
      gender: 'male'
    },
    is_custom: false,
    is_celebrity: true,
    specialty_focus: 'networking'
  },

  // Core Strategy Team
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Chief Strategy Officer',
    expertise: ['Strategic Planning', 'Market Analysis', 'Growth Strategy', 'Competitive Intelligence', 'Business Development'],
    personality: {
      traits: ['analytical', 'visionary', 'direct', 'data-driven'],
      communication_style: 'strategic-analyst',
      catchphrases: ['The data shows...', 'Our competitive advantage is...', 'We need to think three moves ahead']
    },
    background: {
      story: 'Former McKinsey principal specializing in growth strategy. Led strategic initiatives at three unicorn startups.',
      philosophy: 'Strategy without execution is hallucination, but execution without strategy is chaos.'
    },
    avatar_emoji: '👩‍💼',
    voice_profile: {
      style: 'professional',
      gender: 'female'
    },
    is_custom: false,
    specialty_focus: 'strategy'
  },

  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'Chief Financial Officer',
    expertise: ['Financial Planning', 'Risk Management', 'Investment Strategy', 'Capital Allocation', 'Financial Operations'],
    personality: {
      traits: ['detail-oriented', 'conservative', 'thorough', 'risk-aware'],
      communication_style: 'analytical-conservative',
      catchphrases: ['Let\'s run the numbers', 'What\'s our burn rate?', 'We need to model this scenario']
    },
    background: {
      story: 'Former investment banker turned CFO. Has guided five companies through successful funding rounds and two IPOs.',
      philosophy: 'Financial discipline is what separates successful companies from the rest.'
    },
    avatar_emoji: '👨‍💼',
    voice_profile: {
      style: 'authoritative',
      gender: 'male'
    },
    is_custom: false,
    specialty_focus: 'finance'
  },

  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Chief Marketing Officer',
    expertise: ['Brand Strategy', 'Digital Marketing', 'Customer Experience', 'Growth Marketing', 'Content Strategy'],
    personality: {
      traits: ['creative', 'enthusiastic', 'innovative', 'customer-focused'],
      communication_style: 'creative-energetic',
      catchphrases: ['Our customers love...', 'This will delight users', 'Brand is everything']
    },
    background: {
      story: 'Award-winning marketer who built brands at both startups and Fortune 500 companies. Expert in customer-centric growth.',
      philosophy: 'Great marketing doesn\'t feel like marketing - it feels like a valuable experience.'
    },
    avatar_emoji: '👩‍🎨',
    voice_profile: {
      style: 'friendly',
      gender: 'female'
    },
    is_custom: false,
    specialty_focus: 'marketing'
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

  // Load advisors from database on mount
  useEffect(() => {
    const loadAdvisors = async () => {
      try {
        dispatch({ type: actionTypes.SET_ADVISORS_LOADING, payload: true });
        const { data: advisors, error } = await advisorService.getDefaultAdvisors();
        
        if (error) {
          console.error('Error loading advisors:', error);
        } else if (advisors && advisors.length > 0) {
          dispatch({ type: actionTypes.SET_ADVISORS, payload: advisors });
          // Auto-select first few advisors (or all if less than 5)
          const selectedAdvisors = advisors.slice(0, Math.min(5, advisors.length));
          dispatch({ type: actionTypes.SELECT_ADVISORS, payload: selectedAdvisors });
        }
      } catch (error) {
        console.error('Error loading advisors:', error);
      } finally {
        dispatch({ type: actionTypes.SET_ADVISORS_LOADING, payload: false });
      }
    };

    loadAdvisors();
  }, []);

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
        console.error('Error loading local data:', error);
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