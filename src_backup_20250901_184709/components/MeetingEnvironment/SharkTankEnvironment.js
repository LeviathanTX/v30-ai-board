// src/components/MeetingEnvironment/SharkTankEnvironment.js
import React, { useState, useEffect } from 'react';
import { 
  Timer, Play, Pause, RotateCcw, Waves, DollarSign, TrendingUp,
  Eye, EyeOff, Volume2, Mic, Target, AlertTriangle, Star, Crown,
  Maximize2, Minimize2
} from 'lucide-react';
import { SharkTankTimer } from './MeetingEnvironmentSelector';

export default function SharkTankEnvironment({ 
  advisors = [], 
  selectedAdvisors = [], 
  messages = [],
  onMessageSend,
  children 
}) {
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerActive, setTimerActive] = useState(false);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [stageSpotlight, setStageSpotlight] = useState(true);
  const [pitchStarted, setPitchStarted] = useState(false);
  const [nervousLevel, setNervousLevel] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Filter for investor advisors (celebrities and business leaders)
  const sharks = selectedAdvisors.filter(advisor => 
    advisor.is_celebrity || 
    advisor.name.includes('Cuban') || 
    advisor.name.includes('Calacanis') ||
    advisor.specialty_focus === 'entrepreneurship' ||
    advisor.specialty_focus === 'angel_investing'
  ).slice(0, 5); // Maximum 5 sharks

  const getSharkPosition = (index, total) => {
    // Arrange sharks in a semi-circle facing the entrepreneur, keeping them away from chat area
    const positions = [
      { bottom: '30%', left: '8%' },   // Far left
      { bottom: '35%', left: '22%' },   // Left
      { bottom: '40%', left: '50%', transform: 'translateX(-50%)' }, // Center
      { bottom: '35%', right: '22%' },  // Right
      { bottom: '30%', right: '8%' },  // Far right
    ];
    
    return positions[index % positions.length];
  };

  const getSharkPersonality = (advisor) => {
    // Special styling based on known sharks
    if (advisor.name.includes('Cuban')) {
      return { 
        color: 'from-red-600 to-red-700', 
        accent: 'red', 
        intensity: 'high',
        attitude: 'aggressive'
      };
    }
    if (advisor.name.includes('Calacanis')) {
      return { 
        color: 'from-blue-600 to-blue-700', 
        accent: 'blue', 
        intensity: 'medium',
        attitude: 'educational'
      };
    }
    if (advisor.name.includes('Sandberg')) {
      return { 
        color: 'from-purple-600 to-purple-700', 
        accent: 'purple', 
        intensity: 'medium',
        attitude: 'strategic'
      };
    }
    return { 
      color: 'from-gray-600 to-gray-700', 
      accent: 'gray', 
      intensity: 'low',
      attitude: 'neutral'
    };
  };

  const handleTimerStart = () => {
    setTimerActive(true);
    setPitchStarted(true);
    setNervousLevel(1);
  };

  const handleTimerPause = () => {
    setTimerActive(false);
  };

  const handleTimerReset = () => {
    setTimerActive(false);
    setPitchStarted(false);
    setNervousLevel(0);
  };

  const handleTimeUp = () => {
    setNervousLevel(5);
    // Could trigger a "time's up" message from sharks
  };

  const handleFullscreenToggle = async () => {
    try {
      if (!isFullscreen) {
        // Enter fullscreen
        const element = document.documentElement;
        
        // Try different fullscreen methods for browser compatibility
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
          await element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari
          await element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
          await element.msRequestFullscreen();
        }
        
        setIsFullscreen(true);
        
        // Close any open sidebars when entering fullscreen
        window.dispatchEvent(new CustomEvent('closeEnvironmentSidebar'));
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
          await document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari
          await document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
          await document.msExitFullscreen();
        }
        
        setIsFullscreen(false);
      }
    } catch (error) {
      console.error('Fullscreen toggle error:', error);
      // Fallback to CSS-only fullscreen
      setIsFullscreen(!isFullscreen);
      if (!isFullscreen) {
        window.dispatchEvent(new CustomEvent('closeEnvironmentSidebar'));
      }
    }
  };

  // Increase tension as time runs out
  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        setNervousLevel(prev => Math.min(prev + 0.1, 5));
      }, 10000); // Increase tension every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [timerActive]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement ||
        document.mozFullScreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement);
      
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className={`relative w-full h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-[60]' : ''
    }`}>
      {/* Fullscreen Toggle */}
      <button
        onClick={handleFullscreenToggle}
        className="absolute top-4 right-28 z-20 p-2 bg-black/30 text-white rounded-lg hover:bg-black/40 transition-colors"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* Atmosphere Toggle */}
      <button
        onClick={() => setShowAtmosphere(!showAtmosphere)}
        className="absolute top-4 right-16 z-20 p-2 bg-black/30 text-white rounded-lg hover:bg-black/40 transition-colors"
        title="Toggle atmosphere"
      >
        {showAtmosphere ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {/* Spotlight Toggle */}
      <button
        onClick={() => setStageSpotlight(!stageSpotlight)}
        className="absolute top-4 right-4 z-20 p-2 bg-black/30 text-white rounded-lg hover:bg-black/40 transition-colors"
        title="Toggle spotlight"
      >
        <Target className={`w-4 h-4 ${stageSpotlight ? 'text-yellow-300' : 'text-white'}`} />
      </button>

      {/* Shark Tank Atmosphere */}
      {showAtmosphere && (
        <>
          {/* Stage Lighting */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Main spotlight on entrepreneur position */}
            {stageSpotlight && (
              <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-radial from-yellow-200/30 via-yellow-100/15 to-transparent rounded-full animate-pulse" />
            )}
            
            {/* Dramatic side lighting */}
            <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-blue-600/10 to-transparent" />
            <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-red-600/10 to-transparent" />
            
            {/* Stage floor lighting */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/5 to-transparent" />
          </div>

          {/* Shark Seats/Desks */}
          {sharks.map((shark, index) => {
            const position = getSharkPosition(index, sharks.length);
            const personality = getSharkPersonality(shark);
            const isIntense = nervousLevel > 2 && personality.intensity === 'high';
            
            return (
              <div
                key={shark.id}
                className="absolute z-10 transition-all duration-1000"
                style={position}
              >
                {/* Shark's Desk */}
                <div className={`
                  relative w-32 h-24 rounded-lg shadow-2xl transition-all duration-1000
                  ${isIntense ? 'animate-pulse' : ''}
                  bg-gradient-to-br ${personality.color}
                `}>
                  {/* Desk surface with papers */}
                  <div className="absolute inset-2 bg-black/20 rounded-md flex items-center justify-center">
                    <DollarSign className={`w-6 h-6 text-${personality.accent}-300 opacity-60`} />
                  </div>
                  
                  {/* Shark Avatar */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-xl
                      transition-all duration-500 ring-4
                      ${isIntense 
                        ? `bg-gradient-to-br from-${personality.accent}-400 to-${personality.accent}-600 ring-${personality.accent}-300 animate-bounce` 
                        : `bg-gradient-to-br from-${personality.accent}-500 to-${personality.accent}-600 ring-${personality.accent}-400`
                      }
                    `}>
                      {shark.avatar_emoji || '🦈'}
                    </div>
                    
                    {/* Shark status indicator */}
                    <div className="absolute -top-2 -right-2">
                      {shark.is_celebrity ? 
                        <Star className={`w-5 h-5 text-${personality.accent}-300`} /> :
                        <Crown className={`w-5 h-5 text-${personality.accent}-300`} />
                      }
                    </div>
                    
                    {/* Intensity indicator */}
                    {isIntense && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                        <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  {/* Shark name plate */}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-max">
                    <div className={`
                      text-white text-xs px-3 py-1 rounded backdrop-blur-sm transition-colors
                      ${isIntense ? 'bg-red-600/80' : 'bg-black/60'}
                    `}>
                      <div className="font-bold">{shark.name}</div>
                      <div className={`text-${personality.accent}-300 text-xs opacity-80`}>
                        {personality.attitude.toUpperCase()}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Mood indicator */}
                <div className={`
                  absolute -right-4 top-1/2 transform -translate-y-1/2 w-3 h-8 rounded-full
                  ${personality.intensity === 'high' 
                    ? 'bg-gradient-to-t from-red-500 to-orange-500' 
                    : personality.intensity === 'medium'
                    ? 'bg-gradient-to-t from-yellow-500 to-green-500'
                    : 'bg-gradient-to-t from-green-500 to-blue-500'
                  }
                  opacity-60 transition-opacity duration-1000
                  ${isIntense ? 'opacity-100 animate-pulse' : ''}
                `} />
              </div>
            );
          })}

          {/* Entrepreneur Stage Platform */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
            <div className={`
              w-96 h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded-full shadow-2xl
              ${stageSpotlight ? 'shadow-yellow-500/20' : ''}
            `}>
              {/* Stage edge lighting */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-full" />
            </div>
          </div>

          {/* TV Studio Elements */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 text-white/60">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-mono">LIVE</span>
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
          </div>
        </>
      )}

      {/* Shark Tank Timer */}
      <div className="absolute top-4 left-4 z-20">
        <div className="bg-black/60 backdrop-blur-sm p-4 rounded-xl border border-red-500/20">
          <div className="flex items-center space-x-2 mb-3">
            <Waves className="w-5 h-5 text-red-400" />
            <span className="font-bold text-white">Shark Tank Pitch</span>
          </div>
          
          {/* Timer Selection */}
          {!pitchStarted && (
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-white text-sm">Pitch Time:</span>
              <select
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                className="bg-black/40 text-white text-sm px-2 py-1 rounded border border-white/20"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map(min => (
                  <option key={min} value={min}>{min} min{min > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>
          )}
          
          <SharkTankTimer
            minutes={timerMinutes}
            isActive={timerActive}
            onStart={handleTimerStart}
            onPause={handleTimerPause}
            onReset={handleTimerReset}
            onTimeUp={handleTimeUp}
          />
          
          {/* Tension Meter */}
          <div className="mt-3">
            <div className="flex items-center space-x-2 mb-1">
              <AlertTriangle className={`w-4 h-4 ${nervousLevel > 3 ? 'text-red-400' : 'text-yellow-400'}`} />
              <span className="text-white text-xs">Tension Level</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  nervousLevel > 4 ? 'bg-red-500' : nervousLevel > 2 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(nervousLevel / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Shark Tank Context Panel */}
      <div className="absolute top-4 right-4 left-80 bg-black/40 backdrop-blur-sm text-white p-4 rounded-lg border border-red-500/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Waves className="w-5 h-5 text-red-400" />
            <span className="font-semibold">You're in the Tank!</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span>{sharks.length} Shark{sharks.length !== 1 ? 's' : ''} Ready</span>
          </div>
        </div>
        
        <div className="text-sm space-y-1 text-white/80">
          <p>🎯 <strong>Your Mission:</strong> Convince the sharks to invest in your business</p>
          <p>⏰ <strong>Time Pressure:</strong> Make every second count</p>
          <p>🦈 <strong>The Sharks:</strong> Seasoned investors who've seen it all</p>
          <p>💡 <strong>Pro Tip:</strong> Be confident, know your numbers, and handle objections</p>
        </div>
      </div>

      {/* Main Chat Interface - Entrepreneur View */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-30">
        <div className={`
          backdrop-blur-sm rounded-xl border p-4 transition-all duration-1000 shadow-2xl
          ${nervousLevel > 3 
            ? 'bg-red-900/60 border-red-500/50' 
            : nervousLevel > 1 
            ? 'bg-yellow-900/60 border-yellow-500/50'
            : 'bg-black/60 border-white/20'
          }
        `}>
          {pitchStarted && (
            <div className={`
              text-center py-2 px-4 rounded-lg mb-4 text-sm font-medium
              ${nervousLevel > 4 
                ? 'bg-red-500/20 text-red-300 animate-pulse' 
                : nervousLevel > 2
                ? 'bg-yellow-500/20 text-yellow-300'
                : 'bg-green-500/20 text-green-300'
              }
            `}>
              {nervousLevel > 4 
                ? "🔥 The sharks are circling! Make your case now!" 
                : nervousLevel > 2
                ? "⚡ The pressure is building. Stay confident!"
                : "💪 You've got this! Pitch with confidence!"
              }
            </div>
          )}
          
          {children}
        </div>
      </div>

      {/* Ambient Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        <button className="p-2 bg-black/40 text-white rounded-lg hover:bg-black/50 transition-colors backdrop-blur-sm">
          <Volume2 className="w-4 h-4" />
        </button>
        <button className="p-2 bg-black/40 text-white rounded-lg hover:bg-black/50 transition-colors backdrop-blur-sm">
          <Mic className="w-4 h-4" />
        </button>
      </div>

      {/* Entrepreneur Position Indicator */}
      {stageSpotlight && (
        <div className="absolute bottom-48 left-1/2 transform -translate-x-1/2 text-white/60 text-center">
          <div className="bg-black/20 px-3 py-2 rounded-lg backdrop-blur-sm">
            <div className="text-sm font-medium">🎯 You're on stage</div>
            <div className="text-xs text-white/40">Make your pitch count!</div>
          </div>
        </div>
      )}
    </div>
  );
}