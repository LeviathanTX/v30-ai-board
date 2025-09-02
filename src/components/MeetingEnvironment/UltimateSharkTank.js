// Ultimate Shark Tank - Enhanced with Neural Networks but keeping the authentic Shark Tank experience
import React, { useState, useEffect } from 'react';
import { 
  Timer, Play, Pause, RotateCcw, Zap, TrendingUp, DollarSign,
  Maximize2, Minimize2, Volume2, Mic, Activity, Target, Eye, EyeOff,
  AlertTriangle, Star, Crown, Waves, Users, Network, Brain, Cpu
} from 'lucide-react';
import { SharkTankTimer } from './MeetingEnvironmentSelector';
import logger from '../../utils/logger';

export default function UltimateSharkTank({ 
  advisors = [], 
  selectedAdvisors = [], 
  messages = [],
  onMessageSend,
  children 
}) {
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerActive, setTimerActive] = useState(false);
  const [showNeuralNetwork, setShowNeuralNetwork] = useState(true);
  const [showSharkTankAtmosphere, setShowSharkTankAtmosphere] = useState(true);
  const [pitchStarted, setPitchStarted] = useState(false);
  const [tensionLevel, setTensionLevel] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dealProbability, setDealProbability] = useState(45);

  // Enhanced Shark Detection - Look for celebrity investors
  const sharks = selectedAdvisors.filter(advisor => 
    advisor.is_celebrity || 
    advisor.name.toLowerCase().includes('cuban') || 
    advisor.name.toLowerCase().includes('calacanis') ||
    advisor.name.toLowerCase().includes('o\'leary') ||
    advisor.name.toLowerCase().includes('herjavec') ||
    advisor.name.toLowerCase().includes('john') ||
    advisor.name.toLowerCase().includes('barbara') ||
    advisor.name.toLowerCase().includes('daymond') ||
    advisor.specialty_focus === 'entrepreneurship' ||
    advisor.specialty_focus === 'angel_investing' ||
    advisor.specialty_focus === 'venture_capital'
  ).slice(0, 5); // Classic 5-shark panel

  const getSharkPersonality = (advisor) => {
    const name = advisor.name.toLowerCase();
    
    // Mark Cuban - The Tech Maverick
    if (name.includes('cuban')) {
      return { 
        type: 'maverick',
        color: 'from-red-600 to-red-700', 
        accent: 'red', 
        intensity: 'explosive',
        attitude: 'MAVERICK',
        dealStyle: 'All-in or All-out',
        catchphrase: "I'm out... unless you blow my mind!",
        netWorth: '$5.7B'
      };
    }
    
    // Jason Calacanis - The Angel Whisperer
    if (name.includes('calacanis')) {
      return { 
        type: 'angel',
        color: 'from-blue-600 to-blue-700', 
        accent: 'blue', 
        intensity: 'strategic',
        attitude: 'ANGEL EXPERT',
        dealStyle: 'Strategic Partner',
        catchphrase: "Let me tell you about scaling...",
        netWorth: '$100M+'
      };
    }
    
    // Kevin O'Leary - Mr. Wonderful
    if (name.includes('o\'leary') || name.includes('oleary')) {
      return { 
        type: 'money',
        color: 'from-green-600 to-green-700', 
        accent: 'green', 
        intensity: 'ruthless',
        attitude: 'MR. WONDERFUL',
        dealStyle: 'Royalty Deals',
        catchphrase: "You're dead to me!",
        netWorth: '$400M'
      };
    }
    
    // Robert Herjavec - The Security King
    if (name.includes('herjavec')) {
      return { 
        type: 'tech',
        color: 'from-purple-600 to-purple-700', 
        accent: 'purple', 
        intensity: 'analytical',
        attitude: 'TECH TITAN',
        dealStyle: 'Tech Scaling',
        catchphrase: "The numbers don't lie",
        netWorth: '$300M'
      };
    }
    
    // Daymond John - The Brand Builder
    if (name.includes('daymond') || name.includes('john')) {
      return { 
        type: 'brand',
        color: 'from-orange-600 to-orange-700', 
        accent: 'orange', 
        intensity: 'passionate',
        attitude: 'BRAND MASTER',
        dealStyle: 'Brand Building',
        catchphrase: "The power of broke!",
        netWorth: '$350M'
      };
    }
    
    // Barbara Corcoran - The Real Estate Queen
    if (name.includes('barbara') || name.includes('corcoran')) {
      return { 
        type: 'queen',
        color: 'from-pink-600 to-pink-700', 
        accent: 'pink', 
        intensity: 'fierce',
        attitude: 'REAL ESTATE QUEEN',
        dealStyle: 'Market Domination',
        catchphrase: "I love your energy!",
        netWorth: '$100M'
      };
    }
    
    // Default shark personality for other investors
    return { 
      type: 'investor',
      color: 'from-gray-600 to-gray-700', 
      accent: 'gray', 
      intensity: 'calculating',
      attitude: 'SHARK INVESTOR',
      dealStyle: 'Value Play',
      catchphrase: "Show me the money!",
      netWorth: 'Undisclosed'
    };
  };

  const getSharkPosition = (index, total) => {
    // Classic Shark Tank curved desk arrangement
    const positions = [
      { bottom: '25%', left: '8%', transform: 'scale(1) rotateY(-25deg)' },   // Far left shark
      { bottom: '30%', left: '24%', transform: 'scale(1.05) rotateY(-12deg)' }, // Left shark  
      { bottom: '35%', left: '50%', transform: 'translateX(-50%) scale(1.1)' }, // Center shark (lead)
      { bottom: '30%', right: '24%', transform: 'scale(1.05) rotateY(12deg)' }, // Right shark
      { bottom: '25%', right: '8%', transform: 'scale(1) rotateY(25deg)' },   // Far right shark
    ];
    
    return positions[index % positions.length];
  };

  const handleTimerStart = () => {
    setTimerActive(true);
    setPitchStarted(true);
    setTensionLevel(1);
  };

  const handleTimerPause = () => {
    setTimerActive(false);
  };

  const handleTimerReset = () => {
    setTimerActive(false);
    setPitchStarted(false);
    setTensionLevel(0);
    setDealProbability(45);
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

  // Simulate shark reactions and deal probability
  useEffect(() => {
    if (pitchStarted) {
      const interval = setInterval(() => {
        setTensionLevel(prev => Math.min(prev + 0.15, 5));
        setDealProbability(prev => Math.max(20, Math.min(80, prev + (Math.random() - 0.5) * 15)));
      }, 8000); // Tension builds every 8 seconds
      
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
    <div className={`relative w-full h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-[60]' : ''
    }`}>
      {/* High-Tech Neural Network Background */}
      {showNeuralNetwork && (
        <div className="absolute inset-0 overflow-hidden opacity-20">
          {/* Animated Neural Network */}
          <div className="absolute inset-0">
            <svg className="w-full h-full" viewBox="0 0 1200 800">
              <defs>
                <linearGradient id="sharkNetworkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{stopColor: '#ff4444', stopOpacity: 0.6}} />
                  <stop offset="50%" style={{stopColor: '#0080ff', stopOpacity: 0.4}} />
                  <stop offset="100%" style={{stopColor: '#00ff88', stopOpacity: 0.6}} />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Shark Tank Neural Nodes */}
              {Array.from({length: 25}).map((_, i) => (
                <circle
                  key={i}
                  cx={60 + (i % 6) * 180}
                  cy={80 + Math.floor(i / 6) * 130}
                  r={3 + Math.random() * 2}
                  fill="url(#sharkNetworkGradient)"
                  filter="url(#glow)"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: `${2 + Math.random() * 3}s`
                  }}
                />
              ))}
              
              {/* Investment Flow Lines */}
              {Array.from({length: 20}).map((_, i) => (
                <line
                  key={`investment-line-${i}`}
                  x1={60 + (i % 5) * 180}
                  y1={80 + Math.floor(i / 5) * 130}
                  x2={240 + (i % 4) * 180}
                  y2={210 + Math.floor(i / 4) * 130}
                  stroke="url(#sharkNetworkGradient)"
                  strokeWidth="1.5"
                  className="animate-pulse"
                  style={{
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                  }}
                />
              ))}
            </svg>
          </div>

          {/* Money Flow Particles */}
          <div className="absolute inset-0">
            {Array.from({length: 40}).map((_, i) => (
              <div
                key={`money-particle-${i}`}
                className="absolute text-green-400 text-xs animate-ping opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              >
                $
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classic Shark Tank Atmosphere */}
      {showSharkTankAtmosphere && (
        <>
          {/* TV Studio Lighting */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Main entrepreneur spotlight */}
            <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-gradient-radial from-yellow-200/25 via-yellow-100/10 to-transparent rounded-full animate-pulse" />
            
            {/* Dramatic shark desk lighting */}
            <div className="absolute top-0 left-0 w-40 h-full bg-gradient-to-r from-red-600/15 to-transparent" />
            <div className="absolute top-0 right-0 w-40 h-full bg-gradient-to-l from-blue-600/15 to-transparent" />
            
            {/* TV studio floor */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/8 to-transparent" />
          </div>

          {/* Live TV Elements */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div className="flex items-center space-x-4 bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-red-500/30">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-bold">LIVE • SHARK TANK</span>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-white text-xs">{sharks.length} SHARKS READY</span>
            </div>
          </div>
        </>
      )}

      {/* Enhanced Control Panel */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 z-20">
        <button
          onClick={() => setShowNeuralNetwork(!showNeuralNetwork)}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-cyan-400 rounded-lg hover:bg-slate-800/80 transition-all border border-cyan-500/30"
          title="Toggle Neural Network"
        >
          <Brain className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowSharkTankAtmosphere(!showSharkTankAtmosphere)}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-red-400 rounded-lg hover:bg-slate-800/80 transition-all border border-red-500/30"
          title="Toggle Shark Tank Atmosphere"
        >
          {showSharkTankAtmosphere ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        <button
          onClick={handleFullscreenToggle}
          className="p-2 bg-slate-900/80 backdrop-blur-sm text-white rounded-lg hover:bg-slate-800/80 transition-all border border-slate-500/30"
          title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Enhanced Shark Analytics Dashboard */}
      <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md rounded-xl border border-red-500/30 p-4 text-white min-w-80 z-20">
        <div className="flex items-center space-x-2 mb-4">
          <Waves className="w-5 h-5 text-red-400" />
          <span className="font-bold">SHARK TANK ANALYTICS</span>
          <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
        </div>
        
        {/* Deal Probability */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Deal Probability</span>
            <span className="text-lg font-bold text-green-400">{Math.round(dealProbability)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${
                dealProbability > 60 ? 'bg-green-500' : dealProbability > 40 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${dealProbability}%` }}
            />
          </div>
        </div>

        {/* Tension Meter */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className={`w-4 h-4 ${tensionLevel > 3 ? 'text-red-400' : 'text-yellow-400'}`} />
            <span className="text-sm text-gray-300">Tank Tension</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                tensionLevel > 4 ? 'bg-red-500 animate-pulse' : tensionLevel > 2 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${(tensionLevel / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Timer Integration */}
        <div className="pt-3 border-t border-slate-700">
          <div className="flex items-center space-x-2 mb-3">
            <Timer className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold">PITCH TIMER</span>
          </div>
          
          {!pitchStarted && (
            <div className="flex items-center space-x-2 mb-3">
              <select
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(parseInt(e.target.value))}
                className="bg-slate-800 text-white text-sm px-2 py-1 rounded border border-slate-600 flex-1"
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
            onTimeUp={() => {
              setTensionLevel(5);
              setDealProbability(prev => Math.max(15, prev - 20));
            }}
          />
        </div>
      </div>

      {/* Celebrity Shark Desks */}
      {sharks.map((shark, index) => {
        const position = getSharkPosition(index, sharks.length);
        const personality = getSharkPersonality(shark);
        const isIntense = tensionLevel > 3 && personality.intensity === 'explosive';
        const isLeadShark = index === Math.floor(sharks.length / 2); // Center shark is the lead
        
        return (
          <div
            key={shark.id}
            className="absolute z-10 transition-all duration-1000"
            style={position}
          >
            {/* Enhanced Shark Desk with Tech Integration */}
            <div className={`
              relative transition-all duration-1000
              ${isIntense ? 'animate-bounce' : ''}
              ${isLeadShark ? 'scale-110' : 'scale-100'}
            `}>
              {/* High-Tech Shark Desk */}
              <div className={`
                w-40 h-32 rounded-2xl shadow-2xl relative overflow-hidden border-2
                bg-gradient-to-br ${personality.color} 
                ${isIntense ? 'border-red-400 animate-pulse' : 'border-white/30'}
                ${isLeadShark ? 'ring-4 ring-yellow-400/50' : ''}
              `}>
                {/* Tech Pattern Overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-black/20" />
                <div className="absolute top-2 left-2 right-2 h-px bg-white/30" />
                <div className="absolute bottom-2 left-2 right-2 h-px bg-white/30" />
                
                {/* Shark Avatar */}
                <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                  <div className={`
                    relative w-14 h-14 rounded-full flex items-center justify-center text-xl shadow-xl
                    transition-all duration-500 border-2 border-white/40
                    bg-gradient-to-br ${personality.color}
                    ${isIntense ? 'animate-pulse scale-110' : 'scale-100'}
                  `}>
                    {shark.avatar_emoji || '🦈'}
                    
                    {/* Neural Network Ring */}
                    <div className="absolute inset-0 rounded-full border border-white/60 animate-pulse" />
                    <div className="absolute -inset-1 rounded-full border border-white/30 animate-spin" style={{animationDuration: '4s'}} />
                  </div>
                </div>

                {/* Shark Info Display */}
                <div className="absolute bottom-2 left-1 right-1">
                  <div className="bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1">
                    <div className="text-white text-xs font-bold text-center">{shark.name}</div>
                    <div className={`text-${personality.accent}-300 text-xs text-center font-bold`}>
                      {personality.attitude}
                    </div>
                    <div className="text-white/60 text-xs text-center">
                      {personality.netWorth}
                    </div>
                  </div>
                </div>

                {/* Deal Style Indicator */}
                <div className="absolute top-2 right-2">
                  <div className={`w-3 h-3 rounded-full bg-${personality.accent}-400 animate-pulse`} />
                </div>

                {/* Investment Status */}
                <div className="absolute left-0 top-0 bottom-0 w-1">
                  <div className={`h-full bg-gradient-to-t from-transparent via-${personality.accent}-400 to-transparent animate-pulse opacity-60`} />
                </div>
              </div>
              
              {/* Shark Authority Badge */}
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full border-2 border-white/50 flex items-center justify-center
                bg-gradient-to-br ${personality.color} shadow-lg`}>
                {shark.is_celebrity ? <Star className="w-3 h-3 text-white" /> : <Crown className="w-3 h-3 text-white" />}
              </div>
              
              {/* Investment Mood Indicator */}
              <div className={`
                absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-32 text-center
                ${isIntense ? 'animate-pulse' : ''}
              `}>
                <div className={`bg-black/70 backdrop-blur-sm px-3 py-1 rounded-lg border border-${personality.accent}-500/30`}>
                  <div className={`text-xs font-bold text-${personality.accent}-400`}>
                    {personality.dealStyle}
                  </div>
                  <div className="text-xs text-white/80 italic">
                    "{personality.catchphrase}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Entrepreneur Stage Platform */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2">
        <div className="relative">
          {/* Enhanced Platform with Tech Elements */}
          <div className="w-80 h-6 bg-gradient-to-r from-yellow-500/20 via-white/20 to-yellow-500/20 rounded-full shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent rounded-full" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
            
            {/* Neural network connections to platform */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-gradient-to-t from-yellow-400 to-transparent" />
          </div>
          
          {/* Entrepreneur Position Indicator */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-500/30">
              <div className="text-yellow-400 text-sm font-bold flex items-center space-x-2">
                <Target className="w-4 h-4" />
                <span>ENTREPRENEUR ZONE</span>
              </div>
              <div className="text-xs text-white/80">Make your pitch count!</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface - Enhanced for Shark Tank */}
      <div className="absolute inset-4 z-30 flex flex-col">
        <div className={`
          backdrop-blur-md rounded-2xl border p-6 transition-all duration-1000 shadow-2xl flex-1 flex flex-col
          ${tensionLevel > 4 
            ? 'bg-red-900/70 border-red-400 animate-pulse' 
            : tensionLevel > 2 
            ? 'bg-yellow-900/70 border-yellow-400'
            : 'bg-slate-900/80 border-cyan-500/30'
          }
        `}>
          {pitchStarted && (
            <div className={`
              text-center py-3 px-6 rounded-xl mb-4 transition-all duration-1000
              ${tensionLevel > 4 
                ? 'bg-red-500/20 border border-red-400/50 animate-pulse' 
                : tensionLevel > 2
                ? 'bg-yellow-500/20 border border-yellow-400/50'
                : 'bg-blue-500/20 border border-blue-400/50'
              }
            `}>
              <div className={`font-bold flex items-center justify-center space-x-2 ${
                tensionLevel > 4 ? 'text-red-300' : tensionLevel > 2 ? 'text-yellow-300' : 'text-blue-300'
              }`}>
                <Waves className="w-4 h-4" />
                <span>{
                  tensionLevel > 4 
                    ? "🔥 THE SHARKS ARE CIRCLING! CLOSE THE DEAL NOW!" 
                    : tensionLevel > 2
                    ? "⚡ TENSION RISING - THE SHARKS ARE INTERESTED!"
                    : "🎯 YOU'RE IN THE TANK - PITCH WITH CONFIDENCE!"
                }</span>
              </div>
              <div className="text-xs text-white/80 mt-1">
                {sharks.length} celebrity sharks • Deal probability: {Math.round(dealProbability)}%
              </div>
            </div>
          )}
          
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="absolute bottom-4 right-4 flex flex-col items-center space-y-2 z-20">
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-red-400 rounded-xl hover:bg-slate-800/80 transition-all border border-red-500/30 shadow-lg">
          <Volume2 className="w-5 h-5" />
        </button>
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-orange-400 rounded-xl hover:bg-slate-800/80 transition-all border border-orange-500/30 shadow-lg">
          <Mic className="w-5 h-5" />
        </button>
        <button className="p-3 bg-slate-900/80 backdrop-blur-sm text-green-400 rounded-xl hover:bg-slate-800/80 transition-all border border-green-500/30 shadow-lg">
          <DollarSign className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}