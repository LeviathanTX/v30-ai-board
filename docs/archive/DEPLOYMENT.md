# Deployment Guide for V21 AI Board of Advisors

## Quick Deploy to Vercel

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Navigate to project**:
   ```bash
   cd /Users/jeffl/Desktop/v21-ai-board
   ```

3. **Build the project**:
   ```bash
   npm run build
   ```

4. **Deploy**:
   ```bash
   vercel
   ```

5. **Follow prompts**:
   - Set up and deploy: Y
   - Which scope: Select your account
   - Link to existing project: N
   - Project name: ai-board-advisors-v21
   - Directory: ./
   - Override settings: N

### Option 2: Deploy via GitHub

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial V21 deployment"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Configure environment variables (optional)
   - Deploy

## Environment Variables (Optional)

The app works without environment variables using:
- User-provided API keys via UI
- Demo mode for authentication
- Browser speech API

If you want to set defaults, add these in Vercel:
- `REACT_APP_ANTHROPIC_API_KEY`
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`

## Post-Deployment Setup

1. **Access your app**: https://your-app.vercel.app
2. **Configure API Key**: Click "Configure API" button
3. **Start using**: Try demo mode or sign up

## Testing Deployment

1. **Demo Mode**:
   - Click "Try Demo Mode" on login
   - Full functionality without persistence

2. **API Key Configuration**:
   - Click orange "Configure API" button
   - Enter Claude API key
   - System validates and saves locally

3. **Core Features**:
   - ✅ AI Chat with multiple advisors
   - ✅ Document upload (UI simulation)
   - ✅ Meeting controls
   - ✅ Dashboard analytics
   - ✅ Voice input (Chrome/Edge)

## Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Deployment Issues
```bash
# Use production build
vercel --prod
```

### API Key Issues
- Ensure key starts with `sk-ant-`
- Check for extra spaces
- Verify key is active on Anthropic

## Custom Domain

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Analytics

Add Vercel Analytics:
```bash
npm i @vercel/analytics
```

Then in `src/App.js`:
```javascript
import { Analytics } from '@vercel/analytics/react';

// Add before closing </div>
<Analytics />
```

## Success Metrics

Your deployment is successful when:
- ✅ App loads without errors
- ✅ Demo mode works
- ✅ API key configuration saves
- ✅ AI responses stream properly
- ✅ All modules are accessible

## Support

- Check console for errors (F12)
- Verify API key configuration
- Ensure using Chrome/Edge for voice
- Try demo mode first

## Next Steps

1. Share your deployment URL
2. Gather user feedback
3. Monitor usage in Vercel dashboard
4. Iterate based on feedback

---

Built with ❤️ for disrupting the executive advisory space