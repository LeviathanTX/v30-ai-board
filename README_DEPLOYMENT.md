# V21 AI Board of Advisors - Deployment Instructions

## Quick Deploy

```bash
cd /Users/jeffl/Desktop/v21-ai-board
vercel --prod
```

## Fixed Issues

1. **ESLint Warnings**: Fixed all unused imports and dependencies
2. **Context Provider Order**: Fixed the provider hierarchy so AppStateProvider wraps SupabaseProvider

## Environment Variables

Make sure you have set your environment variables in Vercel:
- `REACT_APP_ANTHROPIC_API_KEY` - Your Claude API key

## Features Working

- AI Chat with multiple advisors
- Voice input (Chrome/Edge)
- Document placeholder UI
- Dashboard with statistics
- Subscription management UI

## Demo Mode

The app runs in demo mode by default, no login required.
