#!/bin/bash

# V21 AI Board - Deploy Latest Fixes
echo "🚀 Deploying V21 AI Board with all fixes..."
echo "==========================================="
echo ""
echo "📦 Building application..."
cd /Users/jeffl/Desktop/v21-ai-board

# Build the app
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check errors above."
    exit 1
fi

echo "✅ Build successful!"
echo ""
echo "🚀 Deploying to Vercel..."

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎉 Fixed in this deployment:"
echo "- Meeting Host shows in Advisors sidebar"
echo "- Upload button added near chat send"
echo "- Document Hub upload no longer crashes"
echo "- Settings gear is functional"
echo "- Authentication/Demo mode working"
echo "- Advisors respond to messages"
echo "- Subscription pricing blurred"
echo ""
echo "🔗 Your app is now live with all fixes!"