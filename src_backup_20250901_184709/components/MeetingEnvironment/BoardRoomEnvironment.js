// src/components/MeetingEnvironment/BoardRoomEnvironment.js
import React, { useState, useEffect } from 'react';
import { 
  Users, Crown, Star, Briefcase, Clock, FileText, 
  Volume2, Mic, Settings, Eye, EyeOff, Maximize2, Minimize2
} from 'lucide-react';

export default function BoardRoomEnvironment({ 
  advisors = [], 
  selectedAdvisors = [], 
  messages = [],
  onMessageSend,
  children 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      setMeetingDuration(prev => prev + 1);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

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

  const getAdvisorPosition = (index, total) => {
    // Arrange advisors around the board table, keeping bottom positions away from chat
    const positions = [
      { top: '15%', left: '50%', transform: 'translateX(-50%)' }, // Head of table
      { top: '25%', left: '82%', transform: 'translateX(-50%)' },  // Right side
      { top: '45%', left: '88%', transform: 'translateX(-50%)' },  // Right middle
      { top: '65%', left: '82%', transform: 'translateX(-50%)' },  // Right bottom (moved up)
      { top: '75%', left: '50%', transform: 'translateX(-50%)' },  // Foot of table (moved up)
      { top: '65%', left: '18%', transform: 'translateX(-50%)' },  // Left bottom (moved up)
      { top: '45%', left: '12%', transform: 'translateX(-50%)' },  // Left middle
      { top: '25%', left: '18%', transform: 'translateX(-50%)' },  // Left side
    ];
    
    return positions[index % positions.length];
  };

  const getAdvisorIcon = (advisor) => {
    if (advisor.is_host) return Crown;
    if (advisor.is_celebrity) return Star;
    return Briefcase;
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

  return (
    <div className={`relative w-full h-screen bg-gradient-to-b from-slate-800 via-slate-700 to-slate-900 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-[60]' : ''
    }`}>
      {/* Fullscreen Toggle */}
      <button
        onClick={handleFullscreenToggle}
        className="absolute top-4 right-16 z-20 p-2 bg-black/20 text-white rounded-lg hover:bg-black/30 transition-colors"
        title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* Atmosphere Toggle */}
      <button
        onClick={() => setShowAtmosphere(!showAtmosphere)}
        className="absolute top-4 right-4 z-20 p-2 bg-black/20 text-white rounded-lg hover:bg-black/30 transition-colors"
        title="Toggle atmosphere"
      >
        {showAtmosphere ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {/* Board Room Atmosphere */}
      {showAtmosphere && (
        <>
          {/* Lighting Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Main ceiling light */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-yellow-200/20 via-yellow-100/10 to-transparent rounded-full" />
            
            {/* Wall sconces */}
            <div className="absolute top-1/4 left-4 w-24 h-24 bg-gradient-radial from-yellow-200/15 to-transparent rounded-full" />
            <div className="absolute top-1/4 right-4 w-24 h-24 bg-gradient-radial from-yellow-200/15 to-transparent rounded-full" />
          </div>

          {/* Board Table */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Table surface */}
            <div className="w-96 h-64 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 rounded-xl shadow-2xl">
              {/* Table reflection */}
              <div className="w-full h-full bg-gradient-to-br from-white/5 via-transparent to-black/10 rounded-xl" />
              
              {/* Meeting materials */}
              <div className="absolute inset-4 flex items-center justify-center space-x-4">
                <div className="w-8 h-10 bg-white/90 rounded shadow-sm transform rotate-12" />
                <div className="w-8 h-10 bg-white/90 rounded shadow-sm transform -rotate-6" />
                <div className="w-6 h-6 bg-blue-600 rounded-full opacity-80" />
              </div>
            </div>
            
            {/* Table legs */}
            <div className="absolute -bottom-8 left-8 w-4 h-8 bg-amber-900 rounded-b" />
            <div className="absolute -bottom-8 right-8 w-4 h-8 bg-amber-900 rounded-b" />
          </div>

          {/* Advisor Seats */}
          {selectedAdvisors.map((advisor, index) => {
            const position = getAdvisorPosition(index, selectedAdvisors.length);
            const Icon = getAdvisorIcon(advisor);
            const isHost = advisor.is_host;
            const isCelebrity = advisor.is_celebrity;
            
            return (
              <div
                key={advisor.id}
                className="absolute z-10 transition-all duration-500"
                style={position}
              >
                {/* Chair */}
                <div className={`
                  relative w-16 h-20 rounded-lg shadow-lg
                  ${isHost 
                    ? 'bg-gradient-to-b from-yellow-600 to-yellow-700' 
                    : isCelebrity
                    ? 'bg-gradient-to-b from-purple-600 to-purple-700'
                    : 'bg-gradient-to-b from-gray-600 to-gray-700'
                  }
                `}>
                  {/* Chair back */}
                  <div className="absolute -top-2 left-0 right-0 h-6 bg-gradient-to-b from-current to-transparent rounded-t-lg opacity-80" />
                  
                  {/* Advisor Avatar */}
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg
                      ${isHost 
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 ring-2 ring-yellow-300' 
                        : isCelebrity
                        ? 'bg-gradient-to-br from-purple-400 to-purple-500 ring-2 ring-purple-300'
                        : 'bg-gradient-to-br from-gray-400 to-gray-500 ring-2 ring-gray-300'
                      }
                    `}>
                      {advisor.avatar_emoji || '👤'}
                    </div>
                    
                    {/* Status indicators */}
                    <div className="absolute -top-1 -right-1">
                      <Icon className={`w-4 h-4 ${
                        isHost ? 'text-yellow-300' : isCelebrity ? 'text-purple-300' : 'text-gray-300'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Name plate */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-max">
                    <div className="bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                      {advisor.name}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Wall panels and corporate atmosphere */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Wood paneling effect */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/20 to-transparent" />
            
            {/* Ceiling molding */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-600 to-transparent" />
          </div>
        </>
      )}

      {/* Meeting Info Panel */}
      <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm text-white p-4 rounded-lg border border-white/10">
        <div className="flex items-center space-x-4 mb-3">
          <Users className="w-5 h-5" />
          <span className="font-semibold">Board Meeting</span>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-400" />
            <span>{selectedAdvisors.length} Advisors Present</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Meeting Duration: {Math.floor(meetingDuration / 60)}h {meetingDuration % 60}m</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-4xl px-4 z-30">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl border border-white/20 p-4 shadow-2xl">
          {children}
        </div>
      </div>

      {/* Ambient Audio Controls */}
      <div className="absolute bottom-4 right-4 flex items-center space-x-2">
        <button className="p-2 bg-black/40 text-white rounded-lg hover:bg-black/50 transition-colors backdrop-blur-sm">
          <Volume2 className="w-4 h-4" />
        </button>
        <button className="p-2 bg-black/40 text-white rounded-lg hover:bg-black/50 transition-colors backdrop-blur-sm">
          <Mic className="w-4 h-4" />
        </button>
        <button className="p-2 bg-black/40 text-white rounded-lg hover:bg-black/50 transition-colors backdrop-blur-sm">
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Meeting atmosphere hints */}
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-white/60 text-xs max-w-48">
        <div className="bg-black/20 p-3 rounded-lg backdrop-blur-sm border border-white/5">
          <p className="mb-2 font-medium">Board Meeting Protocol:</p>
          <ul className="space-y-1 text-xs">
            <li>• Formal discussion environment</li>
            <li>• Strategic focus expected</li>
            <li>• Meeting minutes recorded</li>
            <li>• Professional decorum</li>
          </ul>
        </div>
      </div>
    </div>
  );
}