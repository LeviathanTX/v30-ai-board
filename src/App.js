// V21 App.js with Authentication, Cloud Persistence, and Enhanced UX
import React, { useState, useEffect } from 'react';
import { 
  Brain, FileText, Users, Video, CreditCard, Home,
  ChevronLeft, Settings, User, Menu, X, LogOut, Cloud, CloudOff
} from 'lucide-react';
import { AppStateProvider } from './contexts/AppStateContext';
import { SupabaseProvider, useSupabase } from './contexts/SupabaseContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { AIServiceProvider } from './contexts/AIServiceContext';
import { OnboardingProvider, useOnboarding } from './contexts/OnboardingContext';
import { ToastProvider } from './contexts/ToastContext';
import CoreShell from './components/CoreShell/CoreShell';
import AuthScreen from './components/Auth/AuthScreen';
import OnboardingTour from './components/Onboarding/OnboardingTour';
import { usePersistence } from './hooks/usePersistence';
import { FEATURES } from './config/features';
import logger from './utils/logger';

// Import diagnostics in development
if (process.env.NODE_ENV === 'development') {
  import('./utils/diagnostics').then(module => {
    module.runDiagnostics();
  });
}

// Sync Status Indicator Component
function SyncStatusIndicator() {
  const { getSyncStatus } = usePersistence();
  const [status, setStatus] = useState(getSyncStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getSyncStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, [getSyncStatus]);

  if (!FEATURES.CLOUD_PERSISTENCE) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
        status.isOnline ? 'bg-white' : 'bg-yellow-50'
      } border ${
        status.isOnline ? 'border-gray-200' : 'border-yellow-300'
      }`}>
        {status.isSyncing ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Syncing...</span>
          </>
        ) : status.isOnline ? (
          <>
            <Cloud size={16} className="text-green-600" />
            <span className="text-sm text-gray-600">Synced</span>
          </>
        ) : (
          <>
            <CloudOff size={16} className="text-yellow-600" />
            <span className="text-sm text-gray-600">Offline</span>
          </>
        )}
        {status.pendingOperations > 0 && (
          <span className="text-xs text-gray-500">
            ({status.pendingOperations} pending)
          </span>
        )}
      </div>
    </div>
  );
}

// Enhanced App Content with Onboarding
function AppContent() {
  const { user, loading } = useSupabase();
  const { isOnboardingActive, completeOnboarding, skipOnboarding } = useOnboarding();
  const persistence = usePersistence();
  const [activeModule, setActiveModule] = useState('dashboard');

  // Initialize persistence when user logs in
  useEffect(() => {
    if (user && FEATURES.CLOUD_PERSISTENCE) {
      logger.debug('🔄 Initializing cloud persistence for user:', user.email);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <div className="absolute inset-0 rounded-full h-16 w-16 border-t-4 border-purple-600 animate-spin mx-auto" style={{animationDirection: 'reverse', animationDuration: '3s'}}></div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Initializing your AI advisory board...</p>
          <div className="mt-2 text-sm text-gray-500">Please wait while we prepare everything</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <>
      <CoreShell activeModule={activeModule} setActiveModule={setActiveModule} />
      <SyncStatusIndicator />
      
      {/* Onboarding Tour */}
      {isOnboardingActive && (
        <OnboardingTour
          isActive={isOnboardingActive}
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
          currentModule={activeModule}
          setActiveModule={setActiveModule}
        />
      )}
    </>
  );
}

function App() {
  return (
    <AppStateProvider>
      <SupabaseProvider>
        <OnboardingProvider>
          <ToastProvider position="top-right" maxToasts={5}>
            <AIServiceProvider>
              <VoiceProvider>
                <AppContent />
              </VoiceProvider>
            </AIServiceProvider>
          </ToastProvider>
        </OnboardingProvider>
      </SupabaseProvider>
    </AppStateProvider>
  );
}

export default App;