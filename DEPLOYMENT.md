# V30 AI Board - Deployment Guide

## Recent Updates (Latest Commit)
- ✅ **Fixed Advisor Responses**: AI Service now properly reads API keys from localStorage
- ✅ **Fixed Document Attachment**: Complete rewrite of file upload with proper content processing  
- ✅ **Enhanced Voice Configuration**: Multi-provider voice support with real-time testing
- ✅ **Voice API Indicators**: Connection status indicators in header
- ✅ **Improved Modals**: Enhanced Edit/Create Advisor modals with voice settings

## Quick Deploy to Vercel

### Option 1: GitHub + Vercel Auto-Deploy
1. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Repository name: `v30-ai-board`
   - Make it **Public**
   - **Don't** initialize with README

2. **Push Code**:
   ```bash
   cd /Users/jeffl/Desktop/v30-ai-board
   git push -u origin main
   ```

3. **Deploy to Vercel**:
   - Go to https://vercel.com/new
   - Import from GitHub: `LeviathanTX/v30-ai-board`
   - Click **Deploy**

### Option 2: Vercel CLI (Alternative)
```bash
npm i -g vercel
vercel --prod
```

## Environment Variables for Vercel

Set these in Vercel Dashboard → Project Settings → Environment Variables:

```bash
# Core API Keys (Required for AI responses)
REACT_APP_ANTHROPIC_API_KEY=your_claude_api_key_here

# Supabase (Optional - for advanced features)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key

# OpenAI (Optional - for voice features)  
REACT_APP_OPENAI_API_KEY=your_openai_key_here
```

## Post-Deployment Testing

After deployment:

1. **Test API Keys**: Go to Settings → AI Settings → Add Claude API key
2. **Test Advisor Responses**: Send a message in AI Hub - advisors should respond
3. **Test Document Upload**: Upload a .txt file and ask advisors about it
4. **Test Voice Configuration**: Configure voices in Edit/Create Advisor modals

## Build Configuration

The project uses these build settings (already configured in vercel.json):
- **Build Command**: `CI=false npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install --legacy-peer-deps`

## Features Ready for Production

✅ Advisor chat responses (fixed)
✅ Document attachment and analysis (fixed)  
✅ Voice configuration system
✅ API connection indicators
✅ Multi-provider AI support
✅ Real-time voice testing
✅ Enhanced UI/UX
✅ Mobile responsive design

---

**Deployment Status**: Ready for production deployment 🚀