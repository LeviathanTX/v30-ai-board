// src/hooks/usePersistence.js
import { useEffect, useCallback, useRef } from 'react';
import { useAppState } from '../contexts/AppStateContext';
import { useSupabase } from '../contexts/SupabaseContext';
import persistenceService from '../services/persistenceService';
import { FEATURES } from '../config/features';

/**
 * usePersistence Hook
 * 
 * This hook connects the persistence service to your React app.
 * It automatically syncs your app state with Supabase without requiring
 * any changes to your existing components.
 * 
 * Think of it as adding an automatic backup system to your app - 
 * everything continues to work exactly as before, but now it's also
 * being saved to the cloud.
 */
export function usePersistence() {
  const { state, dispatch, actions } = useAppState();
  const { user, supabase } = useSupabase();
  const lastSyncRef = useRef({});
  const syncTimeoutRef = useRef(null);

  // Connect the persistence service to app state
  useEffect(() => {
    // Inject the state getter into persistence service
    persistenceService.getAppState = () => state;
    
    // Inject the state setter into persistence service
    persistenceService.setAppState = (updates) => {
      Object.entries(updates).forEach(([key, value]) => {
        if (key === 'conversations') {
          dispatch({ type: actions.SET_CONVERSATIONS, payload: value });
        } else if (key === 'documents') {
          dispatch({ type: actions.SET_DOCUMENTS, payload: value });
        } else if (key === 'settings') {
          dispatch({ type: actions.UPDATE_SETTINGS, payload: value });
        }
      });
    };
  }, [state, dispatch, actions]);

  // Load saved state on startup
  useEffect(() => {
    if (FEATURES.CLOUD_PERSISTENCE && user) {
      loadInitialState();
    }
  }, [user]);

  // Auto-save to local storage when state changes
  useEffect(() => {
    if (FEATURES.CLOUD_PERSISTENCE) {
      // Debounce saves to avoid too frequent writes
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      syncTimeoutRef.current = setTimeout(() => {
        persistenceService.saveToLocalStorage();
      }, 1000); // Save 1 second after last change
    }
  }, [state]);

  /**
   * Loads initial state from local storage or cloud
   * Called once when the app starts and user is authenticated
   */
  const loadInitialState = useCallback(async () => {
    try {
      // First, try to load from local storage for instant startup
      const localState = persistenceService.loadFromLocalStorage();
      if (localState) {
        // Restore conversations if they exist
        if (localState.conversations?.length > 0) {
          dispatch({ type: actions.SET_CONVERSATIONS, payload: localState.conversations });
        }
        
        // Restore documents if they exist
        if (localState.documents?.length > 0) {
          dispatch({ type: actions.SET_DOCUMENTS, payload: localState.documents });
        }
        
        // Restore settings
        if (localState.settings) {
          dispatch({ type: actions.UPDATE_SETTINGS, payload: localState.settings });
        }
      }

      // Then sync with cloud to get latest data
      const syncResult = await persistenceService.syncAll();
      if (syncResult.success) {
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: {
            message: 'Data synchronized successfully',
            type: 'success'
          }
        });
      }
    } catch (error) {
      logger.error('Failed to load initial state:', error);
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: 'Unable to sync data. Working offline.',
          type: 'warning'
        }
      });
    }
  }, [dispatch, actions]);

  /**
   * Manually trigger a sync
   * Can be called from components when needed
   */
  const syncNow = useCallback(async () => {
    if (!FEATURES.CLOUD_PERSISTENCE || !user) {
      return { success: false, reason: 'Sync not available' };
    }

    try {
      const result = await persistenceService.syncAll();
      
      if (result.success) {
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: {
            message: 'All changes synchronized',
            type: 'success'
          }
        });
      }
      
      return result;
    } catch (error) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: 'Sync failed. Will retry automatically.',
          type: 'error'
        }
      });
      return { success: false, error: error.message };
    }
  }, [user, dispatch, actions]);

  /**
   * Get current sync status
   * Useful for showing sync indicators in the UI
   */
  const getSyncStatus = useCallback(() => {
    return persistenceService.getSyncStatus();
  }, []);

  /**
   * Queue an operation for later sync
   * Used when making changes while offline
   */
  const queueOperation = useCallback((type, data) => {
    if (FEATURES.CLOUD_PERSISTENCE) {
      persistenceService.queueOperation(type, data);
    }
  }, []);

  // Return functions that components can use
  return {
    syncNow,
    getSyncStatus,
    queueOperation,
    isCloudEnabled: FEATURES.CLOUD_PERSISTENCE && !!user
  };
}

export default usePersistence;