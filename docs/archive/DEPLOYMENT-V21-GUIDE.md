# V21 Deployment to Vercel - Step by Step

## Pre-Deployment Checklist

### 1. Commit All Changes to Git
```bash
cd /Users/jeffl/Desktop/v21-ai-board

# Check status
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "feat: Complete V21 redesign with V19-style clean UI
- Remove card-based module system
- Implement clean sidebar and header (V19 style)
- Create new AIHub V2 without expand/collapse cards
- Add command palette and modern UI components
- Update all modules with new design system"

# Push to GitHub (if you have a remote repository)
git push origin main
```

### 2. Environment Variables Check
Make sure your `.env.local` has all required keys:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key
REACT_APP_DEEPGRAM_API_KEY=your_deepgram_api_key
```

### 3. Build Test (Local)
```bash
# Test the build locally first
npm run build

# If successful, you can test the production build locally:
npx serve -s build
# Visit http://localhost:3000 to verify
```

## Deployment Options

### Option 1: Quick Deploy (Recommended)
```bash
# Make the script executable
chmod +x quick-deploy.sh

# Run the quick deploy
./quick-deploy.sh
```

### Option 2: Manual Vercel Deploy
```bash
# Build the project
npm run build

# Deploy to Vercel
vercel --prod

# Follow the prompts:
# - Select your project or create new
# - Confirm production deployment
```

### Option 3: Deploy via Vercel Dashboard
1. Push code to GitHub
2. Go to https://vercel.com/dashboard
3. Import project from GitHub
4. Configure environment variables in Vercel dashboard
5. Deploy

## Post-Deployment Steps

### 1. Set Environment Variables in Vercel
Go to your project settings in Vercel dashboard:
- Settings → Environment Variables
- Add all variables from `.env.local`
- Redeploy if needed

### 2. Test the Deployment
1. Visit your Vercel URL
2. Test Demo Mode first
3. Configure API key via UI
4. Test all major features:
   - AI Chat (new V2 design)
   - Document upload
   - Navigation
   - Dark mode

### 3. Custom Domain (Optional)
In Vercel dashboard:
- Settings → Domains
- Add your custom domain
- Follow DNS configuration steps

## Troubleshooting

### Build Errors
- Check console for specific errors
- Ensure all dependencies are installed: `npm install`
- Clear cache: `rm -rf node_modules package-lock.json && npm install`

### API Issues
- Verify environment variables are set in Vercel
- Check API key validity
- Ensure CORS is properly configured

### UI Not Updating
- Clear browser cache
- Check Vercel deployment logs
- Verify the correct branch is deployed

## Current Status
- ✅ V19-style clean UI implemented
- ✅ Card-based system removed
- ✅ New AIHub V2 without expand/collapse
- ✅ Modern sidebar and header
- ✅ All components updated

## Quick Commands Summary
```bash
# One-line deploy (if already configured)
cd /Users/jeffl/Desktop/v21-ai-board && npm run build && vercel --prod

# Or use the quick deploy script
cd /Users/jeffl/Desktop/v21-ai-board && ./quick-deploy.sh
```

Your V21 with the clean V19-style UI is ready to deploy! 🚀