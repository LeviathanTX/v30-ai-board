// src/contexts/OnboardingContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useSupabase } from './SupabaseContext';

const OnboardingContext = createContext();

export function OnboardingProvider({ children }) {
  const { user, isDemoMode } = useSupabase();
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [isFirstTime, setIsFirstTime] = useState(true);

  // Check onboarding status on mount and user change
  useEffect(() => {
    checkOnboardingStatus();
  }, [user, isDemoMode]);

  const checkOnboardingStatus = useCallback(() => {
    const completed = localStorage.getItem('onboarding_completed') === 'true';
    const disabled = localStorage.getItem('onboarding_disabled') === 'true';
    const skipped = localStorage.getItem('onboarding_skipped') === 'true';
    
    // Check if user has visited before
    const hasVisited = localStorage.getItem('has_visited_app') === 'true';
    setIsFirstTime(!hasVisited);
    
    setHasCompletedOnboarding(completed);
    
    // Show onboarding if:
    // 1. First time user AND
    // 2. Not disabled AND 
    // 3. Not completed AND
    // 4. User is logged in (including demo mode)
    const shouldShow = !hasVisited && !disabled && !completed && (user || isDemoMode);
    setIsOnboardingActive(shouldShow);
    
    // Mark as visited
    if (!hasVisited && (user || isDemoMode)) {
      localStorage.setItem('has_visited_app', 'true');
    }
  }, [user, isDemoMode]);

  const startOnboarding = useCallback(() => {
    setIsOnboardingActive(true);
    setOnboardingStep(0);
  }, []);

  const completeOnboarding = useCallback(() => {
    setIsOnboardingActive(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem('onboarding_completed', 'true');
    localStorage.setItem('onboarding_completed_date', new Date().toISOString());
    
    // Track completion for analytics
    if (window.analytics) {
      window.analytics.track('Onboarding Completed', {
        user_id: user?.id || 'demo',
        completion_date: new Date().toISOString(),
        is_demo_mode: isDemoMode
      });
    }
  }, [user, isDemoMode]);

  const skipOnboarding = useCallback(() => {
    setIsOnboardingActive(false);
    localStorage.setItem('onboarding_skipped', 'true');
    localStorage.setItem('onboarding_skipped_date', new Date().toISOString());
    
    // Track skip for analytics
    if (window.analytics) {
      window.analytics.track('Onboarding Skipped', {
        user_id: user?.id || 'demo',
        skip_date: new Date().toISOString(),
        step_when_skipped: onboardingStep,
        is_demo_mode: isDemoMode
      });
    }
  }, [user, isDemoMode, onboardingStep]);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem('onboarding_completed');
    localStorage.removeItem('onboarding_skipped');
    localStorage.removeItem('onboarding_disabled');
    localStorage.removeItem('onboarding_completed_date');
    localStorage.removeItem('onboarding_skipped_date');
    setHasCompletedOnboarding(false);
    setIsOnboardingActive(false);
  }, []);

  const getOnboardingStats = useCallback(() => {
    return {
      completed: localStorage.getItem('onboarding_completed') === 'true',
      skipped: localStorage.getItem('onboarding_skipped') === 'true',
      disabled: localStorage.getItem('onboarding_disabled') === 'true',
      completedDate: localStorage.getItem('onboarding_completed_date'),
      skippedDate: localStorage.getItem('onboarding_skipped_date'),
      isFirstTime
    };
  }, [isFirstTime]);

  // Show onboarding tip for specific features
  const showFeatureTip = useCallback((feature, message) => {
    const tipKey = `feature_tip_${feature}`;
    const hasSeenTip = localStorage.getItem(tipKey) === 'true';
    
    if (!hasSeenTip && hasCompletedOnboarding) {
      // Show a subtle tooltip or notification
      return {
        shouldShow: true,
        dismiss: () => localStorage.setItem(tipKey, 'true'),
        message
      };
    }
    
    return { shouldShow: false };
  }, [hasCompletedOnboarding]);

  const value = useMemo(() => ({
    // State
    isOnboardingActive,
    hasCompletedOnboarding,
    onboardingStep,
    isFirstTime,
    
    // Actions
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    setOnboardingStep,
    
    // Utilities
    getOnboardingStats,
    showFeatureTip,
    checkOnboardingStatus
  }), [
    isOnboardingActive,
    hasCompletedOnboarding,
    onboardingStep,
    isFirstTime,
    startOnboarding,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    getOnboardingStats,
    showFeatureTip,
    checkOnboardingStatus
  ]);

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export default OnboardingContext;