#!/bin/bash

# V21 Clean UI Update - Deploy to Vercel
echo "🚀 Deploying V21 Clean UI Update to Vercel..."
echo "==========================================="

# Test build first
echo "🧪 Testing build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please check errors above."
    exit 1
fi

echo "✅ Build successful!"

# Deploy to Vercel
echo "🚀 Deploying to Vercel (production)..."
vercel --prod

echo ""
echo "✅ V21 Clean UI deployed successfully!"
echo ""
echo "🎨 What's New:"
echo "- Clean V19-style interface (no more cards!)"
echo "- White sidebar matching V19 design"
echo "- Simple module containers"
echo "- New AI Hub without expand/collapse buttons"
echo "- Professional, minimal design"
echo ""
echo "🔗 Visit your deployment URL to see the changes!"