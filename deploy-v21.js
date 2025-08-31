// deploy-v21.js
// Save this in your v21-ai-board directory and run: node deploy-v21.js

const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying V21 AI Board of Advisors...\n');

// Helper function to write files
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error creating ${filePath}:`, error.message);
  }
}

// Update src/index.css
const indexCSS = `/* src/index.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Inter font */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

/* Custom scrollbar */
@layer utilities {
  /* Webkit browsers */
  .scrollbar-thin::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .scrollbar-thin::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }

  .scrollbar-thin::-webkit-scrollbar-thumb:hover {
    background: #555;
  }

  /* Firefox */
  .scrollbar-thin {
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;
  }
}

/* Global styles */
@layer base {
  body {
    @apply antialiased;
  }

  /* Focus styles */
  *:focus {
    outline: none;
  }

  *:focus-visible {
    @apply ring-2 ring-blue-500 ring-offset-2;
  }

  /* Loading animation */
  .loading-dots::after {
    content: '.';
    animation: dots 1.5s steps(4, end) infinite;
  }

  @keyframes dots {
    0%, 20% {
      content: '.';
    }
    40% {
      content: '..';
    }
    60% {
      content: '...';
    }
    80%, 100% {
      content: '';
    }
  }

  /* Voice input animation */
  .voice-wave {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 2px;
  }

  .voice-wave span {
    display: inline-block;
    width: 3px;
    height: 16px;
    background-color: currentColor;
    border-radius: 3px;
    animation: wave 1.2s ease-in-out infinite;
  }

  .voice-wave span:nth-child(2) {
    animation-delay: -1.1s;
  }

  .voice-wave span:nth-child(3) {
    animation-delay: -1.0s;
  }

  .voice-wave span:nth-child(4) {
    animation-delay: -0.9s;
  }

  .voice-wave span:nth-child(5) {
    animation-delay: -0.8s;
  }

  @keyframes wave {
    0%, 40%, 100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }

  /* Message animation */
  .message-appear {
    animation: messageAppear 0.3s ease-out;
  }

  @keyframes messageAppear {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Gradient text */
  .gradient-text {
    @apply bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent;
  }

  /* Glass effect */
  .glass {
    @apply bg-white bg-opacity-70 backdrop-blur-lg;
  }

  /* Line clamp utilities */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .line-clamp-3 {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
}

/* Component styles */
@layer components {
  /* Button variants */
  .btn-primary {
    @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
  }

  .btn-secondary {
    @apply px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
  }

  .btn-ghost {
    @apply px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors;
  }

  /* Card styles */
  .card {
    @apply bg-white rounded-lg border border-gray-200 shadow-sm;
  }

  .card-hover {
    @apply card hover:shadow-md transition-shadow;
  }

  /* Input styles */
  .input {
    @apply w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors;
  }

  /* Badge styles */
  .badge {
    @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
  }

  .badge-blue {
    @apply badge bg-blue-100 text-blue-800;
  }

  .badge-green {
    @apply badge bg-green-100 text-green-800;
  }

  .badge-yellow {
    @apply badge bg-yellow-100 text-yellow-800;
  }

  .badge-red {
    @apply badge bg-red-100 text-red-800;
  }

  .badge-purple {
    @apply badge bg-purple-100 text-purple-800;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    @apply text-black bg-white;
  }
}

/* Dark mode support (future enhancement) */
@media (prefers-color-scheme: dark) {
  /* Dark mode styles can be added here */
}

/* Accessibility improvements */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .btn-primary {
    @apply border-2 border-black;
  }
  
  .card {
    @apply border-2 border-black;
  }
}`;

writeFile('src/index.css', indexCSS);

// Create simple stub files to prevent import errors
const createStub = (name, type = 'component') => {
  if (type === 'component') {
    return `import React from 'react';

export default function ${name}() {
  return <div>Loading ${name}...</div>;
}`;
  } else if (type === 'context') {
    return `import React, { createContext, useContext } from 'react';

const ${name} = createContext();

export function use${name.replace('Context', '')}() {
  const context = useContext(${name});
  return context || {};
}

export function ${name.replace('Context', '')}Provider({ children }) {
  return <${name}.Provider value={{}}>{children}</${name}.Provider>;
}

export default ${name};`;
  } else if (type === 'service') {
    return `// ${name} Service
const ${name} = {
  // Service methods will be implemented
};

export default ${name};`;
  }
};

// Create stub files for all components
const stubs = [
  // Contexts
  { path: 'src/contexts/AppStateContext.js', content: createStub('AppStateContext', 'context') },
  { path: 'src/contexts/SupabaseContext.js', content: createStub('SupabaseContext', 'context') },
  { path: 'src/contexts/VoiceContext.js', content: createStub('VoiceContext', 'context') },
  
  // Services  
  { path: 'src/services/supabase.js', content: createStub('supabase', 'service') + '\nexport const authService = {};\nexport const documentService = {};\nexport const conversationService = {};\nexport const advisorService = {};' },
  { path: 'src/services/deepgram.js', content: createStub('deepgramService', 'service') + '\nexport const advisorVoiceProfiles = {};' },
  { path: 'src/services/documentProcessor.js', content: createStub('documentProcessor', 'service') },
  { path: 'src/services/aiService.js', content: createStub('aiService', 'service') + '\nexport const advisorTemplates = {};' },
  
  // Components
  { path: 'src/components/CoreShell/CoreShell.js', content: createStub('CoreShell') },
  { path: 'src/components/Auth/AuthScreen.js', content: createStub('AuthScreen') },
];

stubs.forEach(stub => writeFile(stub.path, stub.content));

// Create a simple App.js to test
const appJS = `import React from 'react';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          V21 AI Board of Advisors
        </h1>
        <p className="text-gray-600 mb-8">
          Setup complete! Your app is ready to run.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            ✅ Environment variables configured
          </p>
          <p className="text-sm text-gray-500">
            ✅ Tailwind CSS configured
          </p>
          <p className="text-sm text-gray-500">
            ✅ Project structure created
          </p>
        </div>
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Next: Copy the complete component code from Claude's artifacts
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;`;

writeFile('src/App.js', appJS);

console.log('\n✨ Deployment complete!');
console.log('\nNext steps:');
console.log('1. Run: npm start');
console.log('2. Verify the app loads without errors');
console.log('3. I\'ll then provide the complete component code');
console.log('\nThis creates a working skeleton that you can test immediately.');
