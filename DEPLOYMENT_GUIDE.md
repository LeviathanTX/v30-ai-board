# Deployment Guide for AI Board of Advisors V21

## Pre-deployment Checklist

### 1. Environment Variables
Your `.env.local` variables need to be added to Vercel:
- `REACT_APP_SUPABASE_URL`
- `REACT_APP_SUPABASE_ANON_KEY`
- `REACT_APP_ANTHROPIC_API_KEY`
- `REACT_APP_DEEPGRAM_API_KEY` (optional)

### 2. Update Supabase Settings
1. Go to your Supabase project settings
2. Add your Vercel domain to **Authentication > URL Configuration**:
   - Site URL: `https://your-app-name.vercel.app`
   - Redirect URLs: Add `https://your-app-name.vercel.app/*`

## Deployment Steps

### Option 1: Deploy with Vercel CLI (Recommended)

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Navigate to your project**:
```bash
cd /Users/jeffl/Desktop/v21-ai-board
```

3. **Run Vercel**:
```bash
vercel
```

4. **Follow the prompts**:
- Login/signup when prompted
- Select "Continue with GitHub/GitLab/Bitbucket" or email
- Confirm this is the correct project directory
- Link to existing project? **No** (for first deployment)
- What's your project name? `ai-board-advisors` (or your choice)
- Which directory is your code located? `./` (current directory)
- Want to override settings? **No**

5. **Add Environment Variables**:
```bash
vercel env add REACT_APP_SUPABASE_URL
vercel env add REACT_APP_SUPABASE_ANON_KEY
vercel env add REACT_APP_ANTHROPIC_API_KEY
vercel env add REACT_APP_DEEPGRAM_API_KEY
```

6. **Deploy to Production**:
```bash
vercel --prod
```

### Option 2: Deploy via GitHub

1. **Push to GitHub** (if not already):
```bash
git init
git add .
git commit -m "Initial commit - AI Board of Advisors V21"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/v21-ai-board.git
git push -u origin main
```

2. **Connect to Vercel**:
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Configure project:
  - Framework Preset: Create React App
  - Root Directory: ./
  - Build Command: `npm run build`
  - Output Directory: `build`

3. **Add Environment Variables** in Vercel Dashboard:
- Go to Project Settings > Environment Variables
- Add all your `REACT_APP_*` variables

4. **Deploy**!

## Post-Deployment

### 1. Update Supabase URLs
Add your production URL to Supabase:
- Authentication > URL Configuration
- Add: `https://ai-board-advisors.vercel.app` (your actual URL)

### 2. Test Everything
- [ ] Sign up with a new account
- [ ] Sign in/out
- [ ] Upload a document
- [ ] Create a custom advisor
- [ ] Have an AI conversation
- [ ] Check voice features (HTTPS required)

### 3. Custom Domain (Optional)
In Vercel dashboard:
1. Go to Settings > Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update Supabase redirect URLs

## Troubleshooting

### Build Errors
If you get build errors, try:
```bash
npm run build
```
locally first to catch issues.

### Environment Variables Not Working
- Make sure all env vars start with `REACT_APP_`
- Redeploy after adding variables:
```bash
vercel --prod
```

### Supabase Auth Issues
- Double-check redirect URLs in Supabase
- Ensure your production URL is in the allowed list
- Check browser console for specific errors

### Performance Optimization
Add these to your `package.json` for better performance:
```json
"homepage": "https://ai-board-advisors.vercel.app",
"scripts": {
  "build": "react-scripts build && echo '/* /index.html 200' > build/_redirects"
}
```

## Security Considerations

1. **API Keys**: 
   - Never commit `.env.local` to Git
   - Use Vercel environment variables
   - Consider implementing API routes for sensitive operations

2. **Rate Limiting**:
   - Implement rate limiting for API calls
   - Monitor usage in Anthropic dashboard

3. **Content Security**:
   - Review Supabase RLS policies
   - Test user data isolation

## Monitoring

1. **Vercel Analytics**:
   - Enable in Vercel dashboard
   - Monitor performance metrics

2. **Error Tracking**:
   - Consider adding Sentry or similar
   - Monitor console errors

3. **Usage Tracking**:
   - Check Supabase dashboard for database usage
   - Monitor Anthropic API usage

## Next Steps

1. **Set up staging environment**
2. **Configure CI/CD pipeline**
3. **Add error tracking**
4. **Implement analytics**
5. **Set up backups**

---

Your app is now live! Share your URL and start getting feedback.