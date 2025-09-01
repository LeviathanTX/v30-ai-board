// src/components/MeetingEnvironment/MeetingEnvironmentSelector.js
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Building, Waves, Clock, Play, Pause, Settings,
  Users, Trophy, Target, ChevronDown, ChevronUp, Timer, UserCheck,
  UserX, CheckSquare, Square, ToggleLeft, ToggleRight
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import ContextHelp from '../Help/ContextHelp';

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
  BOARDROOM: {
    id: 'boardroom',
    name: 'Board Room',
    description: 'Professional board meeting environment',
    icon: Building,
    color: 'gray',
    gradient: 'from-gray-700 to-gray-800',
    features: ['Formal atmosphere', 'Structured discussion', 'Meeting minutes']
  },
  SHARKTANK: {
    id: 'sharktank',
    name: 'Shark Tank',
    description: 'High-stakes investor pitch environment',
    icon: Waves,
    color: 'red',
    gradient: 'from-red-600 to-red-700',
    features: ['Timed pitches', 'Investor perspective', 'High pressure environment']
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


  const handleStartEnhancedMeeting = () => {
    const currentAdvisors = environmentAdvisors[currentEnvironment] || [];
    
    if (currentAdvisors.length === 0) {
      // Show notification if no advisors selected
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

    // Set enhanced meeting mode with current settings
    if (dispatch && actions.SET_ENHANCED_MEETING_MODE) {
      dispatch({
        type: actions.SET_ENHANCED_MEETING_MODE,
        payload: meetingSettings
      });
    }

    // Show success notification
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
    
    setIsOpen(false);
  };

  const currentAdvisors = environmentAdvisors[currentEnvironment] || [];
  const allAdvisors = state.advisors || [];
  const hasAllSelected = currentAdvisors.length === allAdvisors.length;

  return (
    <div className="relative">
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

      {/* Environment Options Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Meeting Environment</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
            

            {/* Meeting Controls Panel */}
            <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
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
                  <span>Start Enhanced Meeting</span>
                </button>
              </div>

            {/* Environment Options */}
            <div className="space-y-2">
              {Object.values(MEETING_ENVIRONMENTS).map((env) => {
              const Icon = env.icon;
              const isSelected = env.id === currentEnvironment;
              
              return (
                <button
                  key={env.id}
                  onClick={() => handleEnvironmentSelect(env.id)}
                  className={`
                    w-full text-left p-3 rounded-lg transition-all mb-1
                    ${isSelected 
                      ? `bg-gradient-to-r ${env.gradient} text-white shadow-md` 
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-6 h-6 mt-1 ${isSelected ? 'text-white' : `text-${env.color}-600`}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{env.name}</span>
                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <p className={`text-sm mt-1 ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                        {env.description}
                      </p>
                      
                      <div className="mt-2 space-y-1">
                        {env.features.map((feature, index) => (
                          <div 
                            key={index}
                            className={`text-xs flex items-center space-x-1 ${
                              isSelected ? 'text-white/70' : 'text-gray-500'
                            }`}
                          >
                            <div className={`w-1 h-1 rounded-full ${
                              isSelected ? 'bg-white/50' : 'bg-gray-400'
                            }`} />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
            </div>
          
          {/* Environment Previews */}
          <div className="border-t border-gray-100 p-3 bg-gray-50">
            <div className="text-xs text-gray-600 text-center">
              Select an environment to change your meeting experience
            </div>
          </div>
          </div>
          </div>
        </div>
      )}
    </div>
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