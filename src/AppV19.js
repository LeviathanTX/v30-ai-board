// V19-style App.js with integrated layout
import React, { useState } from 'react';
import { 
  Brain, FileText, Users, Video, CreditCard, 
  ChevronLeft, Settings, User, Menu 
} from 'lucide-react';
import { AppStateProvider } from './contexts/AppStateContext';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { VoiceProvider } from './contexts/VoiceContext';
import { useSupabase } from './contexts/SupabaseContext';

// Import modules
import AIHub from './modules/AIHub-CS21-v2/AIHub';
import DocumentHub from './modules/DocumentHub-CS21-v1/DocumentHub';
import AdvisoryHub from './modules/AdvisoryHub-CS21-v1/AdvisoryHub';
import DashboardModule from './modules/DashboardModule-CS21-v1/DashboardModule';
import MeetingHub from './modules/MeetingHub-CS21-v1/MeetingHub';
import SubscriptionHub from './modules/SubscriptionHub-CS21-v1/SubscriptionHub';

// Simple Module Container matching V19
const ModuleContainer = ({ children, title }) => {
  return (
    <div className="flex-1 bg-gray-50 overflow-hidden">
      <div className="h-full p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">{title}</h1>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100%-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('ai');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);
  const { user, loading } = useSupabase();

  const modules = [
    { id: 'ai', name: 'AI Boardroom', icon: Brain },
    { id: 'documents', name: 'Document Hub', icon: FileText },
    { id: 'advisors', name: 'Advisory Hub', icon: Users },
    { id: 'meetings', name: 'Virtual Meetings Hub', icon: Video },
    { id: 'subscription', name: 'Subscription', icon: CreditCard }
  ];

  const renderModule = () => {
    switch(activeModule) {
      case 'ai':
        return <ModuleContainer title="AI Boardroom"><AIHub /></ModuleContainer>;
      case 'documents':
        return <DocumentHub />;
      case 'advisors':
        return <ModuleContainer title="Advisory Hub"><AdvisoryHub /></ModuleContainer>;
      case 'meetings':
        return <ModuleContainer title="Virtual Meetings Hub"><MeetingHub /></ModuleContainer>;
      case 'subscription':
        return <ModuleContainer title="Subscription"><SubscriptionHub /></ModuleContainer>;
      case 'dashboard':
        return <ModuleContainer title="Dashboard"><DashboardModule /></ModuleContainer>;
      default:
        return <ModuleContainer title="AI Boardroom"><AIHub /></ModuleContainer>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - V19 style (white, not dark) */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
        {/* Logo and Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                <span className="font-bold text-gray-900">AI Board</span>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <li key={module.id}>
                  <button
                    onClick={() => setActiveModule(module.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeModule === module.id
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span className="font-medium">{module.name}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={() => setShowGlobalSettings(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Settings</span>}
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">AI Board of Advisors</h2>
            
            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <span className="font-medium text-gray-700">
                  {user?.email || 'John Doe'}
                </span>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">Profile</button>
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">Account Settings</button>
                  <hr className="my-1 border-gray-200" />
                  <button className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100">Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Module Content */}
        {renderModule()}
      </div>

      {/* Global Settings Modal */}
      {showGlobalSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">Global Settings</h2>
                <button
                  onClick={() => setShowGlobalSettings(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">General Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Home Module
                      </label>
                      <select className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="ai">AI Boardroom</option>
                        <option value="documents">Document Hub</option>
                        <option value="advisors">Advisory Hub</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowGlobalSettings(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowGlobalSettings(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AppStateProvider>
      <SupabaseProvider>
        <VoiceProvider>
          <AppContent />
        </VoiceProvider>
      </SupabaseProvider>
    </AppStateProvider>
  );
}

export default App;