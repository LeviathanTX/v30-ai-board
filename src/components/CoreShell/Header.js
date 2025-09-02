import React, { useState, useEffect } from 'react';
import { 
  Search, Bell, Command, Sparkles, BarChart3, 
  Shield, Zap, HelpCircle, ChevronDown, X,
  Calendar, Clock, TrendingUp, AlertCircle,
  FileText, MessageSquare, Users, Mic, Volume2, Wifi
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { openaiRealtimeService } from '../../services/openaiRealtime';

export default function Header({ 
  searchQuery, 
  setSearchQuery,
  showNotifications,
  setShowNotifications,
  setShowCommandPalette
}) {
  const { state, dispatch } = useAppState();
  const [showAIInsight, setShowAIInsight] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [voiceConnectionStatus, setVoiceConnectionStatus] = useState({
    openai: false,
    elevenlabs: false,
    azure: false,
    google: false
  });
  const [showVoiceStatus, setShowVoiceStatus] = useState(false);
  const isDarkMode = state.settings?.theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Voice service connection status listeners
    const updateOpenAIStatus = () => {
      setVoiceConnectionStatus(prev => ({
        ...prev,
        openai: openaiRealtimeService.isConnected
      }));
    };

    // Check for other voice service connections based on stored API keys
    const checkVoiceServices = () => {
      const elevenLabsKey = localStorage.getItem('elevenlabs_api_key');
      const azureKey = localStorage.getItem('azure_speech_key');
      const googleKey = localStorage.getItem('google_cloud_key');
      
      setVoiceConnectionStatus(prev => ({
        ...prev,
        elevenlabs: !!elevenLabsKey,
        azure: !!azureKey,
        google: !!googleKey
      }));
    };

    // Set up OpenAI realtime service listeners
    openaiRealtimeService.on('connected', updateOpenAIStatus);
    openaiRealtimeService.on('disconnected', updateOpenAIStatus);
    
    // Initial status check
    updateOpenAIStatus();
    checkVoiceServices();
    
    // Check voice services status periodically
    const voiceTimer = setInterval(checkVoiceServices, 30000);

    return () => {
      clearInterval(voiceTimer);
      openaiRealtimeService.removeListener('connected', updateOpenAIStatus);
      openaiRealtimeService.removeListener('disconnected', updateOpenAIStatus);
    };
  }, []);

  const stats = {
    documentsAnalyzed: state.documents?.length || 0,
    conversationsToday: state.conversations?.filter(c => 
      new Date(c.created_at).toDateString() === new Date().toDateString()
    ).length || 0,
    activeAdvisors: state.selectedAdvisors?.length || 0
  };

  const aiInsight = {
    message: "Your Q4 revenue projections show 23% growth potential based on current market analysis.",
    type: "positive",
    action: "View Analysis"
  };

  const recentNotifications = [
    {
      id: 1,
      type: 'document',
      message: 'Financial Report Q4 2024 has been processed',
      time: '5 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'advisor',
      message: 'Sarah Chen completed strategic analysis',
      time: '1 hour ago',
      unread: true
    },
    {
      id: 3,
      type: 'meeting',
      message: 'Board meeting scheduled for tomorrow at 2 PM',
      time: '2 hours ago',
      unread: false
    }
  ];

  const handleClearNotification = (id) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  return (
    <header className={`
      h-20 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} 
      border-b relative z-40
    `}>
      {/* Main Header */}
      <div className="h-full flex items-center justify-between px-6">
        {/* Left Section - Search */}
        <div className="flex items-center flex-1 max-w-2xl">
          <div className="relative w-full max-w-lg group">
            <Search className={`
              absolute left-4 top-1/2 transform -translate-y-1/2 
              ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}
              group-focus-within:text-blue-500 transition-colors
            `} size={18} />
            <input
              type="text"
              placeholder="Search documents, advisors, or conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`
                w-full pl-11 pr-24 py-3 rounded-xl
                ${isDarkMode 
                  ? 'bg-gray-800 text-white placeholder-gray-500 focus:bg-gray-700' 
                  : 'bg-gray-50 text-gray-900 placeholder-gray-500 focus:bg-white'
                }
                border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                transition-all duration-200
              `}
            />
            <button
              onClick={() => setShowCommandPalette(true)}
              className={`
                absolute right-2 top-1/2 transform -translate-y-1/2
                px-3 py-1.5 rounded-lg text-xs
                ${isDarkMode 
                  ? 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                }
                transition-all duration-200 flex items-center space-x-1
              `}
            >
              <Command size={12} />
              <span>⌘K</span>
            </button>
          </div>
        </div>

        {/* Center Section - Stats */}
        <div className="hidden lg:flex items-center space-x-6 px-8">
          <div className="flex items-center space-x-2">
            <div className={`
              p-2 rounded-lg 
              ${isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-50 text-blue-600'}
            `}>
              <FileText size={16} />
            </div>
            <div>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.documentsAnalyzed}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Documents
              </p>
            </div>
          </div>

          <div className={`w-px h-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>

          <div className="flex items-center space-x-2">
            <div className={`
              p-2 rounded-lg 
              ${isDarkMode ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-50 text-purple-600'}
            `}>
              <MessageSquare size={16} />
            </div>
            <div>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.conversationsToday}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Conversations
              </p>
            </div>
          </div>

          <div className={`w-px h-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>

          <div className="flex items-center space-x-2">
            <div className={`
              p-2 rounded-lg 
              ${isDarkMode ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}
            `}>
              <Users size={16} />
            </div>
            <div>
              <p className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.activeAdvisors}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                Active Advisors
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-3">
          {/* Time Display */}
          <div className={`
            hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg
            ${isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-600'}
          `}>
            <Clock size={14} />
            <span className="text-sm">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Voice Status Indicator */}
          <div className="relative">
            <button
              onClick={() => setShowVoiceStatus(!showVoiceStatus)}
              className={`
                p-2.5 rounded-lg transition-all duration-200 relative
                ${showVoiceStatus
                  ? isDarkMode 
                    ? 'bg-gray-800 text-white' 
                    : 'bg-gray-100 text-gray-900'
                  : isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                    : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                }
              `}
              title="Voice Services Status"
            >
              <Volume2 size={20} />
              {/* Connection indicator dot */}
              {Object.values(voiceConnectionStatus).some(connected => connected) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-green-500 rounded-full"></span>
              )}
            </button>
            
            {/* Voice Status Dropdown */}
            {showVoiceStatus && (
              <div className={`
                absolute top-full right-0 mt-2 w-64
                ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                rounded-xl shadow-xl border z-50
              `}>
                <div className={`
                  p-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
                  border-b
                `}>
                  <h3 className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    Voice Services
                  </h3>
                </div>
                
                <div className="p-2">
                  {[
                    { key: 'openai', name: 'OpenAI Realtime', icon: '🤖' },
                    { key: 'elevenlabs', name: 'ElevenLabs', icon: '🎙️' },
                    { key: 'azure', name: 'Azure Speech', icon: '☁️' },
                    { key: 'google', name: 'Google Cloud TTS', icon: '🔊' }
                  ].map(service => (
                    <div key={service.key} className={`
                      flex items-center justify-between p-2 rounded-lg
                      ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                    `}>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{service.icon}</span>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {service.name}
                        </span>
                      </div>
                      <div className={`
                        w-2 h-2 rounded-full
                        ${voiceConnectionStatus[service.key] ? 'bg-green-500' : 'bg-red-400'}
                      `}></div>
                    </div>
                  ))}
                </div>
                
                <div className={`
                  p-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
                  border-t text-center
                `}>
                  <button className={`
                    text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} 
                    hover:underline
                  `}>
                    Configure Voice Services
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <button className={`
            p-2.5 rounded-lg transition-all duration-200
            ${isDarkMode 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }
          `}>
            <BarChart3 size={20} />
          </button>

          <button className={`
            p-2.5 rounded-lg transition-all duration-200
            ${isDarkMode 
              ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
            }
          `}>
            <Calendar size={20} />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`
              relative p-2.5 rounded-lg transition-all duration-200
              ${showNotifications
                ? isDarkMode 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-900'
                : isDarkMode 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <Bell size={20} />
            {recentNotifications.filter(n => n.unread).length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {/* AI Assist */}
          <button className={`
            px-4 py-2.5 rounded-lg transition-all duration-200 flex items-center space-x-2
            bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg
            transform hover:scale-105
          `}>
            <Sparkles size={16} />
            <span className="text-sm font-medium">AI Assist</span>
          </button>
        </div>
      </div>

      {/* AI Insight Bar */}
      {showAIInsight && (
        <div className={`
          absolute top-full left-0 right-0 
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}
          border-b px-6 py-3 flex items-center justify-between
        `}>
          <div className="flex items-center space-x-3">
            <div className={`
              p-2 rounded-lg
              ${aiInsight.type === 'positive' 
                ? 'bg-green-500/20 text-green-500' 
                : 'bg-yellow-500/20 text-yellow-500'
              }
            `}>
              {aiInsight.type === 'positive' ? <TrendingUp size={16} /> : <AlertCircle size={16} />}
            </div>
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              {aiInsight.message}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button className={`
              px-3 py-1.5 text-sm rounded-lg transition-colors
              ${isDarkMode 
                ? 'text-blue-400 hover:bg-gray-700' 
                : 'text-blue-600 hover:bg-blue-100'
              }
            `}>
              {aiInsight.action}
            </button>
            <button
              onClick={() => setShowAIInsight(false)}
              className={`
                p-1.5 rounded-lg transition-colors
                ${isDarkMode 
                  ? 'hover:bg-gray-700 text-gray-500' 
                  : 'hover:bg-gray-200 text-gray-400'
                }
              `}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <div className={`
          absolute top-full right-6 mt-2 w-96
          ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          rounded-xl shadow-2xl border z-50
        `}>
          <div className={`
            p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
            border-b flex items-center justify-between
          `}>
            <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Notifications
            </h3>
            <button className={`
              text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} 
              hover:underline
            `}>
              Mark all as read
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`
                  p-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} 
                  border-b hover:bg-opacity-50 transition-colors
                  ${notification.unread 
                    ? isDarkMode ? 'bg-gray-700/30' : 'bg-blue-50/30'
                    : ''
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div className={`
                    p-2 rounded-lg mt-0.5
                    ${notification.type === 'document' 
                      ? 'bg-green-500/20 text-green-500'
                      : notification.type === 'advisor'
                      ? 'bg-purple-500/20 text-purple-500'
                      : 'bg-blue-500/20 text-blue-500'
                    }
                  `}>
                    {notification.type === 'document' ? <FileText size={14} /> :
                     notification.type === 'advisor' ? <Users size={14} /> :
                     <Calendar size={14} />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {notification.message}
                    </p>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {notification.time}
                    </p>
                  </div>
                  {notification.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className={`
            p-3 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
            border-t text-center
          `}>
            <button className={`
              text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'} 
              hover:underline
            `}>
              View all notifications
            </button>
          </div>
        </div>
      )}
    </header>
  );
}