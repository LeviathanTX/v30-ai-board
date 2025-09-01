#!/usr/bin/env node

// V30 Supabase Connection Verification
// Run with: node verify-supabase.js

require('dotenv').config();

console.log(`
🔍 V30 Supabase Connection Verification
=======================================
`);

// Check environment variables
const checks = [
  { name: 'Supabase URL', value: process.env.REACT_APP_SUPABASE_URL },
  { name: 'Supabase Key', value: process.env.REACT_APP_SUPABASE_ANON_KEY },
  { name: 'Anthropic Key', value: process.env.REACT_APP_ANTHROPIC_API_KEY },
  { name: 'OpenAI Key', value: process.env.REACT_APP_OPENAI_API_KEY },
  { name: 'Cloud Persistence', value: process.env.REACT_APP_ENABLE_CLOUD_PERSISTENCE }
];

console.log('📋 Environment Variables Check:');
console.log('--------------------------------');

let allGood = true;

checks.forEach(check => {
  const status = check.value ? '✅' : '❌';
  const display = check.value ? 
    (check.name.includes('Key') ? `${check.value.substring(0, 8)}...` : check.value) : 
    'Missing';
  
  console.log(`${status} ${check.name}: ${display}`);
  
  if (!check.value && (check.name.includes('Supabase') || check.name === 'Cloud Persistence')) {
    allGood = false;
  }
});

console.log('\n🔗 Supabase URL Validation:');
console.log('----------------------------');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
if (supabaseUrl) {
  if (supabaseUrl.includes('supabase.co') && supabaseUrl.startsWith('https://')) {
    console.log('✅ URL format looks correct');
  } else {
    console.log('❌ URL format incorrect - should be https://xxxxx.supabase.co');
    allGood = false;
  }
} else {
  console.log('❌ Supabase URL missing');
  allGood = false;
}

console.log('\n🔑 API Key Validation:');
console.log('----------------------');

const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (supabaseKey) {
  if (supabaseKey.length > 100) {
    console.log('✅ Supabase key length looks correct');
  } else {
    console.log('❌ Supabase key seems too short');
    allGood = false;
  }
} else {
  console.log('❌ Supabase key missing');
  allGood = false;
}

// Test connection if we have credentials
if (supabaseUrl && supabaseKey) {
  console.log('\n🌐 Testing Supabase Connection:');
  console.log('--------------------------------');
  
  fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'GET',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  })
  .then(response => {
    if (response.status === 200) {
      console.log('✅ Supabase connection successful!');
      console.log('✅ Database is reachable');
    } else {
      console.log(`❌ Supabase connection failed (Status: ${response.status})`);
      allGood = false;
    }
  })
  .catch(error => {
    console.log(`❌ Connection error: ${error.message}`);
    allGood = false;
  })
  .finally(() => {
    printSummary();
  });
} else {
  printSummary();
}

function printSummary() {
  console.log('\n' + '='.repeat(50));
  
  if (allGood) {
    console.log(`
🎉 SETUP COMPLETE!
==================

✅ All required environment variables are set
✅ Supabase configuration looks good
✅ Ready to start development

NEXT STEPS:
1. Run: npm start
2. Test signup/login at http://localhost:3000
3. Upload a document and test AI chat
4. Deploy to Vercel when ready
`);
  } else {
    console.log(`
⚠️  SETUP INCOMPLETE
====================

❌ Some environment variables are missing or incorrect

TO FIX:
1. Run: node setup-supabase.js
2. Or manually edit your .env file
3. Make sure you've created a Supabase project
4. Run this verification script again

REQUIRED:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_ANON_KEY  
- REACT_APP_ENABLE_CLOUD_PERSISTENCE=true
`);
  }
}