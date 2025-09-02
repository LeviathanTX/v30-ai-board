// V19-style Core Shell - Clean without cards
import React, { useState, useEffect } from 'react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useVoice } from '../../contexts/VoiceContext';
import SidebarV19 from './SidebarV19';
import HeaderV19 from './HeaderV19';
import ModuleContainer from './ModuleContainer';

// Import modules dynamically
const moduleComponents = {
  dashboard: React.lazy(() => import('../../modules/DashboardModule-CS21-v1/DashboardModule')),
  documents: React.lazy(() => import('../../modules/DocumentHub-CS21-v1/DocumentHub')),
  advisors: React.lazy(() => import('../../modules/AdvisoryHub-CS21-v1/AdvisoryHub')),
  ai: React.lazy(() => import('../../modules/AIHub-CS21-v2/AIHub')),
  meetings: React.lazy(() => import('../../modules/MeetingHub-CS21-v1/MeetingHub')),
  subscription: React.lazy(() => import('../../modules/SubscriptionHub-CS21-v1/SubscriptionHub'))
};

export default function CoreShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('ai');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { state, dispatch } = useAppState();

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
        setSearchQuery(command.target);
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
      {/* Sidebar */}
      <SidebarV19 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <HeaderV19 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Module Content */}
        <main className="flex-1 overflow-hidden">
          <React.Suspense fallback={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading...</p>
              </div>
            </div>
          }>
            <ModuleContainer>
              <ActiveModuleComponent />
            </ModuleContainer>
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}