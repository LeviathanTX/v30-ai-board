#!/bin/bash
# deploy.sh - Quick deployment script for V21 AI Board

echo "🚀 Deploying V21 AI Board of Advisors..."

# Run tests (when you add them)
# npm test

# Build the project
echo "📦 Building production bundle..."
npm run build

# Deploy to Vercel
echo "☁️  Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Visit your app at: https://v21-ai-board.vercel.app"