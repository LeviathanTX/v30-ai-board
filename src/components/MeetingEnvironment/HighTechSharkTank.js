// High-Tech Shark Tank Environment - Professional & Futuristic Design
import React, { useState, useEffect } from 'react';
import { 
  Timer, Play, Pause, RotateCcw, Zap, TrendingUp, Cpu, Brain,
  Monitor, Wifi, Signal, Settings, Target, AlertTriangle, Star,
  Maximize2, Minimize2, Volume2, Mic, Activity, Database
} from 'lucide-react';
import { SharkTankTimer } from './MeetingEnvironmentSelector';
import logger from '../../utils/logger';

export default function HighTechSharkTank({ 
  advisors = [], 
  selectedAdvisors = [], 
  messages = [],
  onMessageSend,
  children 
}) {
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerActive, setTimerActive] = useState(false);
  const [showHologram, setShowHologram] = useState(true);
  const [aiAnalytics, setAiAnalytics] = useState(true);
  const [pitchStarted, setPitchStarted] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(85);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [networkActivity, setNetworkActivity] = useState(0);

  // AI Investor Advisors with tech-themed personalities
  const techInvestors = selectedAdvisors.filter(advisor => 
    advisor.is_celebrity || 
    advisor.specialty_focus === 'entrepreneurship' ||
    advisor.specialty_focus === 'angel_investing' ||
    advisor.specialty_focus === 'venture_capital'
  ).slice(0, 5);

  const getInvestorTechProfile = (advisor) => {
    const profiles = [
      { 
        theme: 'neural-network',
        color: 'from-cyan-400 to-blue-600',
        accent: 'cyan',
        pattern: 'circuit-board',
        aiType: 'Deep Learning Specialist'
      },
      { 
        theme: 'quantum-computing',
        color: 'from-purple-400 to-indigo-600',
        accent: 'purple',
        pattern: 'quantum-grid',
        aiType: 'Quantum Analytics'
      },
      { 
        theme: 'blockchain',
        color: 'from-emerald-400 to-teal-600',
        accent: 'emerald',
        pattern: 'blockchain-links',
        aiType: 'Crypto Investor'
      },
      { 
        theme: 'ai-vision',
        color: 'from-orange-400 to-red-600',
        accent: 'orange',
        pattern: 'neural-web',
        aiType: 'AI Vision Expert'
      },
      { 
        theme: 'data-science',
        color: 'from-pink-400 to-rose-600',
        accent: 'pink',
        pattern: 'data-flow',
        aiType: 'Data Strategist'
      }
    ];
    
    return profiles[Math.abs(advisor.name.charCodeAt(0)) % profiles.length];
  };

  const getInvestorPosition = (index, total) => {
    // Arrange in high-tech curved formation like Teams Together mode
    const positions = [
      { bottom: '25%', left: '12%', transform: 'scale(0.9) rotateY(-15deg)' },
      { bottom: '30%', left: '28%', transform: 'scale(0.95) rotateY(-7deg)' },
      { bottom: '35%', left: '50%', transform: 'translateX(-50%) scale(1)' },
      { bottom: '30%', right: '28%', transform: 'scale(0.95) rotateY(7deg)' },
      { bottom: '25%', right: '12%', transform: 'scale(0.9) rotateY(15deg)' },
    ];
    
    return positions[index % positions.length];
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

  // Simulate network activity and AI processing
  useEffect(() => {
    if (pitchStarted) {
      const interval = setInterval(() => {
        setNetworkActivity(Math.random() * 100);
        setConfidenceLevel(prev => Math.max(60, Math.min(100, prev + (Math.random() - 0.5) * 10)));
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [pitchStarted]);

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
    <div className={`relative w-full h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-[60]' : ''
    }`}>
      {/* Animated Tech Background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        {/* Neural Network Animation */}
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 1000 800">
            <defs>
              <linearGradient id="networkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{stopColor: '#00f5ff', stopOpacity: 0.6}} />
                <stop offset="50%" style={{stopColor: '#0080ff', stopOpacity: 0.4}} />
                <stop offset="100%" style={{stopColor: '#8000ff', stopOpacity: 0.6}} />
              </linearGradient>
            </defs>
            
            {/* Animated Network Nodes */}
            {Array.from({length: 20}).map((_, i) => (
              <circle
                key={i}
                cx={50 + (i % 5) * 200}
                cy={100 + Math.floor(i / 5) * 150}
                r="3"
                fill="url(#networkGradient)"
                className="animate-pulse"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '3s'
                }}
              />
            ))}
            
            {/* Connecting Lines */}
            {Array.from({length: 15}).map((_, i) => (
              <line
                key={`line-${i}`}
                x1={50 + (i % 4) * 200}
                y1={100 + Math.floor(i / 4) * 150}
                x2={250 + (i % 3) * 200}
                y2={250 + Math.floor(i / 3) * 150}
                stroke="url(#networkGradient)"
                strokeWidth="1"
                className="animate-pulse"
                style={{
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '4s'
                }}
              />
            ))}
          </svg>
        </div>

        {/* Floating Data Particles */}
        <div className="absolute inset-0">
          {Array.from({length: 50}).map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Holographic Grid Floor */}
      {showHologram && (
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-500/10 to-transparent">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/5 to-transparent animate-pulse" />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
        </div>
      )}

      {/* Tech Control Panel - Top Right */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
        <button
          onClick={() => setShowHologram(!showHologram)}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-cyan-400 rounded-lg hover:bg-slate-800/80 transition-all border border-cyan-500/30"
          title="Toggle Holographic Display"
        >
          <Monitor className="w-4 h-4" />
        </button>
        <button
          onClick={() => setAiAnalytics(!aiAnalytics)}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-purple-400 rounded-lg hover:bg-slate-800/80 transition-all border border-purple-500/30"
          title="Toggle AI Analytics"
        >
          <Brain className="w-4 h-4" />
        </button>
        <button
          onClick={handleFullscreenToggle}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-800/80 transition-all border border-slate-500/30"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* AI Analytics Dashboard */}
      {aiAnalytics && (
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-cyan-500/30 p-4 text-white min-w-72 z-20">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold">AI Investment Analytics</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>
          
          {/* Real-time Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Confidence Score</div>
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${confidenceLevel}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-cyan-400">{Math.round(confidenceLevel)}%</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Network Activity</div>
              <div className="flex items-center space-x-2">
                <Signal className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-mono text-emerald-400">{Math.round(networkActivity)}%</span>
              </div>
            </div>
          </div>

          {/* Investor Status */}
          <div className="space-y-2">
            <div className="text-xs text-gray-400 mb-2">Investor AI Status</div>
            {techInvestors.slice(0, 3).map((investor, idx) => {
              const profile = getInvestorTechProfile(investor);
              return (
                <div key={investor.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full bg-${profile.accent}-400 animate-pulse`} />
                    <span className="text-gray-300">{investor.name}</span>
                  </div>
                  <span className={`text-${profile.accent}-400 font-mono`}>{profile.aiType}</span>
                </div>
              );
            })}
          </div>

          {/* Timer Integration */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="flex items-center space-x-2 mb-2">
              <Timer className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-semibold">Pitch Timer</span>
            </div>
            
            {!pitchStarted && (
              <div className="flex items-center space-x-2 mb-2">
                <select
                  value={timerMinutes}
                  onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                  className="bg-slate-800 text-white text-xs px-2 py-1 rounded border border-slate-600 flex-1"
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
              onStart={() => {
                setTimerActive(true);
                setPitchStarted(true);
              }}
              onPause={() => setTimerActive(false)}
              onReset={() => {
                setTimerActive(false);
                setPitchStarted(false);
                setConfidenceLevel(85);
              }}
              onTimeUp={() => setConfidenceLevel(60)}
            />
          </div>
        </div>
      )}

      {/* High-Tech Investor Pods */}
      {techInvestors.map((investor, index) => {
        const position = getInvestorPosition(index, techInvestors.length);
        const profile = getInvestorTechProfile(investor);
        
        return (
          <div
            key={investor.id}
            className="absolute z-10 transition-all duration-1000"
            style={position}
          >
            {/* Futuristic Investor Pod */}
            <div className="relative">
              {/* Holographic Base */}
              <div className={`w-40 h-32 bg-gradient-to-t ${profile.color} rounded-t-3xl rounded-b-lg relative overflow-hidden border border-white/20 shadow-2xl`}>
                {/* Tech Pattern Overlay */}
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                  <div className="absolute top-2 left-2 right-2 h-px bg-white/20" />
                  <div className="absolute top-4 left-2 right-2 h-px bg-white/10" />
                  <div className="absolute bottom-4 left-2 right-2 h-px bg-white/20" />
                </div>

                {/* Investor Avatar with Tech Enhancement */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                  <div className={`relative w-16 h-16 bg-gradient-to-br ${profile.color} rounded-full flex items-center justify-center text-2xl shadow-xl border-2 border-white/30`}>
                    {investor.avatar_emoji || '🤖'}
                    
                    {/* AI Status Ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-pulse" />
                    <div className="absolute -inset-1 rounded-full border border-white/20 animate-spin" style={{animationDuration: '3s'}} />
                    
                    {/* Neural Network Effect */}
                    <div className="absolute -inset-2">
                      {Array.from({length: 8}).map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-1 h-1 bg-white/60 rounded-full"
                          style={{
                            top: '50%',
                            left: '50%',
                            transform: `rotate(${i * 45}deg) translateY(-12px)`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tech Specs Display */}
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-white text-xs font-bold text-center">{investor.name}</div>
                    <div className={`text-${profile.accent}-300 text-xs text-center font-mono`}>
                      {profile.aiType}
                    </div>
                    <div className="flex items-center justify-center space-x-1 mt-1">
                      <Cpu className="w-3 h-3 text-white/60" />
                      <Database className="w-3 h-3 text-white/60" />
                      <Wifi className="w-3 h-3 text-white/60" />
                    </div>
                  </div>
                </div>

                {/* Data Stream Effect */}
                <div className="absolute left-0 top-0 bottom-0 w-1">
                  <div className={`h-full bg-gradient-to-t from-transparent via-${profile.accent}-400 to-transparent animate-pulse opacity-60`} />
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1">
                  <div className={`h-full bg-gradient-to-t from-transparent via-${profile.accent}-400 to-transparent animate-pulse opacity-60`} style={{animationDelay: '1s'}} />
                </div>
              </div>
              
              {/* Investment Status Indicator */}
              <div className={`absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-br ${profile.color} rounded-full border-2 border-white/40 flex items-center justify-center`}>
                <Star className="w-3 h-3 text-white" />
              </div>
              
              {/* Neural Activity Lines */}
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-8 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 100 30">
                  <path
                    d={`M0,15 Q25,${5 + Math.random() * 20} 50,15 T100,15`}
                    stroke={`var(--${profile.accent}-400)`}
                    strokeWidth="1"
                    fill="none"
                    className="animate-pulse opacity-60"
                  />
                </svg>
              </div>
            </div>
          </div>
        );
      })}

      {/* Entrepreneur Spotlight Platform */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          {/* Holographic Platform */}
          <div className="w-80 h-6 bg-gradient-to-r from-cyan-500/20 via-blue-500/30 to-purple-500/20 rounded-full shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-full" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
          </div>
          
          {/* Position Indicator */}
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-cyan-500/30">
              <div className="text-cyan-400 text-sm font-semibold flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>Entrepreneur Zone</span>
              </div>
              <div className="text-xs text-gray-400">Present your vision</div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Tech Status Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md rounded-full px-6 py-2 border border-cyan-500/30 z-20">
        <div className="flex items-center space-x-6 text-white">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-medium">LIVE AI INVESTMENT SESSION</span>
          </div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">{techInvestors.length} AI Investors Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm">High-Tech Mode</span>
          </div>
        </div>
      </div>

      {/* Main Chat Interface - Enhanced */}
      <div className="absolute inset-4 z-30 flex flex-col">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-2xl flex-1 flex flex-col">
          {pitchStarted && (
            <div className="text-center py-3 px-6 rounded-xl mb-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
              <div className="text-cyan-400 text-sm font-semibold flex items-center justify-center space-x-2">
                <Activity className="w-4 h-4 animate-pulse" />
                <span>AI Investment Analysis Active</span>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Your pitch is being evaluated in real-time by our AI investment panel
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </div>
      </div>

      {/* Ambient Tech Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2 z-20">
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-cyan-400 rounded-xl hover:bg-slate-800/80 transition-all border border-cyan-500/30 shadow-lg">
          <Volume2 className="w-5 h-5" />
        </button>
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-purple-400 rounded-xl hover:bg-slate-800/80 transition-all border border-purple-500/30 shadow-lg">
          <Mic className="w-5 h-5" />
        </button>
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-emerald-400 rounded-xl hover:bg-slate-800/80 transition-all border border-emerald-500/30 shadow-lg">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}