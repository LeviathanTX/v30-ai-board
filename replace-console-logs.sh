#!/bin/bash
# Replace console.log statements with proper logging

echo "🧹 Replacing console.log statements with proper logging..."

# Create backup
echo "📦 Creating backup..."
cp -r src src_backup_$(date +%Y%m%d_%H%M%S)

# Replace console.log patterns with proper logging
find src/ -name "*.js" -type f -exec sed -i '' \
  -e "s/console\.log(/logger.debug(/g" \
  -e "s/console\.error(/logger.error(/g" \
  -e "s/console\.warn(/logger.warn(/g" \
  -e "s/console\.info(/logger.info(/g" \
  {} \;

echo "✅ Console.log replacement complete!"

# Count remaining console statements  
remaining=$(find src/ -name "*.js" -exec grep -c "console\." {} \; | awk '{sum += $1} END {print sum}')
echo "📊 Remaining console statements: $remaining"

echo "🎯 Next steps:"
echo "1. Add logger imports to files that need them"
echo "2. Review and adjust log levels as needed"
echo "3. Test the application"