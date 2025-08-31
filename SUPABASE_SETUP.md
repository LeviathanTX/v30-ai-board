# Supabase Setup Guide for AI Board of Advisors V21

## Prerequisites
- Supabase account (free tier works)
- Your Supabase project URL and anon key (already in your .env.local)

## Step 1: Run the Database Schema

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of `supabase-schema.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)

You should see success messages for each table and policy created.

## Step 2: Enable Extensions (if needed)

If you get errors about extensions, run these separately first:

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;
```

Note: The `vector` extension is for embeddings/RAG features. If it's not available on your plan, you can comment out the embedding-related columns and indexes.

## Step 3: Create Storage Buckets

1. Go to **Storage** in the left sidebar
2. Click **Create bucket**
3. Create two buckets:

### Documents Bucket:
- Name: `documents`
- Public: OFF (private)
- File size limit: 50MB
- Allowed MIME types: 
  ```
  application/pdf,
  application/msword,
  application/vnd.openxmlformats-officedocument.wordprocessingml.document,
  text/plain,
  text/csv,
  application/vnd.ms-excel,
  application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
  image/jpeg,
  image/png,
  image/gif
  ```

### Avatars Bucket:
- Name: `avatars`
- Public: ON (public)
- File size limit: 5MB
- Allowed MIME types:
  ```
  image/jpeg,
  image/png,
  image/gif,
  image/webp
  ```

## Step 4: Set Up Storage Policies

After creating buckets, set up their policies:

1. Click on the bucket name
2. Go to **Policies** tab
3. Click **New Policy**
4. Use **For full customization** option

### For Documents Bucket:

**SELECT Policy:**
```sql
(bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
```

**INSERT Policy:**
```sql
(bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
```

**DELETE Policy:**
```sql
(bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1])
```

### For Avatars Bucket:

**SELECT Policy (Public Read):**
```sql
(bucket_id = 'avatars')
```

**INSERT/UPDATE/DELETE Policies:**
```sql
(bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
```

## Step 5: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. Configure email settings:
   - Enable email confirmations (recommended)
   - Customize email templates if desired

## Step 6: (Optional) Configure Email Templates

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and recovery emails
3. Add your brand colors and logo

## Step 7: Test the Setup

1. Go back to your app: http://localhost:3000
2. Click "Sign Up" to create a test account
3. Check your email for confirmation (if enabled)
4. Sign in and test:
   - Upload a document
   - Create a custom advisor
   - Start an AI conversation

## Troubleshooting

### If you get "relation does not exist" errors:
- Make sure you ran the entire SQL script
- Check that you're in the correct project

### If file uploads fail:
- Verify storage buckets are created
- Check storage policies are set correctly
- Ensure file size is under limits

### If authentication fails:
- Check that Email provider is enabled
- Verify your anon key is correct in .env.local
- Check browser console for specific errors

### If RLS (Row Level Security) blocks access:
- Verify you're signed in
- Check that policies were created successfully
- Try disabling RLS temporarily for testing (not recommended for production)

## Next Steps

1. **Production Considerations:**
   - Enable email verification
   - Set up custom SMTP for emails
   - Configure rate limiting
   - Set up database backups

2. **Monitoring:**
   - Check **Database** → **Logs** for query performance
   - Monitor **Storage** usage
   - Set up alerts for errors

3. **Scaling:**
   - Consider upgrading plan for more storage/bandwidth
   - Enable connection pooling for better performance
   - Set up read replicas if needed

## Useful Supabase Features

1. **Real-time Subscriptions**: Already set up in the code for live updates
2. **Edge Functions**: For complex document processing
3. **Database Functions**: For business logic
4. **Webhooks**: For integrating with external services

## Support

- Supabase Docs: https://supabase.com/docs
- Discord: https://discord.supabase.com
- Your project dashboard: Check the URL in your .env.local