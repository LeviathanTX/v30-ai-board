import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useVoice } from '../../contexts/VoiceContext';
import UnifiedSidebar from './UnifiedSidebar';
import CommandPalette from './CommandPalette';

// Import modules
const moduleComponents = {
  dashboard: React.lazy(() => import('../../modules/DashboardModule-CS21-v1/DashboardModule')),
  documents: React.lazy(() => import('../../modules/DocumentHub-CS21-v4/DocumentHub')),
  advisors: React.lazy(() => import('../../modules/AdvisoryHub-CS21-v1/EnhancedAdvisoryHub')),
  ai: React.lazy(() => import('../../modules/AIHub-CS21-v2/AIHub')),
  meetings: React.lazy(() => import('../../modules/MeetingHub-CS21-v1/MeetingHub')),
  subscription: React.lazy(() => import('../../modules/SubscriptionHub-CS21-v1/SubscriptionHub'))
};

export default function CoreShell() {
  const [activeModule, setActiveModule] = useState('ai');
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { state, dispatch } = useAppState();
  const { user } = useSupabase();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(!showCommandPalette);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCommandPalette]);

  // Handle module navigation events
  useEffect(() => {
    const handleNavigate = (e) => {
      setActiveModule(e.detail);
    };
    window.addEventListener('navigate-module', handleNavigate);
    return () => window.removeEventListener('navigate-module', handleNavigate);
  }, []);

  // Voice command handler
  useEffect(() => {
    if (state.lastVoiceCommand) {
      handleVoiceCommand(state.lastVoiceCommand);
    }
  }, [state.lastVoiceCommand]);

  const handleVoiceCommand = (command) => {
    switch (command.action) {
      case 'navigate':
        const moduleMap = {
          'dashboard': 'dashboard',
          'documents': 'documents',
          'advisors': 'advisors',
          'board': 'ai',
          'meetings': 'meetings',
          'subscription': 'subscription'
        };
        const targetModule = Object.entries(moduleMap).find(([key]) => 
          command.target.toLowerCase().includes(key)
        );
        if (targetModule) {
          setActiveModule(targetModule[1]);
        }
        break;
      case 'search':
        // Handle search in individual modules
        dispatch({ type: 'SET_SEARCH_QUERY', payload: command.target });
        break;
      case 'startMeeting':
        setActiveModule('ai');
        dispatch({ type: 'START_MEETING' });
        break;
      default:
        dispatch({ type: 'MODULE_VOICE_COMMAND', payload: command });
    }
  };

  const ActiveModuleComponent = moduleComponents[activeModule];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Single Unified Sidebar */}
      <UnifiedSidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        user={user}
      />

      {/* Main Content Area - No top header */}
      <main className="flex-1 overflow-hidden">
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }>
          <ActiveModuleComponent />
        </React.Suspense>
      </main>

      {/* Command Palette */}
      {showCommandPalette && (
        <CommandPalette 
          onClose={() => setShowCommandPalette(false)}
          onNavigate={(module) => {
            setActiveModule(module);
            setShowCommandPalette(false);
          }}
        />
      )}
    </div>
  );
}