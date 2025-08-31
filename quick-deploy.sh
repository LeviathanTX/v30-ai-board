#!/bin/bash

# V21 AI Board - One-Click Deploy Script

echo "🚀 V21 AI Board - One-Click Deployment Starting..."
echo "================================================"

# Navigate to project directory
cd /Users/jeffl/Desktop/v21-ai-board || exit 1

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install || exit 1
else
    echo "✅ Dependencies already installed"
fi

# Build the project
echo "🔨 Building production bundle..."
npm run build || exit 1

# Check if Vercel CLI is installed, if not install it
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm i -g vercel || exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "📝 Note: You may need to log in to Vercel if not already logged in"
echo ""

# Deploy with production flag
vercel --prod

echo ""
echo "✅ Deployment process complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your deployment URL"
echo "2. Click 'Try Demo Mode' to test"
echo "3. Configure your API key using the orange button"
echo "4. Start using your AI Board of Advisors!"
echo ""
echo "🎉 Enjoy your AI Board of Advisors!"