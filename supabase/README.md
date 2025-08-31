# Supabase Setup Guide for V21 AI Board of Advisors

## Prerequisites
- Supabase account (create at https://supabase.com)
- Supabase CLI installed (optional but recommended)

## Quick Setup

### 1. Create New Supabase Project
1. Go to https://app.supabase.com
2. Click "New project"
3. Fill in:
   - Project name: `v21-ai-board`
   - Database password: (save this securely!)
   - Region: Choose closest to your users
   - Pricing plan: Free tier works for development

### 2. Run Database Schema
1. Go to SQL Editor in Supabase Dashboard
2. Click "New query"
3. Copy entire contents of `schema.sql`
4. Click "Run" (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned" for most statements

### 3. Enable Required Extensions
The schema automatically enables:
- `uuid-ossp` - For UUID generation
- `vector` - For AI embeddings (semantic search)
- `pg_trgm` - For text search

### 4. Configure Storage Buckets
Storage buckets are created automatically:
- `documents` - For user document uploads
- `avatars` - For profile pictures
- `recordings` - For meeting recordings

### 5. Get Your API Keys
1. Go to Settings → API
2. Copy:
   - Project URL (REACT_APP_SUPABASE_URL)
   - Anon/Public key (REACT_APP_SUPABASE_ANON_KEY)
   - Service role key (keep secure, server-side only!)

### 6. Update Environment Variables
In your `.env.local` file:
```
REACT_APP_SUPABASE_URL=https://[your-project-id].supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...your-anon-key
```

## Database Structure

### Core Tables
- **user_profiles** - Extended user data beyond auth
- **documents** - Uploaded documents with processing status
- **document_embeddings** - Vector embeddings for semantic search
- **advisors** - Both default and custom AI advisors
- **conversations** - Chat/meeting sessions
- **messages** - Individual messages in conversations
- **meetings** - Video meeting integration
- **advisor_templates** - Marketplace for custom advisors
- **usage_logs** - Track API usage for billing
- **subscription_limits** - Define tier capabilities

### Default Data
The schema includes:
- 5 default AI advisors (CSO, CFO, CMO, CTO, CPO)
- 4 subscription tiers (free, starter, professional, enterprise)
- Row Level Security policies for all tables

### Security Features
- Row Level Security (RLS) enabled on all tables
- Users can only access their own data
- Storage policies restrict document access
- Public advisor templates for marketplace

## Testing the Setup

### 1. Test Authentication
```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'testpassword123'
})
```

### 2. Test Document Upload
```javascript
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${user.id}/test.pdf`, file)
```

### 3. Test Database Query
```javascript
const { data, error } = await supabase
  .from('advisors')
  .select('*')
  .eq('type', 'default')
```

## Common Issues

### "permission denied for schema public"
- Make sure you're running queries as the postgres user
- Check that RLS policies are correctly set

### "extension vector does not exist"
- Your Supabase instance might not support pgvector
- Contact support to enable it for your project

### Storage upload fails
- Check bucket exists and policies are set
- Ensure file path includes user ID folder

## Next Steps

1. **Set up Edge Functions** for:
   - Document processing
   - AI embeddings generation
   - Usage tracking

2. **Configure Realtime** for:
   - Live message updates
   - Collaborative features
   - Meeting status changes

3. **Add Database Functions** for:
   - Complex queries
   - Usage calculations
   - Subscription management

## Maintenance

### Regular Tasks
- Monitor storage usage
- Check query performance
- Review security logs
- Update advisor templates

### Backup Strategy
- Enable Point-in-Time Recovery
- Set up daily backups
- Export critical data regularly

## Support
- Supabase Discord: https://discord.supabase.com
- Documentation: https://supabase.com/docs
- Status: https://status.supabase.com