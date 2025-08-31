#!/bin/bash

# Build script to test for errors
cd /Users/jeffl/Desktop/v21-ai-board

echo "Installing dependencies..."
npm install

echo "Running build..."
npm run build

echo "Build complete!"
