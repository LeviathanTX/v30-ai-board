// setup-v21.js
// Save this file in your v21-ai-board directory and run: node setup-v21.js

const fs = require('fs');
const path = require('path');

// Create directory if it doesn't exist
function createDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created: ${dirPath}`);
  }
}

// Write file
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${filePath}`);
}

console.log('🚀 Setting up V21 AI Board of Advisors...\n');

// Create all directories
const directories = [
  'src/contexts',
  'src/components/CoreShell',
  'src/components/Auth',
  'src/components/Voice',
  'src/components/Shared',
  'src/services',
  'src/utils',
  'src/modules/DashboardModule-CS21-v1',
  'src/modules/DocumentHub-CS21-v1',
  'src/modules/AdvisoryHub-CS21-v1',
  'src/modules/AIHub-CS21-v1',
  'src/modules/MeetingHub-CS21-v1',
  'src/modules/SubscriptionHub-CS21-v1'
];

directories.forEach(createDir);

// Create postcss.config.js
writeFile('postcss.config.js', `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`);

// Create .env.local template
writeFile('.env.local', `# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Deepgram API Key
REACT_APP_DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Anthropic API Key
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key_here

# WebSocket Server (optional)
REACT_APP_WS_URL=ws://localhost:3001`);

// Create a simple placeholder for each module to prevent import errors
const modulePlaceholder = (name) => `import React from 'react';

export default function ${name}() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">${name}</h2>
        <p className="text-gray-600">Module ready to be implemented</p>
      </div>
    </div>
  );
}`;

// Create placeholder files
writeFile('src/modules/DashboardModule-CS21-v1/DashboardModule.js', modulePlaceholder('DashboardModule'));
writeFile('src/modules/DocumentHub-CS21-v1/DocumentHub.js', modulePlaceholder('DocumentHub'));
writeFile('src/modules/AdvisoryHub-CS21-v1/AdvisoryHub.js', modulePlaceholder('AdvisoryHub'));
writeFile('src/modules/AIHub-CS21-v1/AIHub.js', modulePlaceholder('AIHub'));
writeFile('src/modules/MeetingHub-CS21-v1/MeetingHub.js', modulePlaceholder('MeetingHub'));
writeFile('src/modules/SubscriptionHub-CS21-v1/SubscriptionHub.js', modulePlaceholder('SubscriptionHub'));

// Create ModuleContainer
writeFile('src/components/CoreShell/ModuleContainer.js', `import React from 'react';

export default function ModuleContainer({ children, className = '' }) {
  return (
    <div className={\`h-full overflow-hidden \${className}\`}>
      {children}
    </div>
  );
}`);

console.log('\n✨ Basic setup complete!');
console.log('\nNext steps:');
console.log('1. Update .env.local with your actual API keys');
console.log('2. Copy the full component code from Claude into each file');
console.log('3. Run: npm start');
console.log('\nNote: I created placeholder modules to prevent import errors.');
console.log('You\'ll need to replace them with the actual code from the artifacts above.');