// src/utils/diagnostics.js
// Quick diagnostic tool to check if everything is configured correctly

export const runDiagnostics = () => {
  logger.debug('🔍 Running V21 AI Board Diagnostics...\n');
  
  // Check environment variables
  logger.debug('📋 Environment Variables:');
  logger.debug('  SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  logger.debug('  SUPABASE_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  logger.debug('  ANTHROPIC_KEY:', process.env.REACT_APP_ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing');
  logger.debug('  CLOUD_PERSISTENCE:', process.env.REACT_APP_ENABLE_CLOUD_PERSISTENCE ? '✅ Enabled' : '❌ Disabled');
  
  // Check if Supabase is connected
  logger.debug('\n🔌 Supabase Connection:');
  if (window.supabase) {
    logger.debug('  Client:', '✅ Initialized');
  } else {
    logger.debug('  Client:', '❌ Not initialized');
  }
  
  // Check local storage
  logger.debug('\n💾 Local Storage:');
  const keys = Object.keys(localStorage).filter(k => k.startsWith('v21_'));
  logger.debug('  V21 Keys Found:', keys.length);
  keys.forEach(key => {
    logger.debug('  -', key);
  });
  
  // Check current state
  logger.debug('\n📊 Application State:');
  try {
    const appState = JSON.parse(localStorage.getItem('v21_app_state') || '{}');
    logger.debug('  Documents:', appState.documents?.length || 0);
    logger.debug('  Conversations:', appState.conversations?.length || 0);
    logger.debug('  Advisors:', appState.advisors?.length || 0);
  } catch (e) {
    logger.debug('  ❌ Could not parse app state');
  }
  
  logger.debug('\n✅ Diagnostics complete!');
  logger.debug('💡 To fix issues:');
  logger.debug('  1. Make sure .env.local has all required keys');
  logger.debug('  2. Restart the app after changing .env.local');
  logger.debug('  3. Check browser console for errors');
};

// Auto-run diagnostics in development
if (process.env.NODE_ENV === 'development') {
  window.runDiagnostics = runDiagnostics;
  logger.debug('💡 Type runDiagnostics() in console to check configuration');
}