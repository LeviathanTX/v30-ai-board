#!/bin/bash

# V30 AI Board - Quick Deploy (No Checks)

echo "⚡ V30 Quick Deploy"
echo "=================="

npm run build && vercel --prod

echo ""
echo "🎉 Done! Check your deployment at Vercel dashboard"