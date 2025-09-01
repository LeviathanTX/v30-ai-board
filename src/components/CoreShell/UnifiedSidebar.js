import React, { useState } from 'react';
import { 
  Home, FileText, Users, MessageSquare, Video, CreditCard,
  Search, Settings, LogOut, ChevronLeft, ChevronRight,
  Mic, MicOff, Volume2, VolumeX, Bell, HelpCircle, Command,
  ChevronDown, ChevronUp, CheckCircle, Plus, X
} from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useVoice } from '../../contexts/VoiceContext';
import { useAppState } from '../../contexts/AppStateContext';
import { useHelp } from '../Help/HelpProvider';
import { HelpTooltip } from '../Help/ContextHelp';

export default function UnifiedSidebar({ activeModule, setActiveModule, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { signOut } = useSupabase();
  const { isListening, isVoiceEnabled, toggleListening, toggleVoice } = useVoice();
  const { state } = useAppState();
  const { openHelp } = useHelp();

  const modules = [
    { id: 'ai', name: 'AI Board', icon: MessageSquare, color: 'blue' },
    { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'purple' },
    { id: 'documents', name: 'Documents', icon: FileText, color: 'green' },
    { id: 'advisors', name: 'Advisors', icon: Users, color: 'yellow' },
    { id: 'meetings', name: 'Meetings', icon: Video, color: 'pink' }
  ];


  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <span className="font-semibold text-gray-800">Board of Advisors</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Search Bar (when expanded) */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1
                transition-all duration-200 group
                ${isActive 
                  ? `bg-${module.color}-50 text-${module.color}-600` 
                  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }
              `}
              title={collapsed ? module.name : ''}
            >
              <Icon size={20} className={`flex-shrink-0 ${isActive ? `text-${module.color}-600` : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium">{module.name}</span>
                  {module.id === 'ai' && state.notifications?.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {state.notifications.length}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200">
        {/* Voice Controls - Speaker Only */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <HelpTooltip content="Toggle voice output settings">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceEnabled 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </HelpTooltip>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        {!collapsed && (
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Command size={12} />
              <span>+K for commands</span>
              <span>•</span>
              <span>? for help</span>
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="p-3 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'Guest'}</p>
              </div>
            )}
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setActiveModule('settings');
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  openHelp();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <HelpCircle size={16} />
                <span>Help & Support</span>
              </button>
              <div className="border-t border-gray-200 mt-1 pt-1">
                <button
                  onClick={signOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}