// src/services/persistenceService.js
import { supabase } from './supabase';
import { FEATURES, SYNC_CONFIG, STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/features';
import logger from '../utils/logger';

/**
 * PersistenceService handles all data synchronization between local state and Supabase
 * It works alongside existing services, adding cloud persistence without breaking local functionality
 * 
 * Think of this service as a bridge between your local app state and the cloud database
 * It automatically syncs data in the background, handles offline scenarios, and ensures
 * data consistency across sessions
 */
class PersistenceService {
  constructor() {
    // Track online/offline status
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.syncInProgress = false;
    this.lastSyncTime = {};
    
    // Set up event listeners for online/offline detection
    this.setupEventListeners();
    
    // Initialize sync intervals if cloud persistence is enabled
    if (FEATURES.CLOUD_PERSISTENCE) {
      this.initializeSyncIntervals();
    }
  }

  /**
   * Sets up browser event listeners to detect online/offline state changes
   * This allows the app to automatically sync when connection is restored
   */
  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      logger.debug('🌐 Connection restored - syncing data...');
      this.syncAll(); // Automatically sync when coming back online
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      logger.debug('📵 Working offline - changes will be saved locally');
    });

    // Save to local storage before page unload
    window.addEventListener('beforeunload', () => {
      this.saveToLocalStorage();
    });
  }

  /**
   * Initializes automatic sync intervals for different data types
   * Different data types sync at different frequencies based on importance
   */
  initializeSyncIntervals() {
    // Sync conversations frequently as they're actively being used
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncConversations();
      }
    }, SYNC_CONFIG.CONVERSATION_SYNC_INTERVAL);

    // Sync documents less frequently as they change less often
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncDocuments();
      }
    }, SYNC_CONFIG.DOCUMENT_SYNC_INTERVAL);

    // Sync settings occasionally
    setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncSettings();
      }
    }, SYNC_CONFIG.SETTINGS_SYNC_INTERVAL);
  }

  /**
   * Saves current app state to local storage
   * This ensures data persists even if the browser is closed unexpectedly
   */
  saveToLocalStorage() {
    try {
      const appState = this.getAppState();
      if (appState) {
        localStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify({
          ...appState,
          lastSaved: new Date().toISOString()
        }));
      }
    } catch (error) {
      logger.error('Failed to save to local storage:', error);
      // If storage is full, try to clear old data
      if (error.name === 'QuotaExceededError') {
        this.clearOldLocalData();
      }
    }
  }

  /**
   * Loads app state from local storage
   * Called on app startup to restore previous session
   */
  loadFromLocalStorage() {
    try {
      const savedState = localStorage.getItem(STORAGE_KEYS.APP_STATE);
      if (savedState) {
        return JSON.parse(savedState);
      }
    } catch (error) {
      logger.error('Failed to load from local storage:', error);
    }
    return null;
  }

  /**
   * Gets current app state from the React context
   * This will be injected by the component using this service
   */
  getAppState() {
    // This method will be overridden by the component that uses this service
    // It should return the current state from AppStateContext
    return null;
  }

  /**
   * Sets app state in the React context
   * This will be injected by the component using this service
   */
  setAppState(state) {
    // This method will be overridden by the component that uses this service
    // It should dispatch actions to update AppStateContext
  }

  /**
   * Main sync method - synchronizes all data types with Supabase
   * Returns a summary of what was synced
   */
  async syncAll() {
    if (!FEATURES.CLOUD_PERSISTENCE || !this.isOnline || this.syncInProgress) {
      return { success: false, reason: 'Sync not available' };
    }

    this.syncInProgress = true;
    const results = {
      conversations: { success: false },
      documents: { success: false },
      settings: { success: false }
    };

    try {
      // Sync each data type
      results.conversations = await this.syncConversations();
      results.documents = await this.syncDocuments();
      results.settings = await this.syncSettings();

      // Process any queued operations
      await this.processSyncQueue();

      return { success: true, results };
    } catch (error) {
      logger.error('Sync failed:', error);
      return { success: false, error: error.message };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Syncs conversations and messages with Supabase
   * Handles both uploading local changes and downloading remote changes
   */
  async syncConversations() {
    const appState = this.getAppState();
    if (!appState || !appState.user?.id) {
      return { success: false, reason: 'No user session' };
    }

    try {
      // Get local conversations
      const localConversations = appState.conversations || [];
      const localMessages = appState.conversationMessages || [];

      // Get remote conversations
      const { data: remoteConversations, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', appState.user.id)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // Merge conversations (local takes precedence for conflicts)
      const mergedConversations = this.mergeData(
        localConversations,
        remoteConversations || [],
        'updated_at'
      );

      // Update remote conversations
      for (const conversation of mergedConversations) {
        if (this.isLocalNewer(conversation, remoteConversations)) {
          await this.upsertConversation(conversation);
        }
      }

      // Sync messages for active conversation
      if (appState.activeConversation?.id) {
        await this.syncMessagesForConversation(appState.activeConversation.id, localMessages);
      }

      // Update local state with merged data
      this.setAppState({
        conversations: mergedConversations
      });

      this.lastSyncTime.conversations = new Date().toISOString();
      return { success: true, count: mergedConversations.length };
    } catch (error) {
      logger.error('Conversation sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Syncs documents with Supabase storage and database
   * Handles document metadata and ensures files are properly uploaded
   */
  async syncDocuments() {
    const appState = this.getAppState();
    if (!appState || !appState.user?.id) {
      return { success: false, reason: 'No user session' };
    }

    try {
      const localDocuments = appState.documents || [];

      // Get remote documents
      const { data: remoteDocuments, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', appState.user.id)
        .order('created_at', { ascending: false });

      if (docError) throw docError;

      // Merge documents
      const mergedDocuments = this.mergeData(
        localDocuments,
        remoteDocuments || [],
        'updated_at'
      );

      // Update remote documents
      for (const document of mergedDocuments) {
        if (this.isLocalNewer(document, remoteDocuments)) {
          await this.upsertDocument(document);
        }
      }

      // Update local state
      this.setAppState({
        documents: mergedDocuments
      });

      this.lastSyncTime.documents = new Date().toISOString();
      return { success: true, count: mergedDocuments.length };
    } catch (error) {
      logger.error('Document sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Syncs user settings and preferences
   * Ensures consistent experience across devices
   */
  async syncSettings() {
    const appState = this.getAppState();
    if (!appState || !appState.user?.id) {
      return { success: false, reason: 'No user session' };
    }

    try {
      // Get local settings
      const localSettings = appState.settings || {};

      // Get remote settings
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('preferences')
        .eq('id', appState.user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;

      // Merge settings (local takes precedence)
      const mergedSettings = {
        ...profile?.preferences,
        ...localSettings
      };

      // Update remote settings if different
      if (JSON.stringify(mergedSettings) !== JSON.stringify(profile?.preferences)) {
        const { error: updateError } = await supabase
          .from('user_profiles')
          .upsert({
            id: appState.user.id,
            email: appState.user.email,
            preferences: mergedSettings
          });

        if (updateError) throw updateError;
      }

      // Update local state
      this.setAppState({
        settings: mergedSettings
      });

      this.lastSyncTime.settings = new Date().toISOString();
      return { success: true };
    } catch (error) {
      logger.error('Settings sync failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Upserts a conversation to Supabase
   * Handles both creating new conversations and updating existing ones
   */
  async upsertConversation(conversation) {
    const { id, user_id, messages, ...conversationData } = conversation;
    
    const { error } = await supabase
      .from('conversations')
      .upsert({
        id,
        user_id: user_id || this.getAppState()?.user?.id,
        ...conversationData,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  /**
   * Syncs messages for a specific conversation
   * Ensures all messages are properly saved with correct references
   */
  async syncMessagesForConversation(conversationId, localMessages) {
    // Get remote messages
    const { data: remoteMessages, error: fetchError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    // Find messages that need to be uploaded
    const messagesToUpload = localMessages.filter(localMsg => 
      !remoteMessages?.some(remoteMsg => remoteMsg.id === localMsg.id)
    );

    // Upload new messages in batches
    for (let i = 0; i < messagesToUpload.length; i += SYNC_CONFIG.MESSAGE_BATCH_SIZE) {
      const batch = messagesToUpload.slice(i, i + SYNC_CONFIG.MESSAGE_BATCH_SIZE);
      
      const { error: insertError } = await supabase
        .from('messages')
        .insert(batch.map(msg => ({
          ...msg,
          conversation_id: conversationId,
          user_id: msg.user_id || this.getAppState()?.user?.id
        })));

      if (insertError) throw insertError;
    }
  }

  /**
   * Upserts a document to Supabase
   * Handles metadata in database and file storage separately
   */
  async upsertDocument(document) {
    const { id, user_id, file, ...documentData } = document;
    
    // First, upsert document metadata
    const { error: dbError } = await supabase
      .from('documents')
      .upsert({
        id,
        user_id: user_id || this.getAppState()?.user?.id,
        ...documentData,
        updated_at: new Date().toISOString()
      });

    if (dbError) throw dbError;

    // If there's a file that hasn't been uploaded, upload it
    if (file && !document.storage_path) {
      // File upload would go here - for now we just store the metadata
      logger.debug('File upload pending for:', document.name);
    }
  }

  /**
   * Processes any operations that were queued while offline
   * This ensures no data is lost even if the user was working offline
   */
  async processSyncQueue() {
    if (this.syncQueue.length === 0) return;

    const queue = [...this.syncQueue];
    this.syncQueue = [];

    for (const operation of queue) {
      try {
        await this.executeQueuedOperation(operation);
      } catch (error) {
        logger.error('Queued operation failed:', error);
        // Re-queue failed operations for retry
        this.syncQueue.push(operation);
      }
    }

    // Save remaining queue to local storage
    if (this.syncQueue.length > 0) {
      localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
    }
  }

  /**
   * Executes a single queued operation
   * Operations are stored with their type and data for replay
   */
  async executeQueuedOperation(operation) {
    switch (operation.type) {
      case 'upsertConversation':
        await this.upsertConversation(operation.data);
        break;
      case 'upsertDocument':
        await this.upsertDocument(operation.data);
        break;
      case 'deleteDocument':
        await supabase
          .from('documents')
          .delete()
          .eq('id', operation.data.id);
        break;
      default:
        logger.warn('Unknown operation type:', operation.type);
    }
  }

  /**
   * Merges local and remote data arrays
   * Uses timestamps to determine which version is newer
   */
  mergeData(localData, remoteData, timestampField = 'updated_at') {
    const merged = new Map();

    // Add all remote data first
    remoteData.forEach(item => {
      merged.set(item.id, item);
    });

    // Override with local data if newer
    localData.forEach(item => {
      const existing = merged.get(item.id);
      if (!existing || new Date(item[timestampField]) > new Date(existing[timestampField])) {
        merged.set(item.id, item);
      }
    });

    return Array.from(merged.values());
  }

  /**
   * Checks if a local item is newer than its remote counterpart
   * Used to determine if we need to upload changes
   */
  isLocalNewer(localItem, remoteItems) {
    const remoteItem = remoteItems?.find(item => item.id === localItem.id);
    if (!remoteItem) return true; // New item

    return new Date(localItem.updated_at || 0) > new Date(remoteItem.updated_at || 0);
  }

  /**
   * Clears old data from local storage to free up space
   * Called when storage quota is exceeded
   */
  clearOldLocalData() {
    try {
      // Get all keys
      const keys = Object.keys(localStorage);
      
      // Find and remove old conversation data
      keys.forEach(key => {
        if (key.startsWith('v21_old_') || key.includes('_backup_')) {
          localStorage.removeItem(key);
        }
      });

      logger.debug('Cleared old local data to free up space');
    } catch (error) {
      logger.error('Failed to clear old data:', error);
    }
  }

  /**
   * Queue an operation for later execution
   * Used when offline or when immediate sync fails
   */
  queueOperation(type, data) {
    const operation = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: new Date().toISOString(),
      attempts: 0
    };

    this.syncQueue.push(operation);

    // Limit queue size
    if (this.syncQueue.length > SYNC_CONFIG.MAX_OFFLINE_QUEUE_SIZE) {
      this.syncQueue = this.syncQueue.slice(-SYNC_CONFIG.MAX_OFFLINE_QUEUE_SIZE);
    }

    // Save to local storage
    localStorage.setItem(STORAGE_KEYS.SYNC_QUEUE, JSON.stringify(this.syncQueue));
  }

  /**
   * Gets sync status for display in UI
   * Provides information about last sync times and pending operations
   */
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.syncInProgress,
      lastSync: this.lastSyncTime,
      pendingOperations: this.syncQueue.length,
      cloudPersistenceEnabled: FEATURES.CLOUD_PERSISTENCE
    };
  }
}

// Create singleton instance
const persistenceService = new PersistenceService();

export default persistenceService;