// src/components/MeetingEnvironment/MeetingEnvironmentSelector.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Building, Waves, Clock, Play, Pause, Settings,
  Users, Trophy, Target, ChevronDown, ChevronUp, Timer, UserCheck,
  UserX, CheckSquare, Square, ToggleLeft, ToggleRight, X, Zap,
  Brain, Cpu, Network, Monitor
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import ContextHelp from '../Help/ContextHelp';
import './MeetingEnvironmentSelector.css';

const MEETING_ENVIRONMENTS = {
  CHAT: {
    id: 'chat',
    name: 'Standard Chat',
    description: 'Classic conversation interface',
    icon: MessageSquare,
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    features: ['Real-time messaging', 'Document sharing', 'Voice input']
  },
  SHARKTANK: {
    id: 'sharktank',
    name: 'Shark Tank',
    description: 'Pitch to celebrity shark investors with neural network enhancements',
    icon: Waves,
    color: 'red',
    gradient: 'from-red-600 to-red-700',
    features: ['Celebrity shark investors', 'Timed pitches', 'Deal probability tracking', 'Neural network backgrounds']
  },
  BOARDROOM: {
    id: 'boardroom',
    name: 'Executive AI Board',
    description: 'High-tech boardroom with holographic displays and AI analytics',
    icon: Brain,
    color: 'cyan',
    gradient: 'from-cyan-400 to-blue-600',
    features: ['Holographic conference table', 'Real-time AI analytics', 'Executive dashboards', 'Strategic insights']
  },
  TECHPOD: {
    id: 'techpod',
    name: 'AI Investment Pod',
    description: 'Futuristic investor environment with pure neural network visualization',
    icon: Cpu,
    color: 'purple',
    gradient: 'from-purple-500 to-indigo-600',
    features: ['Pure neural networks', 'AI investor analysis', 'Quantum computing visuals', 'Tech-enhanced discussions']
  },
  INVESTMENTPOD: {
    id: 'investment-pod',
    name: 'Sentiment Investment Pod',
    description: 'Advanced real-time sentiment analysis with dynamic audience feedback visualization',
    icon: Target,
    color: 'emerald',
    gradient: 'from-emerald-500 to-teal-600',
    features: ['Real-time sentiment analysis', 'Audience engagement tracking', 'Voice emotion detection', 'Investment likelihood prediction', 'Dynamic color backgrounds', 'Live word clouds']
  },
};

export default function MeetingEnvironmentSelector({ 
  currentEnvironment = 'chat', 
  onEnvironmentChange,
  selectedAdvisors = [],
  onAdvisorsChange,
  disabled = false 
}) {
  const { state, dispatch, actions } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [environmentAdvisors, setEnvironmentAdvisors] = useState({
    chat: [],
    boardroom: [],
    sharktank: []
  });
  const [meetingSettings, setMeetingSettings] = useState({
    rounds: 2,
    enableDebate: true,
    enableConsensusBuilding: true,
    includeGroupAnalysis: true,
    timerMinutes: 5
  });
  
  // Enhanced Meeting mode toggle
  const [enhancedMode, setEnhancedMode] = useState(state.enhancedMeeting?.enabled || false);

  const currentEnv = MEETING_ENVIRONMENTS[currentEnvironment.toUpperCase()] || MEETING_ENVIRONMENTS.CHAT;
  const CurrentIcon = currentEnv.icon;

  // Load saved advisor selections from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('environmentAdvisors');
    if (saved) {
      setEnvironmentAdvisors(JSON.parse(saved));
    } else {
      // Set defaults
      const advisors = state.advisors || [];
      const sharks = advisors.filter(advisor => 
        advisor.is_celebrity || 
        advisor.name.includes('Cuban') || 
        advisor.name.includes('Calacanis') ||
        advisor.specialty_focus === 'entrepreneurship' ||
        advisor.specialty_focus === 'angel_investing'
      ).slice(0, 7);

      setEnvironmentAdvisors({
        chat: advisors.slice(0, 3), // Last used or first 3
        boardroom: advisors.slice(0, 5), // Last used or first 5
        sharktank: sharks // All shark advisors by default
      });
    }
  }, [state.advisors]);

  // Save advisor selections to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('environmentAdvisors', JSON.stringify(environmentAdvisors));
  }, [environmentAdvisors]);

  // Handle click outside to close sidebar and custom close events
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleCloseSidebar = () => {
      setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('closeEnvironmentSidebar', handleCloseSidebar);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('closeEnvironmentSidebar', handleCloseSidebar);
    };
  }, [isOpen]);


  const toggleEnhancedMode = () => {
    const newEnhancedMode = !enhancedMode;
    setEnhancedMode(newEnhancedMode);
    
    // Update app state
    if (dispatch && actions.SET_ENHANCED_MEETING_MODE) {
      dispatch({
        type: actions.SET_ENHANCED_MEETING_MODE,
        payload: {
          enabled: newEnhancedMode,
          ...meetingSettings
        }
      });
    }
    
    // Show notification
    if (dispatch && actions.ADD_NOTIFICATION) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `Enhanced meeting mode ${newEnhancedMode ? 'enabled' : 'disabled'}`,
          type: 'success'
        }
      });
    }
  };
  
  const handleStartEnhancedMeeting = () => {
    const currentAdvisors = environmentAdvisors[currentEnvironment] || [];
    
    if (currentAdvisors.length === 0) {
      if (dispatch && actions.ADD_NOTIFICATION) {
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: {
            message: 'Please select at least one advisor for the meeting',
            type: 'warning'
          }
        });
      }
      return;
    }

    if (dispatch && actions.SET_ENHANCED_MEETING_MODE) {
      dispatch({
        type: actions.SET_ENHANCED_MEETING_MODE,
        payload: {
          enabled: true,
          ...meetingSettings
        }
      });
    }

    if (dispatch && actions.ADD_NOTIFICATION) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `Enhanced ${currentEnvironment} mode activated with ${currentAdvisors.length} advisors`,
          type: 'success'
        }
      });
    }

    setIsOpen(false);
  };

  const getMeetingEstimate = () => {
    const currentAdvisors = environmentAdvisors[currentEnvironment] || [];
    const baseTime = currentAdvisors.length * meetingSettings.rounds;
    const debateTime = meetingSettings.enableDebate ? 4 : 0;
    const consensusTime = meetingSettings.enableConsensusBuilding ? 2 : 0;
    return baseTime + debateTime + consensusTime;
  };

  const handleEnvironmentSelect = (envId) => {
    if (disabled) return;
    
    onEnvironmentChange?.(envId);
    
    // Update selected advisors for the new environment
    const newAdvisors = environmentAdvisors[envId] || [];
    if (onAdvisorsChange) {
      onAdvisorsChange(newAdvisors);
    }
    
    // Don't close dropdown - let user continue configuring
    // setIsOpen(false); // Removed - this was causing the dropdown to close on selection
  };

  const currentAdvisors = environmentAdvisors[currentEnvironment] || [];
  const allAdvisors = state.advisors || [];
  const hasAllSelected = currentAdvisors.length === allAdvisors.length;

  return (
    <>
      {/* Environment Selector Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`px-3 py-1.5 rounded-full flex items-center space-x-2 transition-colors ${
          disabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : isOpen
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <CurrentIcon size={16} />
        <span className="text-sm font-medium">{currentEnv.name}</span>
        {!disabled && (
          isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        )}
      </button>

      {/* Meeting Environment Sidebar */}
      {isOpen && !disabled && (
        <div 
          ref={sidebarRef}
          className="fixed top-0 right-0 h-full w-96 meeting-sidebar-backdrop flex flex-col z-40 shadow-2xl bounce-in"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside from bubbling up
        >
          {/* Header */}
          <div className="p-6 border-b border-gradient-to-r from-blue-100 to-purple-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg float-animation">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold gradient-text-animate">
                    Meeting Environment
                  </h3>
                  <p className="text-sm text-gray-600 font-medium">Choose your perfect advisory setting</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2.5 rounded-xl hover:bg-white/60 hover:scale-110 transition-all duration-200 group shadow-sm glow-on-hover"
              >
                <X size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Content with Custom Scrollbar */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 meeting-environment-scrollbar">
            
            {/* Enhanced Meeting Mode Toggle */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 glow-on-hover">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">Enhanced Mode</h4>
                    <p className="text-sm text-purple-600 font-semibold">AI-Powered Facilitation</p>
                  </div>
                </div>
                <button
                  onClick={toggleEnhancedMode}
                  className={`enhanced-toggle relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                    enhancedMode ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                      enhancedMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {enhancedMode 
                  ? 'Multi-round discussions with debate phases and group synthesis enabled' 
                  : 'Standard single-round conversations with your selected advisors'
                }
              </p>
              
              {enhancedMode && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Rounds:</span>
                      <span className="font-medium text-purple-700">{meetingSettings.rounds}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Debate:</span>
                      <span className="font-medium text-purple-700">{meetingSettings.enableDebate ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Consensus:</span>
                      <span className="font-medium text-purple-700">{meetingSettings.enableConsensusBuilding ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Analysis:</span>
                      <span className="font-medium text-purple-700">{meetingSettings.includeGroupAnalysis ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            

            {/* Enhanced Meeting Configuration (only show when enabled) */}
            {enhancedMode && (
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-800">
                    Enhanced Meeting Configuration
                  </h4>
                </div>
                
                {/* Discussion Rounds */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Discussion Rounds</label>
                  <select
                    value={meetingSettings.rounds}
                    onChange={(e) => setMeetingSettings(prev => ({...prev, rounds: parseInt(e.target.value)}))}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value={1}>1 Round (Quick)</option>
                    <option value={2}>2 Rounds (Balanced)</option>
                    <option value={3}>3 Rounds (Comprehensive)</option>
                  </select>
                </div>

                {/* Timer Setting for Shark Tank */}
                {currentEnvironment === 'sharktank' && (
                  <div className="mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Pitch Timer (minutes)</label>
                    <select
                      value={meetingSettings.timerMinutes}
                      onChange={(e) => setMeetingSettings(prev => ({...prev, timerMinutes: parseInt(e.target.value)}))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                    >
                      {[1, 2, 3, 5, 7, 10, 15, 20].map(min => (
                        <option key={min} value={min}>{min} minute{min > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Advanced Features */}
                <div className="space-y-2 mb-3">
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={meetingSettings.enableDebate}
                      onChange={(e) => setMeetingSettings(prev => ({...prev, enableDebate: e.target.checked}))}
                      className="rounded border-gray-300 mr-2 text-orange-600"
                    />
                    <span className="text-gray-700">Enable Debate Phase</span>
                  </label>
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={meetingSettings.enableConsensusBuilding}
                      onChange={(e) => setMeetingSettings(prev => ({...prev, enableConsensusBuilding: e.target.checked}))}
                      className="rounded border-gray-300 mr-2 text-orange-600"
                    />
                    <span className="text-gray-700">Consensus Building</span>
                  </label>
                  <label className="flex items-center text-xs">
                    <input
                      type="checkbox"
                      checked={meetingSettings.includeGroupAnalysis}
                      onChange={(e) => setMeetingSettings(prev => ({...prev, includeGroupAnalysis: e.target.checked}))}
                      className="rounded border-gray-300 mr-2 text-orange-600"
                    />
                    <span className="text-gray-700">Group Synthesis</span>
                  </label>
                </div>

                {/* Meeting Preview */}
                <div className="bg-white rounded p-2 mb-3 border border-orange-200">
                  <h5 className="text-xs font-medium text-gray-700 mb-1">Meeting Preview</h5>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Est. Duration: {getMeetingEstimate()} minutes</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-3 h-3 mr-1" />
                      <span>Participants: {currentAdvisors.length} advisors</span>
                    </div>
                    <div className="flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      <span>Mode: {meetingSettings.enableDebate && meetingSettings.enableConsensusBuilding ? 'Full Dynamics' : 'Standard'}</span>
                    </div>
                  </div>
                </div>

                {/* Start Enhanced Meeting Button */}
                <button
                  onClick={handleStartEnhancedMeeting}
                  disabled={currentAdvisors.length === 0}
                  className="w-full py-2 px-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded text-xs font-medium hover:from-orange-700 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Apply Enhanced Settings</span>
                </button>
              </div>
            )}

            {/* Environment Options */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Building className="w-3 h-3 text-white" />
                </div>
                <h4 className="text-base font-bold text-gray-800">Select Environment</h4>
              </div>
              
              <div className="grid gap-4">
                {Object.values(MEETING_ENVIRONMENTS).map((env) => {
                  const Icon = env.icon;
                  const isSelected = env.id === currentEnvironment;
                  
                  return (
                    <div
                      key={env.id}
                      className={`environment-card group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer glow-on-hover ${
                        isSelected 
                          ? 'border-blue-400 shadow-xl ring-4 ring-blue-100 selected' 
                          : 'border-gray-200 hover:border-gray-300 shadow-md hover:shadow-xl'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnvironmentSelect(env.id);
                      }}
                    >
                      {/* Background Gradient */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${env.gradient} ${isSelected ? 'opacity-100' : 'opacity-0'} transition-all duration-500 group-hover:opacity-20`} />
                      
                      {/* Content */}
                      <div className="relative p-5">
                        <div className="flex items-start space-x-4">
                          {/* Icon Container */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                            isSelected 
                              ? 'bg-white/20 shadow-lg' 
                              : 'bg-gray-100 group-hover:bg-white group-hover:shadow-md'
                          }`}>
                            <Icon className={`w-6 h-6 transition-colors duration-300 ${
                              isSelected ? 'text-white' : `text-${env.color}-600 group-hover:text-${env.color}-700`
                            }`} />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className={`font-bold text-lg transition-colors duration-300 ${
                                isSelected ? 'text-white' : 'text-gray-800 group-hover:text-gray-900'
                              }`}>
                                {env.name}
                              </h5>
                              {isSelected && (
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                  <span className="text-xs text-white/90 font-medium">Active</span>
                                </div>
                              )}
                            </div>
                            
                            <p className={`text-sm mb-3 transition-colors duration-300 ${
                              isSelected ? 'text-white/90' : 'text-gray-600 group-hover:text-gray-700'
                            }`}>
                              {env.description}
                            </p>
                            
                            {/* Features */}
                            <div className="space-y-1.5">
                              {env.features.map((feature, index) => (
                                <div 
                                  key={index}
                                  className={`flex items-center space-x-2 text-xs transition-colors duration-300 ${
                                    isSelected ? 'text-white/80' : 'text-gray-500 group-hover:text-gray-600'
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                                    isSelected ? 'bg-white/60' : 'bg-gray-400 group-hover:bg-gray-500'
                                  }`} />
                                  <span className="font-medium">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Selection Indicator */}
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                              <div className="w-3 h-3 bg-white rounded-full" />
                            </div>
                          </div>
                        )}
                        
                        {/* Hover Glow Effect */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/0 via-purple-400/0 to-pink-400/0 group-hover:from-blue-400/10 group-hover:via-purple-400/10 group-hover:to-pink-400/10 transition-all duration-500" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="border-t border-gradient-to-r from-gray-100 to-gray-200 p-4 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded flex items-center justify-center">
                <Building className="w-2 h-2 text-white" />
              </div>
              <p className="text-xs text-gray-600 font-medium">
                Choose your perfect advisory environment
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Timer Component for Shark Tank
export function SharkTankTimer({ 
  minutes = 5, 
  isActive = false, 
  onStart, 
  onPause, 
  onReset, 
  onTimeUp 
}) {
  const [timeLeft, setTimeLeft] = useState(minutes * 60);
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    if (isActive && isRunning && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            onTimeUp?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isActive, isRunning, timeLeft, onTimeUp]);

  React.useEffect(() => {
    setTimeLeft(minutes * 60);
  }, [minutes]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsRunning(true);
    onStart?.();
  };

  const handlePause = () => {
    setIsRunning(false);
    onPause?.();
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(minutes * 60);
    onReset?.();
  };

  const progress = timeLeft > 0 ? (timeLeft / (minutes * 60)) * 100 : 0;
  const isUrgent = timeLeft <= 60; // Last minute
  const isCritical = timeLeft <= 30; // Last 30 seconds

  return (
    <div className={`
      flex items-center space-x-4 px-4 py-3 rounded-lg
      ${isCritical 
        ? 'bg-red-100 border-2 border-red-300' 
        : isUrgent 
        ? 'bg-yellow-100 border-2 border-yellow-300'
        : 'bg-gray-100 border-2 border-gray-300'
      }
    `}>
      {/* Timer Display */}
      <div className="flex items-center space-x-2">
        <Timer className={`w-5 h-5 ${
          isCritical ? 'text-red-600' : isUrgent ? 'text-yellow-600' : 'text-gray-600'
        }`} />
        <ContextHelp 
          helpKey="shark-tank-timer" 
          position="top"
          iconSize={14}
        />
        <span className={`font-mono font-bold text-lg ${
          isCritical ? 'text-red-700' : isUrgent ? 'text-yellow-700' : 'text-gray-700'
        }`}>
          {formatTime(timeLeft)}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            isCritical 
              ? 'bg-red-500' 
              : isUrgent 
              ? 'bg-yellow-500' 
              : 'bg-blue-500'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-2">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={timeLeft === 0}
            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Start timer"
          >
            <Play className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
            title="Pause timer"
          >
            <Pause className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={handleReset}
          className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          title="Reset timer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Time's Up Indicator */}
      {timeLeft === 0 && (
        <div className="animate-pulse">
          <span className="text-red-600 font-bold">TIME'S UP!</span>
        </div>
      )}
    </div>
  );
}

export { MEETING_ENVIRONMENTS };