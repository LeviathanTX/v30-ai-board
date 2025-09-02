// src/contexts/AIServiceContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabase } from './SupabaseContext';
import { AI_SERVICES, DEFAULT_SERVICE, validateApiKey } from '../config/aiServices';
import logger from '../utils/logger';

const AIServiceContext = createContext();

// Secure storage key for local development
const STORAGE_KEY = 'ai_service_configs';

// Demo mode Claude API key - provided for demo users
const DEMO_CLAUDE_KEY = process.env.REACT_APP_DEMO_CLAUDE_KEY || 'demo-key-placeholder';

export function AIServiceProvider({ children }) {
  const { user, isDemoMode } = useSupabase();
  const [apiConfigs, setApiConfigs] = useState({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});

  // Memoize loadAPIConfigs to prevent recreating on every render
  const loadAPIConfigs = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemoMode) {
        // In demo mode, use localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          setApiConfigs(parsed);
        }
      } else if (user) {
        // In production, load from Supabase user metadata or profile
        // For now, use localStorage until we implement Supabase schema
        const saved = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setApiConfigs(parsed);
        }
      }
    } catch (error) {
      logger.error('Failed to load API configurations:', error);
      setErrors(prev => ({ ...prev, load: 'Failed to load API configurations' }));
    } finally {
      setLoading(false);
    }
  }, [user, isDemoMode]);

  // Load API configurations on mount
  useEffect(() => {
    loadAPIConfigs();
  }, [loadAPIConfigs]);

  const saveAPIConfigs = useCallback(async (configs) => {
    try {
      if (isDemoMode) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      } else if (user) {
        // Save to user-specific localStorage for now
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(configs));
        
        // TODO: Implement Supabase storage
        // await supabase.from('user_ai_configs').upsert({
        //   user_id: user.id,
        //   configs: configs
        // });
      }
      setApiConfigs(configs);
      return { success: true };
    } catch (error) {
      logger.error('Failed to save API configurations:', error);
      return { success: false, error: 'Failed to save configurations' };
    }
  }, [user, isDemoMode]);

  const updateAPIKey = useCallback(async (serviceId, apiKey, model = null) => {
    // Validate API key
    const validation = validateApiKey(serviceId, apiKey);
    if (!validation.valid) {
      setErrors(prev => ({ ...prev, [serviceId]: validation.error }));
      return { success: false, error: validation.error };
    }

    // Clear any previous errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[serviceId];
      return newErrors;
    });

    // Update configuration
    const newConfigs = {
      ...apiConfigs,
      [serviceId]: {
        apiKey: apiKey,
        model: model || AI_SERVICES[serviceId]?.models?.[0]?.id,
        enabled: true,
        lastUpdated: new Date().toISOString()
      }
    };

    return await saveAPIConfigs(newConfigs);
  }, [apiConfigs, saveAPIConfigs]);

  const removeAPIKey = useCallback(async (serviceId) => {
    const newConfigs = { ...apiConfigs };
    delete newConfigs[serviceId];
    
    // Clear errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[serviceId];
      return newErrors;
    });

    return await saveAPIConfigs(newConfigs);
  }, [apiConfigs, saveAPIConfigs]);

  const toggleService = useCallback(async (serviceId, enabled) => {
    if (!apiConfigs[serviceId]) return { success: false, error: 'Service not configured' };

    const newConfigs = {
      ...apiConfigs,
      [serviceId]: {
        ...apiConfigs[serviceId],
        enabled
      }
    };

    return await saveAPIConfigs(newConfigs);
  }, [apiConfigs, saveAPIConfigs]);

  const updateModel = useCallback(async (serviceId, model) => {
    if (!apiConfigs[serviceId]) return { success: false, error: 'Service not configured' };

    const newConfigs = {
      ...apiConfigs,
      [serviceId]: {
        ...apiConfigs[serviceId],
        model
      }
    };

    return await saveAPIConfigs(newConfigs);
  }, [apiConfigs, saveAPIConfigs]);

  const getAvailableServices = useCallback(() => {
    // In demo mode, always provide Claude access
    if (isDemoMode) {
      return [{
        id: 'anthropic',
        ...AI_SERVICES.anthropic,
        apiKey: DEMO_CLAUDE_KEY,
        model: 'claude-3-5-sonnet-20241022',
        enabled: true,
        isDemoService: true
      }];
    }
    
    return Object.keys(apiConfigs)
      .filter(serviceId => apiConfigs[serviceId]?.enabled && apiConfigs[serviceId]?.apiKey)
      .map(serviceId => ({
        id: serviceId,
        ...AI_SERVICES[serviceId],
        ...apiConfigs[serviceId]
      }));
  }, [isDemoMode, apiConfigs]);

  const getServiceConfig = useCallback((serviceId) => {
    // In demo mode, always provide Claude access
    if (isDemoMode && serviceId === 'anthropic') {
      return {
        ...AI_SERVICES.anthropic,
        apiKey: DEMO_CLAUDE_KEY,
        model: 'claude-3-5-sonnet-20241022',
        enabled: true,
        isDemoService: true
      };
    }
    
    if (!apiConfigs[serviceId] || !apiConfigs[serviceId].enabled) {
      return null;
    }
    
    return {
      ...AI_SERVICES[serviceId],
      ...apiConfigs[serviceId]
    };
  }, [isDemoMode, apiConfigs]);

  const hasAnyConfiguredService = useCallback(() => {
    return getAvailableServices().length > 0;
  }, [getAvailableServices]);

  const getDefaultService = useCallback(() => {
    const available = getAvailableServices();
    if (available.length === 0) return null;
    
    // In demo mode, always return Claude
    if (isDemoMode) {
      return available.find(s => s.id === 'anthropic') || available[0];
    }
    
    // Return configured default service if available
    const defaultService = available.find(s => s.id === DEFAULT_SERVICE);
    return defaultService || available[0];
  }, [getAvailableServices, isDemoMode]);

  const reportError = useCallback((serviceId, error) => {
    setErrors(prev => ({
      ...prev,
      [serviceId]: typeof error === 'string' ? error : error.message
    }));
  }, []);

  const clearError = useCallback((serviceId) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[serviceId];
      return newErrors;
    });
  }, []);

  const value = useMemo(() => ({
    // State
    apiConfigs,
    loading,
    errors,
    
    // Actions
    updateAPIKey,
    removeAPIKey,
    toggleService,
    updateModel,
    loadAPIConfigs,
    
    // Getters
    getAvailableServices,
    getServiceConfig,
    hasAnyConfiguredService,
    getDefaultService,
    
    // Error handling
    reportError,
    clearError
  }), [apiConfigs, loading, errors, updateAPIKey, removeAPIKey, toggleService, updateModel, loadAPIConfigs, getAvailableServices, getServiceConfig, hasAnyConfiguredService, getDefaultService, reportError, clearError]);

  return (
    <AIServiceContext.Provider value={value}>
      {children}
    </AIServiceContext.Provider>
  );
}

export const useAIService = () => {
  const context = useContext(AIServiceContext);
  if (!context) {
    throw new Error('useAIService must be used within an AIServiceProvider');
  }
  return context;
};