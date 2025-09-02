// src/config/features.js
// Feature flags control which features are enabled in the application
// This allows us to safely add new functionality without breaking existing features

export const FEATURES = {
  // Core features that are always enabled
  CORE_SHELL: true,
  AI_CHAT: true,
  DOCUMENT_UPLOAD_UI: true,
  VOICE_INPUT: true,
  
  // Cloud persistence feature flag
  // Set REACT_APP_ENABLE_CLOUD_PERSISTENCE=true in .env.local to enable
  CLOUD_PERSISTENCE: process.env.REACT_APP_ENABLE_CLOUD_PERSISTENCE === 'true',
  
  // Future features (not yet implemented)
  AI_MEMORY: false, // Requires CLOUD_PERSISTENCE to be enabled first
  VIDEO_INTEGRATION: false,
  CUSTOM_ADVISORS: false,
  ADVANCED_ANALYTICS: false,
  
  // Feature dependencies checker
  // Some features require others to be enabled first
  canEnable(feature) {
    switch(feature) {
      case 'AI_MEMORY':
        return this.CLOUD_PERSISTENCE; // Memory requires persistence
      case 'CUSTOM_ADVISORS':
        return this.CLOUD_PERSISTENCE; // Custom advisors need to be saved
      case 'ADVANCED_ANALYTICS':
        return this.CLOUD_PERSISTENCE; // Analytics need historical data
      default:
        return true;
    }
  },
  
  // Helper to check if a feature is enabled and its dependencies are met
  isEnabled(feature) {
    return this[feature] && this.canEnable(feature);
  }
};

// Environment-specific settings
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Supabase configuration
  supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
  supabaseAnonKey: process.env.REACT_APP_SUPABASE_ANON_KEY,
  
  // API Keys
  anthropicApiKey: process.env.REACT_APP_ANTHROPIC_API_KEY,
  deepgramApiKey: process.env.REACT_APP_DEEPGRAM_API_KEY,
  
  // Feature rollout percentages (for gradual rollout)
  rollout: {
    CLOUD_PERSISTENCE: parseInt(process.env.REACT_APP_CLOUD_PERSISTENCE_ROLLOUT || '100'),
    AI_MEMORY: parseInt(process.env.REACT_APP_AI_MEMORY_ROLLOUT || '0'),
  }
};

// Sync settings - how often to sync with cloud
export const SYNC_CONFIG = {
  // Sync intervals in milliseconds
  CONVERSATION_SYNC_INTERVAL: 30000, // 30 seconds
  DOCUMENT_SYNC_INTERVAL: 60000, // 1 minute
  SETTINGS_SYNC_INTERVAL: 300000, // 5 minutes
  
  // Retry configuration
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second base delay (exponential backoff)
  
  // Batch sizes
  MESSAGE_BATCH_SIZE: 10,
  DOCUMENT_BATCH_SIZE: 5,
  
  // Offline queue limits
  MAX_OFFLINE_QUEUE_SIZE: 100,
  MAX_OFFLINE_STORAGE_MB: 50
};

// Local storage keys
export const STORAGE_KEYS = {
  // User session
  AUTH_TOKEN: 'v21_auth_token',
  USER_PROFILE: 'v21_user_profile',
  
  // Application state
  APP_STATE: 'v21_app_state',
  CONVERSATIONS: 'v21_conversations',
  DOCUMENTS: 'v21_documents',
  ADVISORS: 'v21_advisors',
  
  // Sync state
  SYNC_QUEUE: 'v21_sync_queue',
  LAST_SYNC: 'v21_last_sync',
  
  // User preferences
  SETTINGS: 'v21_settings',
  THEME: 'v21_theme',
  
  // Feature states
  FEATURE_FLAGS: 'v21_feature_flags',
  ONBOARDING_COMPLETE: 'v21_onboarding_complete'
};

// API endpoints (relative to Supabase URL)
export const API_ENDPOINTS = {
  // Authentication
  AUTH_SIGNUP: '/auth/v1/signup',
  AUTH_SIGNIN: '/auth/v1/token',
  AUTH_SIGNOUT: '/auth/v1/logout',
  AUTH_USER: '/auth/v1/user',
  
  // Database operations use Supabase client, not direct endpoints
  // These are here for reference of available tables
  TABLES: {
    USER_PROFILES: 'user_profiles',
    ADVISORS: 'advisors',
    CONVERSATIONS: 'conversations',
    MESSAGES: 'messages',
    DOCUMENTS: 'documents'
  }
};

// Error messages for better user experience
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Unable to connect to the server. Your work is saved locally and will sync when connection is restored.',
  AUTH_ERROR: 'Please sign in to continue. Your work has been saved locally.',
  SYNC_ERROR: 'Unable to sync your data. Changes are saved locally and will sync automatically.',
  STORAGE_FULL: 'Local storage is full. Please sync with cloud to free up space.',
  INVALID_FILE: 'This file type is not supported. Please upload PDF, Word, Excel, or image files.',
  FILE_TOO_LARGE: 'File is too large. Maximum file size is 10MB.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  SYNC_COMPLETE: 'All changes synchronized successfully',
  DOCUMENT_UPLOADED: 'Document uploaded and processing started',
  CONVERSATION_SAVED: 'Conversation saved',
  SETTINGS_UPDATED: 'Settings updated successfully',
  OFFLINE_MODE: 'Working offline - changes will sync when connected'
};

export default FEATURES;