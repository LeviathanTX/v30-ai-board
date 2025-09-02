import React, { useState } from 'react';
import { 
  Home, FileText, Users, MessageSquare, Video, CreditCard,
  ChevronLeft, ChevronRight, Mic, MicOff, Volume2, VolumeX,
  Settings, LogOut, User, Search, Bell, Sparkles, Command,
  BarChart3, Shield, Zap, HelpCircle, Moon, Sun
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useVoice } from '../../contexts/VoiceContext';

export default function Sidebar({ 
  collapsed, 
  setCollapsed, 
  activeModule, 
  setActiveModule,
  showCommandPalette,
  setShowCommandPalette 
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { state, dispatch } = useAppState();
  const { user, signOut } = useSupabase();
  const { isListening, isVoiceEnabled, toggleListening, toggleVoice } = useVoice();
  const isDarkMode = state.settings?.theme === 'dark';

  const modules = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: Home, 
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Overview & Analytics'
    },
    { 
      id: 'documents', 
      name: 'Documents', 
      icon: FileText, 
      color: 'green',
      gradient: 'from-green-500 to-emerald-600',
      description: 'Document Intelligence'
    },
    { 
      id: 'advisors', 
      name: 'Advisors', 
      icon: Users, 
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      description: 'AI Board Members'
    },
    { 
      id: 'ai', 
      name: 'AI Board', 
      icon: MessageSquare, 
      color: 'indigo',
      gradient: 'from-indigo-500 to-indigo-600',
      description: 'Strategic Meetings',
      badge: 'New'
    },
    { 
      id: 'meetings', 
      name: 'Meetings', 
      icon: Video, 
      color: 'pink',
      gradient: 'from-pink-500 to-rose-600',
      description: 'Video Integration'
    },
    { 
      id: 'subscription', 
      name: 'Subscription', 
      icon: CreditCard, 
      color: 'gray',
      gradient: 'from-gray-600 to-gray-700',
      description: 'Billing & Usage'
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  const toggleTheme = () => {
    dispatch({ 
      type: 'UPDATE_SETTINGS', 
      payload: { theme: isDarkMode ? 'light' : 'dark' } 
    });
  };

  return (
    <div className={`
      ${collapsed ? 'w-20' : 'w-64'} 
      ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}
      border-r transition-all duration-300 flex flex-col relative
    `}>
      {/* Logo/Header */}
      <div className={`
        h-16 flex items-center justify-between px-4 
        ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} 
        border-b
      `}>
        {!collapsed && (
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                AI
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h1 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                AI Board
              </h1>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Enterprise Advisory
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`
            p-2 rounded-lg transition-all
            ${isDarkMode 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }
          `}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Quick Actions */}
      {!collapsed && (
        <div className="px-4 py-3">
          <button
            onClick={() => setShowCommandPalette(true)}
            className={`
              w-full flex items-center space-x-2 px-3 py-2 rounded-lg
              ${isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }
              transition-colors group
            `}
          >
            <Command size={16} className="text-gray-500" />
            <span className="text-sm">Quick actions</span>
            <span className="ml-auto text-xs opacity-50">⌘K</span>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`
                w-full flex items-center mb-1 rounded-lg
                transition-all duration-200 group relative
                ${collapsed ? 'justify-center p-3' : 'px-3 py-2.5'}
                ${isActive 
                  ? isDarkMode
                    ? 'bg-gray-800 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-900 shadow-md'
                  : isDarkMode
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }
              `}
              title={collapsed ? module.name : ''}
            >
              {/* Active indicator */}
              {isActive && (
                <div className={`
                  absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 
                  bg-gradient-to-b ${module.gradient} rounded-r-full
                  transition-all duration-300
                `} />
              )}

              <div className={`
                ${collapsed ? '' : 'ml-2'} 
                flex items-center ${collapsed ? '' : 'space-x-3'}
              `}>
                <div className={`
                  p-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? `bg-gradient-to-br ${module.gradient} text-white shadow-lg` 
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-400 group-hover:text-white'
                      : 'bg-gray-100 text-gray-600 group-hover:text-gray-900'
                  }
                `}>
                  <Icon size={18} />
                </div>
                
                {!collapsed && (
                  <div className="flex-1 text-left">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{module.name}</span>
                      {module.badge && (
                        <span className="px-1.5 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
                          {module.badge}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {module.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Hover effect */}
              {!isActive && (
                <div className={`
                  absolute inset-0 rounded-lg bg-gradient-to-r ${module.gradient}
                  opacity-0 group-hover:opacity-10 transition-opacity duration-200
                `} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Voice Controls */}
      <div className={`
        p-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} 
        border-t
      `}>
        <div className={`
          flex items-center ${collapsed ? 'justify-center' : 'justify-between'}
          space-x-2
        `}>
          <button
            onClick={toggleListening}
            className={`
              p-2.5 rounded-lg transition-all duration-200
              ${isListening 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg animate-pulse' 
                : isDarkMode
                  ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
              }
            `}
            title={isListening ? 'Stop listening' : 'Start listening'}
          >
            {isListening ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          
          {!collapsed && (
            <>
              <button
                onClick={toggleVoice}
                className={`
                  p-2.5 rounded-lg transition-all duration-200
                  ${isVoiceEnabled 
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg' 
                    : isDarkMode
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
                title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
              
              <button
                onClick={toggleTheme}
                className={`
                  p-2.5 rounded-lg transition-all duration-200
                  ${isDarkMode
                    ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }
                `}
                title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* User Section */}
      {!collapsed && (
        <div className={`
          p-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} 
          border-t
        `}>
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`
                w-full flex items-center space-x-3 p-2 rounded-lg
                transition-all duration-200
                ${isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-50 text-gray-700'
                }
              `}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">
                  {user?.email || 'Guest User'}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  Free Plan
                </p>
              </div>
            </button>

            {showUserMenu && (
              <div className={`
                absolute bottom-full left-0 right-0 mb-2 
                ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                rounded-lg shadow-xl border py-1 z-50
              `}>
                <button
                  onClick={() => {
                    setActiveModule('subscription');
                    setShowUserMenu(false);
                  }}
                  className={`
                    w-full px-4 py-2 text-left text-sm flex items-center space-x-2
                    ${isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <User size={16} />
                  <span>Account</span>
                </button>
                <button
                  className={`
                    w-full px-4 py-2 text-left text-sm flex items-center space-x-2
                    ${isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <button
                  className={`
                    w-full px-4 py-2 text-left text-sm flex items-center space-x-2
                    ${isDarkMode 
                      ? 'text-gray-300 hover:bg-gray-700' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <HelpCircle size={16} />
                  <span>Help</span>
                </button>
                <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}></div>
                <button
                  onClick={handleSignOut}
                  className={`
                    w-full px-4 py-2 text-left text-sm flex items-center space-x-2
                    text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20
                  `}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}