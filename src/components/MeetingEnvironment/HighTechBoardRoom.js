// High-Tech Board Room Environment - Microsoft Teams Together Mode Inspired
import React, { useState, useEffect } from 'react';
import { 
  Users, Monitor, Presentation, BarChart3, TrendingUp, Brain,
  Maximize2, Minimize2, Volume2, Mic, Settings, Wifi, Database,
  Globe, Shield, Zap, Activity, Network, Cpu, Eye, Target
} from 'lucide-react';
import logger from '../../utils/logger';

export default function HighTechBoardRoom({ 
  advisors = [], 
  selectedAdvisors = [], 
  messages = [],
  onMessageSend,
  children 
}) {
  const [showHologram, setShowHologram] = useState(true);
  const [analyticsMode, setAnalyticsMode] = useState(true);
  const [immersiveView, setImmersiveView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [meetingMetrics, setMeetingMetrics] = useState({
    engagement: 92,
    dataFlow: 78,
    aiInsights: 85,
    networkOptimal: true
  });

  // Board Members with Executive Tech Profiles
  const boardMembers = selectedAdvisors.slice(0, 8); // Max 8 for optimal Teams Together mode layout

  const getExecutiveTechProfile = (advisor, index) => {
    const profiles = [
      { 
        position: 'Chief AI Officer',
        color: 'from-blue-400 to-cyan-500',
        accent: 'blue',
        specialty: 'Neural Networks',
        icon: Brain
      },
      { 
        position: 'Chief Technology Officer',
        color: 'from-purple-400 to-indigo-500',
        accent: 'purple',
        specialty: 'Quantum Computing',
        icon: Cpu
      },
      { 
        position: 'Chief Data Officer',
        color: 'from-emerald-400 to-teal-500',
        accent: 'emerald',
        specialty: 'Big Data Analytics',
        icon: Database
      },
      { 
        position: 'Chief Innovation Officer',
        color: 'from-orange-400 to-red-500',
        accent: 'orange',
        specialty: 'Emerging Tech',
        icon: Zap
      },
      { 
        position: 'Chief Security Officer',
        color: 'from-red-400 to-pink-500',
        accent: 'red',
        specialty: 'Cybersecurity',
        icon: Shield
      },
      { 
        position: 'Chief Network Officer',
        color: 'from-green-400 to-lime-500',
        accent: 'green',
        specialty: 'Global Networks',
        icon: Globe
      },
      { 
        position: 'Chief Digital Officer',
        color: 'from-yellow-400 to-amber-500',
        accent: 'yellow',
        specialty: 'Digital Transform',
        icon: Monitor
      },
      { 
        position: 'Chief Analytics Officer',
        color: 'from-pink-400 to-rose-500',
        accent: 'pink',
        specialty: 'Predictive Analytics',
        icon: BarChart3
      }
    ];
    
    return profiles[index % profiles.length];
  };

  const getBoardPosition = (index, total) => {
    // Microsoft Teams Together mode curved table arrangement
    const maxSeats = Math.min(total, 8);
    const positions = [];
    
    if (maxSeats <= 4) {
      // Small meeting - face-to-face arrangement
      positions.push(
        { bottom: '35%', left: '15%', transform: 'scale(1) rotateY(-20deg)' },
        { bottom: '35%', right: '15%', transform: 'scale(1) rotateY(20deg)' },
        { bottom: '45%', left: '35%', transform: 'scale(1.1) rotateY(-10deg)' },
        { bottom: '45%', right: '35%', transform: 'scale(1.1) rotateY(10deg)' }
      );
    } else {
      // Large meeting - curved conference table
      const angleStep = 180 / (maxSeats - 1);
      for (let i = 0; i < maxSeats; i++) {
        const angle = -90 + (angleStep * i);
        const radius = 300;
        const x = 50 + Math.cos(angle * Math.PI / 180) * 35;
        const y = 30 + Math.sin(angle * Math.PI / 180) * 20;
        const rotateY = (angle > 0 ? angle - 90 : angle + 90) * 0.3;
        
        positions.push({
          bottom: `${y}%`,
          left: `${x}%`,
          transform: `translateX(-50%) scale(${i === Math.floor(maxSeats/2) ? 1.1 : 0.95}) rotateY(${rotateY}deg)`
        });
      }
    }
    
    return positions[index] || positions[0];
  };

  const handleFullscreenToggle = async () => {
    try {
      if (!isFullscreen) {
        const element = document.documentElement;
        if (element.requestFullscreen) {
          await element.requestFullscreen();
        }
        setIsFullscreen(true);
        window.dispatchEvent(new CustomEvent('closeEnvironmentSidebar'));
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (error) {
      logger.error('Fullscreen toggle error:', error);
      setIsFullscreen(!isFullscreen);
    }
  };

  // Simulate real-time metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setMeetingMetrics(prev => ({
        engagement: Math.max(70, Math.min(100, prev.engagement + (Math.random() - 0.5) * 8)),
        dataFlow: Math.max(60, Math.min(100, prev.dataFlow + (Math.random() - 0.5) * 10)),
        aiInsights: Math.max(75, Math.min(100, prev.aiInsights + (Math.random() - 0.5) * 6)),
        networkOptimal: Math.random() > 0.1
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(document.fullscreenElement);
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className={`relative w-full h-screen bg-gradient-to-br from-slate-950 via-gray-900 to-blue-950 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-[60]' : ''
    }`}>
      {/* Advanced Tech Background */}
      <div className="absolute inset-0 overflow-hidden opacity-15">
        {/* Holographic Grid */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 1200 800">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00f5ff" strokeWidth="0.5" opacity="0.3"/>
              </pattern>
              <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#00f5ff', stopOpacity: 0.8}} />
                <stop offset="50%" style={{stopColor: '#0080ff', stopOpacity: 0.5}} />
                <stop offset="100%" style={{stopColor: '#8000ff', stopOpacity: 0.8}} />
              </linearGradient>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Dynamic Data Flow Lines */}
            {Array.from({length: 12}).map((_, i) => (
              <g key={`flow-${i}`}>
                <circle
                  cx={100 + i * 90}
                  cy={150 + (i % 3) * 200}
                  r="4"
                  fill="url(#techGradient)"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: '3s'
                  }}
                />
                <line
                  x1={100 + i * 90}
                  y1={150 + (i % 3) * 200}
                  x2={180 + i * 90}
                  y2={200 + (i % 3) * 200}
                  stroke="url(#techGradient)"
                  strokeWidth="2"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '4s'
                  }}
                />
              </g>
            ))}
          </svg>
        </div>

        {/* Particle System */}
        <div className="absolute inset-0">
          {Array.from({length: 30}).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full animate-ping opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Holographic Conference Table */}
      {showHologram && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
          <div className="relative">
            {/* Main Table Surface */}
            <div className="w-96 h-48 bg-gradient-to-r from-cyan-500/10 via-blue-500/20 to-purple-500/10 rounded-full shadow-2xl border border-cyan-400/30">
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent rounded-full" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
              
              {/* Holographic Data Streams */}
              <div className="absolute inset-0 overflow-hidden rounded-full">
                {Array.from({length: 6}).map((_, i) => (
                  <div
                    key={`stream-${i}`}
                    className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
                    style={{
                      top: `${20 + i * 15}%`,
                      animation: `pulse 2s ease-in-out infinite`,
                      animationDelay: `${i * 0.3}s`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Conference Table Tech Integration */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-32 h-20 bg-slate-800/60 backdrop-blur-sm rounded-lg border border-cyan-500/30 p-2">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <Monitor className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-white font-semibold">BOARD AI</span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  {Array.from({length: 6}).map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-cyan-400/60 rounded-full animate-pulse"
                      style={{animationDelay: `${i * 0.2}s`}}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Tech Control Panel */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
        <button
          onClick={() => setShowHologram(!showHologram)}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-cyan-400 rounded-lg hover:bg-slate-800/80 transition-all border border-cyan-500/30"
          title="Toggle Holographic Table"
        >
          <Presentation className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAnalyticsMode(!analyticsMode)}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-purple-400 rounded-lg hover:bg-slate-800/80 transition-all border border-purple-500/30"
          title="Toggle AI Analytics"
        >
          <Brain className="w-4 h-4" />
        </button>
        <button
          onClick={() => setImmersiveView(!immersiveView)}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-emerald-400 rounded-lg hover:bg-slate-800/80 transition-all border border-emerald-500/30"
          title="Toggle Immersive View"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={handleFullscreenToggle}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-800/80 transition-all border border-slate-500/30"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Executive AI Dashboard */}
      {analyticsMode && (
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 text-white min-w-80 z-20">
          <div className="flex items-center space-x-2 mb-4">
            <Brain className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold">Executive AI Dashboard</span>
            <div className={`w-2 h-2 rounded-full animate-pulse ${meetingMetrics.networkOptimal ? 'bg-green-400' : 'bg-red-400'}`} />
          </div>
          
          {/* Real-time Executive Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Board Engagement</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-400 to-cyan-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${meetingMetrics.engagement}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-emerald-400">{Math.round(meetingMetrics.engagement)}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Data Flow</div>
              <div className="flex items-center space-x-2">
                <Network className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-mono text-purple-400">{Math.round(meetingMetrics.dataFlow)}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">AI Insights</div>
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-orange-400 animate-pulse" />
                <span className="text-sm font-mono text-orange-400">{Math.round(meetingMetrics.aiInsights)}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Network Status</div>
              <div className="flex items-center space-x-2">
                <Wifi className={`w-4 h-4 ${meetingMetrics.networkOptimal ? 'text-green-400' : 'text-red-400'}`} />
                <span className={`text-sm font-mono ${meetingMetrics.networkOptimal ? 'text-green-400' : 'text-red-400'}`}>
                  {meetingMetrics.networkOptimal ? 'OPTIMAL' : 'DEGRADED'}
                </span>
              </div>
            </div>
          </div>

          {/* Board Member Status */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-2">Board Member AI Status</div>
            {boardMembers.slice(0, 4).map((member, idx) => {
              const profile = getExecutiveTechProfile(member, idx);
              const IconComponent = profile.icon;
              return (
                <div key={member.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full bg-${profile.accent}-400 animate-pulse`} />
                    <IconComponent className={`w-3 h-3 text-${profile.accent}-400`} />
                    <span className="text-gray-300">{member.name}</span>
                  </div>
                  <span className={`text-${profile.accent}-400 font-mono text-xs`}>{profile.position}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* High-Tech Board Member Positions */}
      {boardMembers.length > 0 ? boardMembers.map((member, index) => {
        const position = getBoardPosition(index, boardMembers.length);
        const profile = getExecutiveTechProfile(member, index);
        const IconComponent = profile.icon;
        
        return (
          <div
            key={member.id}
            className="absolute z-30 transition-all duration-1000"
            style={position}
          >
            {/* Executive Tech Pod */}
            <div className="relative">
              {/* Holographic Executive Station */}
              <div className={`w-36 h-28 bg-gradient-to-br ${profile.color} rounded-2xl relative overflow-hidden border border-white/30 shadow-2xl`}>
                {/* Tech Interface Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
                <div className="absolute top-2 left-2 right-2 h-px bg-white/30" />
                <div className="absolute bottom-2 left-2 right-2 h-px bg-white/30" />
                
                {/* Executive Avatar */}
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div className={`relative w-12 h-12 bg-gradient-to-br ${profile.color} rounded-full flex items-center justify-center text-lg shadow-xl border-2 border-white/40`}>
                    {member.avatar_emoji || '👔'}
                    
                    {/* Executive Status Ring */}
                    <div className="absolute inset-0 rounded-full border border-white/60 animate-pulse" />
                    <div className="absolute -inset-1 rounded-full border border-white/30 animate-spin" style={{animationDuration: '4s'}} />
                  </div>
                </div>

                {/* Executive Information Display */}
                <div className="absolute bottom-2 left-1 right-1">
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-white text-xs font-bold text-center">{member.name}</div>
                    <div className={`text-${profile.accent}-300 text-xs text-center font-mono`}>
                      {profile.position}
                    </div>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <IconComponent className="w-2 h-2 text-white/80" />
                      <span className="text-xs text-white/60">{profile.specialty}</span>
                    </div>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  <div className={`w-2 h-2 rounded-full bg-${profile.accent}-400 animate-pulse`} />
                  <div className={`w-2 h-2 rounded-full bg-${profile.accent}-300 animate-pulse`} style={{animationDelay: '0.5s'}} />
                </div>

                {/* Data Stream Lines */}
                <div className="absolute left-0 top-1/4 bottom-1/4 w-px">
                  <div className={`h-full bg-gradient-to-t from-transparent via-${profile.accent}-400 to-transparent animate-pulse opacity-60`} />
                </div>
                <div className="absolute right-0 top-1/4 bottom-1/4 w-px">
                  <div className={`h-full bg-gradient-to-t from-transparent via-${profile.accent}-400 to-transparent animate-pulse opacity-60`} style={{animationDelay: '1s'}} />
                </div>
              </div>
              
              {/* Executive Authority Indicator */}
              <div className={`absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br ${profile.color} rounded-full border border-white/50 flex items-center justify-center`}>
                <IconComponent className="w-2 h-2 text-white" />
              </div>
            </div>
          </div>
        );
      }) : (
        // Fallback when no advisors are selected
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20">
          <div className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/30">
            <div className="text-cyan-400 text-lg font-semibold mb-2">No Board Members Selected</div>
            <div className="text-gray-400 text-sm">Select advisors from the right panel to populate your executive board</div>
          </div>
        </div>
      )}

      {/* Executive Status Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md rounded-full px-8 py-3 border border-cyan-500/30 z-20">
        <div className="flex items-center space-x-8 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">EXECUTIVE AI BOARD SESSION</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-sm">{boardMembers.length} C-Suite AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">Strategic Mode</span>
          </div>
        </div>
      </div>

      {/* Main Executive Interface */}
      <div className="absolute inset-4 z-30 flex flex-col">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-2xl flex-1 flex flex-col">
          <div className="text-center py-3 px-6 rounded-xl mb-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
            <div className="text-cyan-400 text-sm font-semibold flex items-center justify-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Executive AI Advisory Session Active</span>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Strategic discussions powered by C-suite AI advisors with real-time insights
            </div>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </div>
      </div>

      {/* Executive Tech Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2 z-20">
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-cyan-400 rounded-xl hover:bg-slate-800/80 transition-all border border-cyan-500/30 shadow-lg">
          <Volume2 className="w-5 h-5" />
        </button>
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-purple-400 rounded-xl hover:bg-slate-800/80 transition-all border border-purple-500/30 shadow-lg">
          <Mic className="w-5 h-5" />
        </button>
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-emerald-400 rounded-xl hover:bg-slate-800/80 transition-all border border-emerald-500/30 shadow-lg">
          <BarChart3 className="w-5 h-5" />
        </button>
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-orange-400 rounded-xl hover:bg-slate-800/80 transition-all border border-orange-500/30 shadow-lg">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}