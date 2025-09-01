# V30 Setup Guide - Complete Service Configuration

## 🚨 CRITICAL: V30 Needs Separate Services

V30 is completely isolated from V24 production, which means it needs its own database and service configurations.

## 1. 🗄️ Supabase Database Setup (REQUIRED)

### Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. **Name**: `v30-ai-board`
4. **Organization**: Same as V24 (or create new)
5. **Password**: Generate strong password
6. **Region**: Choose closest to users
7. Click "Create new project"

### Set Up Database Schema
1. Wait for project to be ready (~2 minutes)
2. Go to **SQL Editor** in left sidebar
3. Copy and paste the entire contents of `supabase/schema.sql`
4. Click "Run" to create all tables and functions
5. Go to **SQL Editor** → **Quickstarts** → Run the `supabase/seed.sql` for sample data (optional)

### Configure Authentication
1. Go to **Authentication** → **Settings**
2. **Site URL**: https://v30-ai-board-qpv9b4wje-jeff-levines-projects.vercel.app
3. **Redirect URLs**: Add same URL
4. Enable **Email** provider (at minimum)
5. Optionally enable **Google**, **GitHub** OAuth

### Get Your Credentials
1. Go to **Settings** → **API**
2. Copy **Project URL** 
3. Copy **anon public** key
4. Update `.env` file with these values

## 2. 🔑 Update Environment Variables

Edit `.env` file in project root:

```env
# Replace with YOUR V30 Supabase credentials
REACT_APP_SUPABASE_URL=https://your-v30-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_v30_anon_key

# AI Service Keys (can reuse from V24 or create new)
REACT_APP_ANTHROPIC_API_KEY=your_claude_key
REACT_APP_OPENAI_API_KEY=your_openai_key
```

## 3. 🚀 Deploy Updated Environment to Vercel

After updating `.env`, set environment variables in Vercel:

1. Go to https://vercel.com/jeff-levines-projects/v30-ai-board/settings/environment-variables
2. Add each environment variable from your `.env` file
3. Redeploy: `vercel --prod`

## 4. 🎯 AI Service Options

You have several options for AI services:

### Option A: Reuse V24 Keys (Easiest)
- Use same API keys as V24 production
- No additional cost
- Same AI service limits shared

### Option B: Separate AI Keys (Recommended)
- Create separate API accounts for V30
- Independent usage tracking
- Isolated from production limits
- Better for development

### Service Providers:
- **Anthropic Claude**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/
- **Google Gemini**: https://aistudio.google.com/
- **DeepSeek**: https://platform.deepseek.com/

## 5. 🎤 Voice Services (Optional)

For voice features:
- **Deepgram**: https://console.deepgram.com/
- **ElevenLabs**: https://elevenlabs.io/

## 6. ✅ Verification Steps

1. **Database**: Can you sign up/login at V30 URL?
2. **AI Services**: Can you chat with advisors?
3. **Voice**: Can you use voice controls?
4. **Documents**: Can you upload and analyze documents?

## 7. 🔒 Security Notes

- ✅ V30 database is completely separate from V24
- ✅ V30 has its own user accounts
- ✅ No data sharing between V24 and V30
- ✅ Independent service quotas and limits

## 8. 🆘 Troubleshooting

### "Can't login" issues:
- Check Supabase project is active
- Verify Site URL matches V30 Vercel URL
- Confirm environment variables are set in Vercel

### "AI not responding" issues:
- Check API keys are valid and have credits
- Verify environment variables are deployed to Vercel
- Check browser console for API errors

### Database connection issues:
- Verify Supabase URL and anon key
- Check if database schema was created
- Confirm Vercel environment variables match .env

---

## 📞 Need Help?

If you run into issues:
1. Check browser console for errors
2. Verify all environment variables are set
3. Test Supabase connection in dashboard
4. Confirm API keys work in their respective consoles