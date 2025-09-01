# V30 AI Board of Advisors - Theatrical Environments Edition

## Overview

V30 represents the next evolution of the AI Board of Advisors platform, featuring immersive theatrical environments and advanced voice integration capabilities. This repository is completely separate from the production V24 system.

## 🎭 Key V30 Features

### Theatrical View Modes
- **Chat Mode**: Clean, minimal interface for focused conversations
- **Boardroom Mode**: Professional meeting environment with executive presence
- **Shark Tank Stage**: High-stakes pitch environment with dramatic lighting

### Advanced Voice Integration
- Voice controls in advisor creation/editing modals
- Enhanced voice settings and configuration
- Real-time voice transcript processing

### Dynamic UI Theming
- Environment-specific background effects
- Adaptive message styling based on current mode
- Smooth transitions between theatrical environments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for cloud features)

### Setup & Deployment

1. **Clone and Setup**:
   ```bash
   git clone [your-repo-url]
   cd v30-ai-board
   npm install
   ```

2. **Configure Database**:
   ```bash
   node setup-supabase.js  # Interactive setup wizard
   node verify-supabase.js # Test connection
   ```

3. **Deploy**:
   ```bash
   # Full deployment with checks
   ./deploy-v30.sh prod
   
   # Quick deployment (no checks)
   ./quick-deploy.sh
   ```

### Deployment Options

- `./deploy-v30.sh dev` - Development deployment with checks
- `./deploy-v30.sh staging` - Staging deployment  
- `./deploy-v30.sh prod` - Production deployment with confirmation
- `./quick-deploy.sh` - Fast deployment without validation

### Installation
```bash
git clone https://github.com/LeviathanTX/v30-ai-board.git
cd v30-ai-board
npm install --legacy-peer-deps
```

### Environment Setup
Create a `.env` file in the root directory:
```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Keys
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_key
REACT_APP_OPENAI_API_KEY=your_openai_key

# Environment
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=v30
```

### Development
```bash
npm start
```

### Production Build
```bash
npm run build
```

## 🎯 Development Phases

### Phase 1: Core Infrastructure
- [ ] ViewModeContext implementation
- [ ] Basic theatrical environments
- [ ] Theme switching system

### Phase 2: UI Integration
- [ ] AIHub ViewMode integration
- [ ] Dynamic theming throughout interface  
- [ ] Environment selector UI

### Phase 3: Voice Enhancement
- [ ] Modal voice controls
- [ ] Advanced voice settings
- [ ] Voice transcript improvements

### Phase 4: Polish & Effects
- [ ] Background effects (particles, spotlights)
- [ ] Smooth transitions
- [ ] Performance optimization

## 🛠️ Deployment

V30 will be deployed to its own Vercel project, completely separate from V24 production.

## 🔗 Related Projects

- [V24 Production](https://github.com/LeviathanTX/v24-ai-board-STABLE) - Current production system

## 📄 License

Private - All Rights Reserved

---

**V30 AI Board of Advisors** - Where strategy meets theater! 🎭✨