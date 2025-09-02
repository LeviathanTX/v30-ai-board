// src/components/MeetingEnvironment/InvestmentPodAdvanced.js - Real-time Sentiment Investment Pod
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Eye, Heart, Brain,
  Mic, Users, Target, Zap, BarChart3, PieChart, LineChart,
  Volume2, Waves, Clock, AlertTriangle, CheckCircle, X,
  ThermometerSun, Gauge, Timer, MessageCircle, Sparkles
} from 'lucide-react';

const InvestmentPodAdvanced = ({ selectedAdvisors, messages, onMessageSend, children }) => {
  // Real-time sentiment state
  const [sentimentData, setSentimentData] = useState({
    overall: 0.65, // 0-1 scale
    confidence: 0.72,
    engagement: 0.68,
    investability: 0.74,
    risk: 0.45,
    emotions: {
      excitement: 0.82,
      skepticism: 0.34,
      interest: 0.76,
      concern: 0.28,
      confidence: 0.71
    },
    keyWords: ['innovation', 'market', 'growth', 'scalable', 'revenue'],
    timeSeriesData: []
  });

  // Audio analysis state
  const [audioMetrics, setAudioMetrics] = useState({
    isListening: false,
    volume: 0,
    pitch: 440,
    pace: 1.0,
    clarity: 0.85,
    emotionTone: 'confident'
  });

  // Visual engagement state
  const [visualMetrics, setVisualMetrics] = useState({
    attentionLevel: 0.78,
    facialSentiment: 0.69,
    bodyLanguage: 'engaged',
    eyeContact: 0.82
  });

  // Presentation state
  const [presentationState, setPresentationState] = useState({
    phase: 'introduction', // introduction, problem, solution, market, traction, ask
    duration: 0,
    keyMoments: [],
    criticalPoints: []
  });

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const canvasRef = useRef(null);

  // Simulated real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time sentiment fluctuations
      setSentimentData(prev => ({
        ...prev,
        overall: Math.max(0.2, Math.min(0.9, prev.overall + (Math.random() - 0.5) * 0.1)),
        confidence: Math.max(0.3, Math.min(0.95, prev.confidence + (Math.random() - 0.5) * 0.08)),
        engagement: Math.max(0.4, Math.min(0.9, prev.engagement + (Math.random() - 0.5) * 0.12)),
        investability: Math.max(0.2, Math.min(0.95, prev.investability + (Math.random() - 0.5) * 0.07)),
        emotions: {
          excitement: Math.max(0.1, Math.min(0.9, prev.emotions.excitement + (Math.random() - 0.5) * 0.15)),
          skepticism: Math.max(0.1, Math.min(0.8, prev.emotions.skepticism + (Math.random() - 0.5) * 0.12)),
          interest: Math.max(0.3, Math.min(0.9, prev.emotions.interest + (Math.random() - 0.5) * 0.1)),
          concern: Math.max(0.1, Math.min(0.7, prev.emotions.concern + (Math.random() - 0.5) * 0.08)),
          confidence: Math.max(0.3, Math.min(0.9, prev.emotions.confidence + (Math.random() - 0.5) * 0.09))
        }
      }));

      // Update audio metrics
      setAudioMetrics(prev => ({
        ...prev,
        volume: Math.random() * 100,
        pitch: 200 + Math.random() * 400,
        pace: 0.7 + Math.random() * 0.6
      }));

      // Update presentation duration
      setPresentationState(prev => ({
        ...prev,
        duration: prev.duration + 1
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate dynamic background colors based on sentiment
  const getDynamicBackgroundStyle = () => {
    const { overall, confidence, engagement } = sentimentData;
    
    if (overall > 0.7 && confidence > 0.7) {
      return {
        background: `
          radial-gradient(circle at 20% 80%, rgba(34, 197, 94, ${0.3 + overall * 0.2}) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(59, 130, 246, ${0.2 + confidence * 0.2}) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(168, 85, 247, ${0.1 + engagement * 0.2}) 0%, transparent 50%),
          linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
        `
      };
    } else if (overall < 0.4) {
      return {
        background: `
          radial-gradient(circle at 30% 70%, rgba(239, 68, 68, ${0.2 + (1 - overall) * 0.2}) 0%, transparent 50%),
          radial-gradient(circle at 70% 30%, rgba(245, 101, 101, ${0.1 + (1 - confidence) * 0.15}) 0%, transparent 50%),
          linear-gradient(135deg, #1a1a1a 0%, #2d1b1b 50%, #3a2525 100%)
        `
      };
    } else {
      return {
        background: `
          radial-gradient(circle at 25% 75%, rgba(251, 191, 36, ${0.2 + engagement * 0.15}) 0%, transparent 50%),
          radial-gradient(circle at 75% 25%, rgba(16, 185, 129, ${0.1 + overall * 0.2}) 0%, transparent 50%),
          linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)
        `
      };
    }
  };

  // Render real-time metrics dashboard
  const renderSentimentDashboard = () => (
    <div className="absolute top-4 right-4 w-80 bg-slate-900/90 backdrop-blur-md rounded-xl p-4 border border-cyan-500/30 z-40">
      <div className="text-center mb-3">
        <h3 className="text-cyan-400 font-bold text-sm">Live Audience Intelligence</h3>
        <div className="text-xs text-gray-400">Real-time sentiment & engagement</div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-gray-300">Investability</span>
          </div>
          <div className="text-lg font-bold text-green-400">
            {Math.round(sentimentData.investability * 100)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-green-400 h-1 rounded-full transition-all duration-1000"
              style={{ width: `${sentimentData.investability * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-2">
          <div className="flex items-center space-x-2 mb-1">
            <Activity className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-gray-300">Engagement</span>
          </div>
          <div className="text-lg font-bold text-blue-400">
            {Math.round(sentimentData.engagement * 100)}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div 
              className="bg-blue-400 h-1 rounded-full transition-all duration-1000"
              style={{ width: `${sentimentData.engagement * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Emotion Radar */}
      <div className="bg-slate-800/50 rounded-lg p-2 mb-3">
        <div className="text-xs text-gray-300 mb-2 flex items-center">
          <Brain className="w-3 h-3 mr-1" />
          Emotional Response
        </div>
        <div className="space-y-1">
          {Object.entries(sentimentData.emotions).map(([emotion, value]) => (
            <div key={emotion} className="flex items-center justify-between">
              <span className="text-xs text-gray-400 capitalize">{emotion}</span>
              <div className="flex items-center space-x-1">
                <div className="w-16 bg-gray-700 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full transition-all duration-1000 ${
                      emotion === 'excitement' || emotion === 'interest' || emotion === 'confidence'
                        ? 'bg-green-400' 
                        : emotion === 'skepticism' || emotion === 'concern'
                        ? 'bg-red-400'
                        : 'bg-yellow-400'
                    }`}
                    style={{ width: `${value * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-300 w-8">
                  {Math.round(value * 100)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Words Cloud */}
      <div className="bg-slate-800/50 rounded-lg p-2">
        <div className="text-xs text-gray-300 mb-2 flex items-center">
          <MessageCircle className="w-3 h-3 mr-1" />
          Key Terms Detected
        </div>
        <div className="flex flex-wrap gap-1">
          {sentimentData.keyWords.map((word, idx) => (
            <span 
              key={word}
              className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30"
              style={{ 
                fontSize: `${0.7 + (sentimentData.keyWords.length - idx) * 0.1}rem`,
                opacity: 0.6 + (sentimentData.keyWords.length - idx) * 0.1
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Render audio visualization
  const renderAudioVisualization = () => (
    <div className="absolute bottom-4 right-4 w-64 bg-slate-900/80 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30 z-40">
      <div className="text-center mb-2">
        <h4 className="text-purple-400 font-bold text-xs flex items-center justify-center space-x-1">
          <Waves className="w-3 h-3" />
          <span>Voice Analytics</span>
        </h4>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="text-center">
          <div className="text-gray-400">Pace</div>
          <div className="text-white font-mono">{audioMetrics.pace.toFixed(1)}x</div>
        </div>
        <div className="text-center">
          <div className="text-gray-400">Clarity</div>
          <div className="text-white font-mono">{Math.round(audioMetrics.clarity * 100)}%</div>
        </div>
      </div>

      {/* Audio Waveform Simulation */}
      <div className="mt-2 h-8 bg-slate-800 rounded flex items-end justify-center space-x-1 p-1">
        {Array.from({ length: 20 }).map((_, idx) => (
          <div
            key={idx}
            className="bg-purple-400 w-1 rounded-t animate-pulse"
            style={{
              height: `${20 + Math.sin((Date.now() / 100) + idx) * 15}px`,
              animationDelay: `${idx * 50}ms`
            }}
          />
        ))}
      </div>
    </div>
  );

  // Render investor panel with real-time reactions
  const renderInvestorPanel = () => (
    <div className="absolute top-1/4 left-4 space-y-3 z-30">
      {selectedAdvisors.slice(0, 4).map((advisor, idx) => {
        const reactions = ['🤔', '👍', '🎯', '💡', '📊', '🔥', '⚡', '💰'];
        const currentReaction = reactions[Math.floor((Date.now() / 3000 + idx) % reactions.length)];
        const engagement = 0.4 + Math.random() * 0.5;
        
        return (
          <div 
            key={advisor.id} 
            className="bg-slate-900/80 backdrop-blur-sm rounded-xl p-3 border border-cyan-500/20 w-48"
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-500 rounded-full flex items-center justify-center text-lg">
                  {advisor.avatar_emoji || '💼'}
                </div>
                <div className="absolute -top-1 -right-1 text-lg animate-bounce">
                  {currentReaction}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="text-white text-sm font-medium">{advisor.name}</div>
                <div className="text-xs text-gray-400">{advisor.role}</div>
                
                {/* Individual engagement meter */}
                <div className="mt-1 flex items-center space-x-2">
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full transition-all duration-2000 ${
                        engagement > 0.7 ? 'bg-green-400' : 
                        engagement > 0.4 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}
                      style={{ width: `${engagement * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-300">{Math.round(engagement * 100)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render critical moments alerts
  const renderCriticalMoments = () => {
    const shouldShowAlert = sentimentData.overall < 0.3 || sentimentData.engagement < 0.3;
    
    if (!shouldShowAlert) return null;
    
    return (
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <div className="bg-red-900/90 backdrop-blur-md rounded-xl p-4 border-2 border-red-500 animate-pulse">
          <div className="flex items-center space-x-3 text-red-300">
            <AlertTriangle className="w-6 h-6" />
            <div>
              <div className="font-bold">Critical Moment Detected</div>
              <div className="text-sm">Consider pivoting or emphasizing key benefits</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden rounded-lg"
      style={getDynamicBackgroundStyle()}
    >
      {/* Neural Network Background Animation */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" className="animate-pulse">
          <defs>
            <pattern id="neural-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="50" cy="50" r="2" fill="#22d3ee" opacity="0.5">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
              </circle>
              <line x1="50" y1="50" x2="100" y2="0" stroke="#22d3ee" strokeWidth="0.5" opacity="0.3" />
              <line x1="50" y1="50" x2="0" y2="100" stroke="#22d3ee" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>
      </div>

      {/* Dynamic Particle System */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, idx) => (
          <div
            key={idx}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
            style={{
              left: `${20 + (idx * 7) % 80}%`,
              top: `${30 + (idx * 11) % 60}%`,
              animationDelay: `${idx * 0.5}s`,
              animationDuration: `${3 + (idx % 3)}s`
            }}
          />
        ))}
      </div>

      {/* Main Content Area with Chat Interface */}
      <div className="absolute inset-4 z-30 flex flex-col">
        <div className="bg-slate-900/90 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-6 shadow-2xl flex-1 flex flex-col">
          <div className="text-center py-3 px-6 rounded-xl mb-4 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20">
            <div className="text-cyan-400 text-sm font-semibold flex items-center justify-center space-x-2">
              <Target className="w-4 h-4" />
              <span>AI Investment Pod - Live Sentiment Analysis</span>
            </div>
            <div className="text-xs text-gray-400 mt-1 flex items-center justify-center space-x-4">
              <span>Duration: {Math.floor(presentationState.duration / 60)}:{(presentationState.duration % 60).toString().padStart(2, '0')}</span>
              <span>•</span>
              <span>Confidence: {Math.round(sentimentData.confidence * 100)}%</span>
              <span>•</span>
              <span className={`${sentimentData.overall > 0.6 ? 'text-green-400' : sentimentData.overall > 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                {sentimentData.overall > 0.6 ? 'Positive' : sentimentData.overall > 0.4 ? 'Neutral' : 'Concerning'} Sentiment
              </span>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col min-h-0">
            {children}
          </div>
        </div>
      </div>

      {/* Render all dynamic components */}
      {renderSentimentDashboard()}
      {renderAudioVisualization()}
      {renderInvestorPanel()}
      {renderCriticalMoments()}

      {/* Status Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md rounded-full px-6 py-2 border border-cyan-500/30 z-20">
        <div className="flex items-center space-x-4 text-white text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>LIVE ANALYSIS</span>
          </div>
          <div className="flex items-center space-x-1">
            <Brain className="w-3 h-3 text-purple-400" />
            <span>{selectedAdvisors.length} AI Investors</span>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>Neural Processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentPodAdvanced;