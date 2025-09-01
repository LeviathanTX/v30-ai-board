// src/components/MeetingEnvironment/MeetingEnvironmentSelector.js
import React, { useState } from 'react';
import { 
  MessageSquare, Building, Waves, Clock, Play, Pause, Settings,
  Users, Trophy, Target, ChevronDown, ChevronUp, Timer
} from 'lucide-react';

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
  }
};

export default function MeetingEnvironmentSelector({ 
  currentEnvironment = 'chat', 
  onEnvironmentChange,
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const currentEnv = MEETING_ENVIRONMENTS[currentEnvironment.toUpperCase()] || MEETING_ENVIRONMENTS.CHAT;
  const CurrentIcon = currentEnv.icon;

  const handleEnvironmentSelect = (envId) => {
    if (disabled) return;
    
    onEnvironmentChange?.(envId);
    setIsOpen(false);
    setShowDetails(false);
  };

  return (
    <div className="relative">
      {/* Environment Selector Trigger */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all
          ${disabled 
            ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' 
            : `bg-gradient-to-r ${currentEnv.gradient} text-white border-transparent hover:shadow-lg transform hover:-translate-y-0.5`
          }
        `}
      >
        <CurrentIcon className="w-5 h-5" />
        <div className="flex-1 text-left">
          <div className="font-semibold">{currentEnv.name}</div>
          <div className={`text-sm ${disabled ? 'text-gray-400' : 'text-white/80'}`}>
            {currentEnv.description}
          </div>
        </div>
        {!disabled && (
          <div className="flex items-center space-x-2">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        )}
      </button>

      {/* Environment Options Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <h3 className="font-semibold text-gray-800">Meeting Environment</h3>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
              >
                <Settings className="w-4 h-4" />
                <span>{showDetails ? 'Hide' : 'Show'} Details</span>
              </button>
            </div>
            
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
                      
                      {showDetails && (
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
                      )}
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