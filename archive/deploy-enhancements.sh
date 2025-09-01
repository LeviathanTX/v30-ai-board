#!/bin/bash

# V21 AI Board - Deploy Enhanced Features
echo "🚀 Deploying V21 AI Board with Enhanced Features..."
echo "================================================"
echo ""

cd /Users/jeffl/Desktop/v21-ai-board

echo "📦 Building application with new features..."
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
echo "🎉 New Features in this deployment:"
echo "- ✅ Delete Documents functionality"
echo "- ✅ Fixed document upload visibility"
echo "- ✅ Create Custom Advisor working"
echo "- ✅ Edit Advisors functionality"
echo "- ✅ Start/Stop Meeting controls in AI Boardroom"
echo "- ✅ Meeting timer and duration tracking"
echo "- ✅ Enhanced advisor selection in Advisory Hub"
echo ""
echo "📋 Module Versions:"
echo "- AI Hub: v6 (with meeting controls)"
echo "- Document Hub: v3 (with delete functionality)"
echo "- Advisory Hub: v2 (with create/edit advisors)"
echo ""
echo "🔗 Your app is now live with all enhancements!"