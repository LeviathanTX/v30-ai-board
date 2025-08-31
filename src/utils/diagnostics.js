// src/utils/diagnostics.js
// Quick diagnostic tool to check if everything is configured correctly

export const runDiagnostics = () => {
  console.log('🔍 Running V21 AI Board Diagnostics...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('  SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('  SUPABASE_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  console.log('  ANTHROPIC_KEY:', process.env.REACT_APP_ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('  CLOUD_PERSISTENCE:', process.env.REACT_APP_ENABLE_CLOUD_PERSISTENCE ? '✅ Enabled' : '❌ Disabled');
  
  // Check if Supabase is connected
  console.log('\n🔌 Supabase Connection:');
  if (window.supabase) {
    console.log('  Client:', '✅ Initialized');
  } else {
    console.log('  Client:', '❌ Not initialized');
  }
  
  // Check local storage
  console.log('\n💾 Local Storage:');
  const keys = Object.keys(localStorage).filter(k => k.startsWith('v21_'));
  console.log('  V21 Keys Found:', keys.length);
  keys.forEach(key => {
    console.log('  -', key);
  });
  
  // Check current state
  console.log('\n📊 Application State:');
  try {
    const appState = JSON.parse(localStorage.getItem('v21_app_state') || '{}');
    console.log('  Documents:', appState.documents?.length || 0);
    console.log('  Conversations:', appState.conversations?.length || 0);
    console.log('  Advisors:', appState.advisors?.length || 0);
  } catch (e) {
    console.log('  ❌ Could not parse app state');
  }
  
  console.log('\n✅ Diagnostics complete!');
  console.log('💡 To fix issues:');
  console.log('  1. Make sure .env.local has all required keys');
  console.log('  2. Restart the app after changing .env.local');
  console.log('  3. Check browser console for errors');
};

// Auto-run diagnostics in development
if (process.env.NODE_ENV === 'development') {
  window.runDiagnostics = runDiagnostics;
  console.log('💡 Type runDiagnostics() in console to check configuration');
}