// src/contexts/SupabaseContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/supabase';
import { useAppState } from './AppStateContext';

const SupabaseContext = createContext();

// Demo user for offline mode
const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@aiboardadvisors.com',
  user_metadata: {
    full_name: 'Demo User'
  }
};

export function SupabaseProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  const { dispatch, actions } = useAppState();

  const signIn = React.useCallback(async (userData) => {
    // Handle demo mode
    if (!userData) {
      setIsDemoMode(true);
      setUser(DEMO_USER);
      dispatch({ type: actions.SET_USER, payload: DEMO_USER });
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: { 
          message: 'Running in demo mode. Sign in to save your data.', 
          type: 'info' 
        }
      });
      return { data: DEMO_USER, error: null };
    }

    // Otherwise it's a real sign in handled by AuthScreen
    return { data: userData, error: null };
  }, [dispatch, actions]);

  const checkUser = React.useCallback(async () => {
    try {
      // Check for existing session
      const { data, error } = await authService.getCurrentUser();
      
      if (error || !data) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      setUser(data);
      dispatch({ type: actions.SET_USER, payload: data });
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth check error:', error);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [dispatch, actions]);

  useEffect(() => {
    // Check for existing session
    checkUser();

    // Subscribe to auth changes
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state change:', event);
      }
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsDemoMode(false);
        dispatch({ type: actions.SET_USER, payload: session.user });
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: { message: 'Successfully signed in', type: 'success' }
        });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsDemoMode(false);
        dispatch({ type: actions.RESET_STATE });
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: { message: 'Signed out', type: 'info' }
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch, actions, checkUser]);

  const signOut = async () => {
    if (isDemoMode) {
      setUser(null);
      setIsDemoMode(false);
      dispatch({ type: actions.RESET_STATE });
      return;
    }

    try {
      const { error } = await authService.signOut();
      if (error) throw error;
      
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setError(error.message);
    }
  };

  const updateProfile = async (updates) => {
    if (isDemoMode) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: { 
          message: 'Profile updates are not saved in demo mode', 
          type: 'warning' 
        }
      });
      return { data: null, error: new Error('In demo mode') };
    }

    setError(null);
    try {
      const { data, error } = await authService.updateUser(updates);
      if (error) throw error;
      
      setUser(data.user);
      return { data, error: null };
    } catch (error) {
      setError(error.message);
      return { data: null, error };
    }
  };

  const value = {
    user,
    loading,
    error,
    isDemoMode,
    signIn,
    signOut,
    updateProfile,
    checkUser
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within SupabaseProvider');
  }
  return context;
}