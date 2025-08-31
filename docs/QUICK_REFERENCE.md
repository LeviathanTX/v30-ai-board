# V21 Quick Reference Guide - Your Daily Development Companion

## What This Guide Is For

Think of this guide as your co-pilot's quick reference card. While the full architecture documentation is like an aircraft manual, this guide contains the essential information you need for day-to-day development. Keep it open while you work - it's designed to answer the most common questions without requiring you to dig through lengthy documentation.

## Current System Status Dashboard

Understanding what's working helps you build on solid ground. Here's your at-a-glance system status:

### 🟢 Fully Operational (Don't Break These!)
- **Core Shell Navigation**: Module switching, sidebar, user menu
- **AI Chat with Claude**: Single & board meeting modes work
- **Document UI**: Upload, view, search interface complete
- **Voice Input**: Browser-based speech recognition active
- **Theme System**: Light/dark modes functioning
- **Demo Mode**: Full offline functionality

### 🟡 Partially Working (Enhance Carefully)
- **Document Processing**: Works in memory, not persisted
- **Supabase Config**: Set up but not connected
- **AI Memory**: Session-only, resets on refresh
- **Custom Advisors**: Data model exists, no UI

### 🔴 Not Implemented (Green Field)
- **Cloud Persistence**: No data saved between sessions
- **Video Platforms**: No Zoom/Meet/Teams integration
- **Payment Processing**: No Stripe connection
- **Advanced Analytics**: No usage tracking
- **Team Features**: Single user only

## Quick Command Reference

These are the commands you'll use daily. Think of them as keyboard shortcuts for development:

### Start Development
```bash
cd /Users/jeffl/Desktop/v21-ai-board
npm start                    # Starts on http://localhost:3000
```

### Common File Locations
```bash
# Core application files
src/App.js                   # Main app entry
src/components/CoreShell/    # Navigation frame
src/contexts/                # State management
src/modules/                 # Feature modules
src/services/                # API integrations

# Documentation
docs/ARCHITECTURE_GUIDE.md   # Full system design
docs/FEATURE_ROADMAP.md      # What we're building
docs/IMPLEMENTATION_CHECKLIST.md  # Pre-flight checks

# Configuration
.env.local                   # API keys and config
package.json                 # Dependencies
```

### Git Commands You'll Actually Use
```bash
# Before starting work
git pull origin main         # Get latest changes
git checkout -b feature/your-feature-name

# While working
git add .                    # Stage changes
git commit -m "Add: description of what you added"
git push origin feature/your-feature-name

# When things go wrong
git status                   # What changed?
git diff                     # See actual changes
git checkout -- filename     # Undo file changes
git reset --hard HEAD        # Nuclear option - undo everything
```

## Module Creation Template

When adding a new module, follow this template to maintain consistency. Think of it as a recipe - follow it exactly for best results:

```javascript
// src/modules/YourModule-CS21-v1/YourModule.js
import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import { YourIcon } from 'lucide-react';

export default function YourModule() {
  const { state, dispatch, actions } = useAppState();
  const [localState, setLocalState] = useState(null);
  
  // Module initialization
  useEffect(() => {
    // Setup code here
    return () => {
      // Cleanup code here
    };
  }, []);
  
  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">
          Your Module Name
        </h1>
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Your module content */}
      </div>
    </div>
  );
}

// src/modules/YourModule-CS21-v1/index.js
export { default } from './YourModule';
```

## State Management Patterns

Understanding how data flows prevents many bugs. Here are the patterns you'll use repeatedly:

### Reading State
```javascript
// In any component
const { state } = useAppState();

// Access specific data
const documents = state.documents || [];
const currentUser = state.user;
const isLoading = state.documentsLoading;
```

### Updating State
```javascript
// Always use dispatch with actions
const { dispatch, actions } = useAppState();

// Add a document
dispatch({
  type: actions.ADD_DOCUMENT,
  payload: documentObject
});

// Update multiple fields
dispatch({
  type: actions.UPDATE_SETTINGS,
  payload: {
    theme: 'dark',
    voiceEnabled: true
  }
});

// Show notification
dispatch({
  type: actions.ADD_NOTIFICATION,
  payload: {
    message: 'Operation successful!',
    type: 'success' // or 'error', 'warning', 'info'
  }
});
```

### Common State Actions
```javascript
// Documents
ADD_DOCUMENT          // Add new document
UPDATE_DOCUMENT       // Modify existing
DELETE_DOCUMENT       // Remove document
SET_DOCUMENTS         // Replace all

// Advisors  
SELECT_ADVISORS       // Set active advisors
ADD_SELECTED_ADVISOR  // Add to selection
REMOVE_SELECTED_ADVISOR // Remove from selection

// Conversations
ADD_MESSAGE          // Add chat message
SET_ACTIVE_CONVERSATION // Switch conversations
START_MEETING        // Begin board meeting
END_MEETING          // End board meeting

// UI State
ADD_NOTIFICATION     // Show user message
SET_VOICE_COMMAND    // Process voice input
MODULE_VOICE_COMMAND // Route to module
UPDATE_SETTINGS      // Change preferences
```

## Service Integration Patterns

Services handle external communication. Here's how to use them properly:

### AI Service
```javascript
import aiService from '../../services/aiService';

// Send a message
const response = await aiService.sendMessage(
  userMessage,
  selectedAdvisor,
  {
    documents: selectedDocs,
    conversationHistory: messages,
    stream: false
  }
);

// Conduct board meeting
const responses = await aiService.conductBoardMeeting(
  userMessage,
  allAdvisors,
  selectedDocs,
  { rounds: 1 }
);
```

### Document Processing
```javascript
import documentProcessor from '../../services/documentProcessor';

// Process uploaded file
try {
  const result = await documentProcessor.processDocument(file);
  console.log(result.text);        // Extracted text
  console.log(result.summary);     // AI summary
  console.log(result.keywords);    // Key terms
} catch (error) {
  // Handle unsupported format or processing error
}
```

### Feature Flags
```javascript
import { FEATURES } from '../../config/features';

// Check if feature is enabled
if (FEATURES.CLOUD_SYNC) {
  // Show cloud sync options
}

// Conditional rendering
{FEATURES.AI_MEMORY && (
  <MemorySettings />
)}
```

## CSS and Styling Guide

Consistent styling makes the app feel professional. Follow these patterns:

### Basic Component Structure
```jsx
// Container with proper spacing
<div className="h-full flex flex-col bg-gray-50">
  {/* Header section */}
  <div className="bg-white border-b border-gray-200 px-6 py-4">
    <h1 className="text-xl font-semibold text-gray-900">Title</h1>
  </div>
  
  {/* Scrollable content */}
  <div className="flex-1 overflow-y-auto p-6">
    {/* Content here */}
  </div>
</div>
```

### Common Tailwind Patterns
```jsx
// Buttons
<button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
  Click Me
</button>

// Cards
<div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
  Card content
</div>

// Form inputs
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />

// Loading states
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>

// Error states
<div className="bg-red-50 text-red-700 p-4 rounded-lg">
  Error message
</div>
```

### Dark Mode Support
```jsx
// Use conditional classes
className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}

// Or define both
className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
```

## Error Handling Patterns

Graceful error handling keeps users happy. Here are the patterns to follow:

### Service Calls
```javascript
try {
  setLoading(true);
  const result = await someService.doSomething();
  // Handle success
} catch (error) {
  console.error('Service error:', error);
  dispatch({
    type: actions.ADD_NOTIFICATION,
    payload: {
      message: 'Something went wrong. Please try again.',
      type: 'error'
    }
  });
} finally {
  setLoading(false);
}
```

### Component Error Boundaries
```javascript
// Wrap modules in error boundaries
<ErrorBoundary fallback={<ModuleErrorState />}>
  <YourModule />
</ErrorBoundary>
```

### Validation
```javascript
// Always validate inputs
const handleSubmit = (data) => {
  if (!data.name?.trim()) {
    showError('Name is required');
    return;
  }
  
  if (data.size > MAX_FILE_SIZE) {
    showError('File too large');
    return;
  }
  
  // Proceed with valid data
};
```

## Testing Checklist

Before pushing any code, run through this quick checklist:

### Functionality Tests
- [ ] Feature works as intended
- [ ] Existing features still work
- [ ] Error cases handled gracefully
- [ ] Loading states show properly
- [ ] Empty states have helpful messages

### Visual Tests
- [ ] Looks good in light mode
- [ ] Looks good in dark mode
- [ ] Mobile responsive (375px width)
- [ ] No layout breaks on resize
- [ ] Animations are smooth

### Code Quality
- [ ] No console errors
- [ ] No console.log statements
- [ ] Code follows existing patterns
- [ ] Complex logic has comments
- [ ] File names match conventions

## Common Issues and Solutions

These solutions will save you hours of debugging:

### "Module won't load"
```javascript
// Check module exports
// index.js should have:
export { default } from './ModuleName';

// Check Core Shell imports
const moduleComponents = {
  moduleName: React.lazy(() => import('../../modules/ModuleName-CS21-v1'))
};
```

### "State updates but UI doesn't"
```javascript
// Ensure you're not mutating state
// ❌ Wrong
state.documents.push(newDoc);

// ✅ Correct  
dispatch({
  type: actions.ADD_DOCUMENT,
  payload: newDoc
});
```

### "API calls fail"
```javascript
// Check environment variables
console.log(process.env.REACT_APP_ANTHROPIC_API_KEY);

// Ensure .env.local exists and has:
REACT_APP_ANTHROPIC_API_KEY=your_actual_key
```

### "Styles look wrong"
```jsx
// Check Tailwind class names
// ❌ Wrong: bg-blue
// ✅ Correct: bg-blue-600

// Check for typos in classes
// ❌ Wrong: flex-center
// ✅ Correct: flex items-center justify-center
```

## Quick Debugging Commands

When things go wrong, these commands help diagnose issues:

```javascript
// In browser console

// Check current app state
localStorage.getItem('appState');

// See all stored data
Object.keys(localStorage);

// Monitor state changes
window.addEventListener('storage', (e) => {
  console.log('Storage changed:', e.key, e.newValue);
});

// Check if service is available
console.log(window.aiService);

// Test API connection
fetch('/api/health').then(r => r.json()).then(console.log);
```

## Performance Quick Wins

Small changes that make a big difference:

### React Optimizations
```javascript
// Memoize expensive computations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// Prevent unnecessary re-renders
const MemoizedComponent = React.memo(YourComponent);

// Use callback for stable function references
const stableCallback = useCallback(() => {
  doSomething();
}, [dependency]);
```

### Loading Optimizations
```javascript
// Lazy load heavy components
const HeavyModule = React.lazy(() => 
  import('./HeavyModule')
);

// Show loading state
<Suspense fallback={<LoadingSpinner />}>
  <HeavyModule />
</Suspense>
```

### State Optimizations
```javascript
// Batch state updates
dispatch({ type: 'BATCH_UPDATE', payload: {
  documents: newDocs,
  loading: false,
  error: null
}});

// Debounce rapid updates
const debouncedSearch = useMemo(
  () => debounce(search, 300),
  []
);
```

## Emergency Procedures

When everything goes wrong, follow these steps:

### 1. App Won't Start
```bash
# Clear everything and restart
rm -rf node_modules
rm package-lock.json
npm install
npm start

# If still broken, check Node version
node --version  # Should be 16+
```

### 2. Build Fails
```bash
# Clear cache
rm -rf node_modules/.cache
npm run build

# Check for syntax errors
npm run lint
```

### 3. Lost Work Recovery
```bash
# Check git stash
git stash list
git stash pop

# Check reflog for lost commits
git reflog
git checkout <lost-commit-hash>
```

### 4. Production Emergency
```javascript
// Add emergency feature flag
window.EMERGENCY_DISABLE_FEATURE = true;

// In code
if (window.EMERGENCY_DISABLE_FEATURE) {
  return <SafeFallback />;
}
```

## Daily Workflow

A typical development day should follow this pattern:

### Morning Setup (5 minutes)
1. Pull latest changes
2. Check Slack/Discord for updates
3. Review yesterday's work
4. Plan today's tasks

### Before Coding (10 minutes)
1. Read relevant documentation
2. Check implementation checklist
3. Create feature branch
4. Set up feature flag

### While Coding (ongoing)
1. Test frequently
2. Commit often (every 30-60 min)
3. Follow established patterns
4. Ask questions when unsure

### Before Break/End of Day (15 minutes)
1. Commit all changes
2. Push to remote
3. Test one more time
4. Update documentation if needed
5. Note tomorrow's tasks

## Resources and Help

When you need more information:

### Internal Documentation
- `/docs/ARCHITECTURE_GUIDE.md` - System design
- `/docs/FEATURE_ROADMAP.md` - What we're building  
- `/docs/IMPLEMENTATION_CHECKLIST.md` - Pre-flight checks
- This guide - Daily reference

### External Resources
- [React Docs](https://react.dev) - React patterns
- [Tailwind CSS](https://tailwindcss.com) - Styling classes
- [Lucide Icons](https://lucide.dev) - Icon reference
- [Claude API](https://docs.anthropic.com) - AI integration

### Getting Help
1. Check this guide first
2. Search the codebase for similar patterns
3. Review git history for context
4. Ask in team chat with specific questions
5. Schedule pairing session for complex issues

## Remember

Building great software is like crafting fine furniture - it takes patience, attention to detail, and respect for the materials. Every line of code you write becomes part of the foundation for future features. Take pride in your work, follow the patterns, and always leave the codebase better than you found it.

When in doubt:
- Choose stability over cleverness
- Choose clarity over brevity  
- Choose extension over modification
- Choose user experience over developer convenience

Happy coding! 🚀