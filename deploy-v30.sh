#!/bin/bash

# V30 AI Board Deployment Script
# Usage: ./deploy-v30.sh [dev|staging|prod]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get deployment environment (default to dev)
ENVIRONMENT=${1:-dev}

echo -e "${BLUE}🚀 V30 AI Board Deployment${NC}"
echo -e "${BLUE}===========================${NC}"
echo -e "Environment: ${YELLOW}$ENVIRONMENT${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "src/App.js" ]; then
    print_error "Not in V30 project directory. Please run from project root."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Run 'node setup-supabase.js' first."
    exit 1
fi

# Verify environment variables
echo -e "${BLUE}🔍 Checking environment setup...${NC}"

# Check for required variables
source .env 2>/dev/null || true

if [ -z "$REACT_APP_SUPABASE_URL" ] || [ -z "$REACT_APP_SUPABASE_ANON_KEY" ]; then
    print_error "Missing Supabase credentials. Run 'node setup-supabase.js'"
    exit 1
fi

print_status "Environment variables configured"

# Test Supabase connection
echo -e "${BLUE}🔗 Testing Supabase connection...${NC}"
node verify-supabase.js > /dev/null 2>&1
if [ $? -eq 0 ]; then
    print_status "Supabase connection verified"
else
    print_warning "Supabase connection test failed, but continuing..."
fi

# Install dependencies if needed
if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules/.package-lock.json" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm ci
    print_status "Dependencies installed"
fi

# Run linting (if configured)
if grep -q "\"lint\"" package.json; then
    echo -e "${BLUE}🔍 Running linting...${NC}"
    npm run lint --silent || print_warning "Linting found issues"
fi

# Build the project
echo -e "${BLUE}🏗️  Building production bundle...${NC}"
npm run build

if [ ! -d "build" ]; then
    print_error "Build failed - no build directory created"
    exit 1
fi

print_status "Build completed successfully"

# Deploy based on environment
case $ENVIRONMENT in
    "dev"|"development")
        echo -e "${BLUE}🚧 Deploying to development...${NC}"
        vercel --confirm
        ;;
    "staging")
        echo -e "${BLUE}🎭 Deploying to staging...${NC}"
        vercel --target staging --confirm
        ;;
    "prod"|"production")
        echo -e "${BLUE}🌟 Deploying to production...${NC}"
        echo -e "${YELLOW}⚠️  This will deploy to live production!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            vercel --prod --confirm
        else
            print_warning "Production deployment cancelled"
            exit 0
        fi
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        echo "Usage: $0 [dev|staging|prod]"
        exit 1
        ;;
esac

# Get deployment URL from Vercel output
echo ""
print_status "Deployment completed!"

# Post-deployment verification
echo -e "${BLUE}🔍 Running post-deployment checks...${NC}"

# Check if Vercel CLI is available and get URL
if command -v vercel &> /dev/null; then
    DEPLOY_URL=$(vercel ls | head -n 2 | tail -n 1 | awk '{print $2}' 2>/dev/null || echo "")
    if [ ! -z "$DEPLOY_URL" ] && [ "$DEPLOY_URL" != "URL" ]; then
        echo -e "${GREEN}🌐 Deployment URL: https://$DEPLOY_URL${NC}"
        
        # Wait a moment for deployment to be live
        sleep 5
        
        # Test if deployment is accessible
        if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_URL" | grep -q "200"; then
            print_status "Deployment is live and accessible"
        else
            print_warning "Deployment may not be fully ready yet"
        fi
    fi
fi

echo ""
echo -e "${GREEN}🎉 V30 Deployment Complete!${NC}"
echo -e "${GREEN}=========================${NC}"
echo ""

# Show next steps based on environment
case $ENVIRONMENT in
    "dev"|"development")
        echo -e "${BLUE}Next steps for development:${NC}"
        echo "• Test core functionality (auth, chat, documents)"
        echo "• Check browser console for any errors"
        echo "• Verify Supabase integration is working"
        ;;
    "staging")
        echo -e "${BLUE}Next steps for staging:${NC}"
        echo "• Full end-to-end testing"
        echo "• Performance testing"
        echo "• Cross-browser testing"
        echo "• Security review"
        ;;
    "prod"|"production")
        echo -e "${BLUE}Production deployment successful:${NC}"
        echo "• Monitor application health"
        echo "• Watch for any user reports"
        echo "• Check analytics and performance metrics"
        ;;
esac

echo ""
echo -e "${BLUE}📚 Quick links:${NC}"
echo "• Supabase Dashboard: https://supabase.com/dashboard"
echo "• Vercel Dashboard: https://vercel.com/dashboard"
echo "• Deploy logs: vercel logs"
echo ""