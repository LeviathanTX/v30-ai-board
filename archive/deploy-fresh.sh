#!/bin/bash

# Clear Vercel cache and redeploy
echo "Clearing Vercel cache and redeploying..."

# Remove local .vercel directory
rm -rf .vercel

# Deploy with --force flag to bypass cache
vercel --prod --force

echo "Deployment complete!"
