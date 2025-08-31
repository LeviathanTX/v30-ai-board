# V21 Current Architecture

## System Overview

The V21 AI Board of Advisors is built using a modular Core Shell architecture that enables independent module development while maintaining system cohesion. This document describes the actual implemented architecture as of January 2024.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend (React)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌──────────────────────────────────────┐  │
│  │  App Shell  │  │          Context Providers           │  │
│  │             │  │  ┌────────┐ ┌────────┐ ┌──────────┐ │  │
│  │ ┌─────────┐ │  │  │AppState│ │Supabase│ │  Voice   │ │  │
│  │ │ Sidebar │ │  │  └────────┘ └────────┘ └──────────┘ │  │
│  │ └─────────┘ │  └──────────────────────────────────────┘  │
│  │             │                                              │
│  │ ┌─────────┐ │  ┌──────────────────────────────────────┐  │
│  │ │ Header  │ │  │            Modules (CS21-v1)         │  │
│  │ └─────────┘ │  │  ┌────────┐ ┌────────┐ ┌──────────┐ │  │
│  │             │  │  │ AI Hub │ │Dashboard│ │Subscription│ │
│  │ ┌─────────┐ │  │  └────────┘ └────────┘ └──────────┘ │  │
│  │ │ Router  │ │  │  ┌────────┐ ┌────────┐ ┌──────────┐ │  │
│  │ └─────────┘ │  │  │Doc Hub*│ │Advisory*│ │Meeting*  │ │  │
│  └─────────────┘  │  └────────┘ └────────┘ └──────────┘ │  │
│                   │         (*placeholder only)           │  │
│                   └──────────────────────────────────────┘  │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    Services Layer                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │ │
│  │  │ AI Service│ │ Supabase │ │ Document │ │ Deepgram*│  │ │
│  │  │ (Claude) │ │  Service │ │Processor*│ │ Service  │  │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │ │
│  │                   (*not integrated)                      │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

                              ↓

┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │Claude API│ │ Supabase*│ │ Deepgram*│ │Browser Speech│  │
│  │ (Active) │ │(No Tables)│ │(Not Used)│ │   (Active)   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. App Shell
The main application wrapper providing:
- **Sidebar Navigation**: Collapsible menu with module access
- **Header**: Search bar and user controls
- **Router**: Module switching without page reload
- **Settings**: Global app configuration

### 2. Context Providers

#### AppStateContext
Central state management using React Context + useReducer pattern:
```javascript
- documents: []
- advisors: [3 default advisors]
- conversations: []
- selectedAdvisors: []
- user: null
- settings: {}
```

#### SupabaseContext
Authentication wrapper (backend not connected):
- User authentication state
- Login/logout functionality
- Demo mode support

#### VoiceContext
Browser-based speech recognition:
- Speech-to-text (Chrome/Edge only)
- Text-to-speech for AI responses
- No Deepgram integration yet

### 3. Module System

Each module follows the pattern:
```
modules/
  └── [ModuleName]-CS21-v1/
      ├── index.js (exports)
      └── [ModuleName].js (component)
```

#### Active Modules:
1. **AI Hub** - Full chat interface with Claude
2. **Dashboard** - Statistics and activity tracking
3. **Subscription Hub** - Pricing and billing UI

#### Placeholder Modules:
1. **Document Hub** - UI shell only
2. **Advisory Hub** - UI shell only  
3. **Meeting Hub** - UI shell only

### 4. Service Layer

#### AI Service (✅ Implemented)
- Claude API integration
- Streaming responses
- Multi-advisor personality system
- Board meeting orchestration

#### Supabase Service (⚠️ Partial)
- Service methods defined
- No database tables created
- Authentication code ready but unused

#### Document Processor (❌ Not Integrated)
- Service exists but not connected
- No file upload handling
- No text extraction

#### Deepgram Service (❌ Not Integrated)
- API key configured
- Service stub exists
- Using browser Speech API instead

## Data Flow

### Current Flow (Local Only)
```
User Input → React Component → Context Update → Local State → UI Update
     ↓                                                           ↑
     └──→ AI Service → Claude API → Streaming Response ────────┘
```

### Intended Flow (Not Implemented)
```
User Input → React Component → Context Update → Supabase → Database
     ↓                              ↓                          ↑
     └──→ AI Service → Claude API  └──→ Real-time Sync ──────┘
              ↓
         Document Context → RAG Processing → Enhanced Response
```

## Technology Stack

### Frontend
- **React**: 18.2.0
- **Tailwind CSS**: 3.3.6  
- **Lucide Icons**: 0.294.0
- **Build Tool**: Create React App

### State Management
- **React Context API**: Global state
- **useReducer**: Complex state logic
- **localStorage**: Persistence

### External Services
- **Claude API**: Active and working
- **Supabase**: Configured but not connected
- **Deepgram**: API key only
- **Web Speech API**: Active fallback

## Security Architecture

### Current Implementation
- API keys in `.env.local`
- No user authentication active
- Demo mode bypasses security
- No data encryption
- No rate limiting

### Planned Security (Not Implemented)
- Supabase Row Level Security
- JWT token management
- API key proxy through backend
- Rate limiting per user
- Audit logging

## Performance Characteristics

### Current Performance
- **Initial Load**: ~2-3 seconds
- **Module Switch**: <100ms
- **AI Response**: 1-3 seconds first token
- **Memory Usage**: Grows with conversation length

### Bottlenecks
1. No pagination for long conversations
2. All state in memory
3. No lazy loading for modules
4. No request caching

## Deployment Architecture

### Current (Local Development)
```
Local Machine
  └── npm start → localhost:3000
```

### Planned (Not Implemented)
```
Vercel (Frontend)
  ├── Static React App
  └── API Routes → Supabase

Supabase (Backend)
  ├── PostgreSQL Database
  ├── Authentication
  ├── Storage Buckets
  └── Edge Functions
```

## Module Communication

Modules communicate through:
1. **Context Updates**: Dispatch actions to AppStateContext
2. **Direct Imports**: Services imported directly
3. **Local Storage**: Shared persistence layer

Example:
```javascript
// AI Hub adds document reference
dispatch({ 
  type: 'ADD_DOCUMENT_TO_CONVERSATION',
  payload: documentId 
});

// Dashboard reads from same context
const { documents } = useAppState();
```

## Known Architectural Limitations

1. **No Backend**: Everything resets on refresh
2. **No Module Lazy Loading**: All modules bundle together
3. **No Error Boundaries**: One error crashes app
4. **No WebSocket**: No real-time updates
5. **No Worker Threads**: Heavy processing blocks UI
6. **No Request Queue**: Parallel API calls not managed

## Future Architecture Considerations

### Immediate Needs
1. Implement Supabase backend
2. Add error boundaries
3. Create document upload pipeline
4. Implement lazy loading

### Long-term Evolution
1. Microservices for different AI providers
2. WebSocket for real-time features
3. Edge functions for document processing
4. CDN for static assets
5. Kubernetes for scaling

## Development Guidelines

### Module Creation
1. Create folder: `modules/[Name]-CS21-v[Version]/`
2. Export default component
3. Use AppStateContext for shared state
4. Keep module self-contained

### State Management
1. Use dispatch for state changes
2. Keep context updates atomic
3. Avoid direct state mutation
4. Use selectors for derived state

### Service Integration
1. Services should be stateless
2. Handle errors at service level
3. Return consistent data shapes
4. Use TypeScript interfaces (future)

---

This architecture provides a solid foundation for growth while acknowledging current limitations. The modular design enables incremental improvements without major refactoring.