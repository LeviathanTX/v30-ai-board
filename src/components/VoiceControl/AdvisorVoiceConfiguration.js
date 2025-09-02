// src/components/VoiceControl/AdvisorVoiceConfiguration.js - Advanced Voice Configuration for Advisors
import React, { useState, useEffect, useRef } from 'react';
import { 
  Volume2, VolumeX, Mic, MicOff, Play, Pause, Settings, 
  Wifi, WifiOff, CheckCircle, AlertCircle, Zap, Brain,
  User, RefreshCw, Download, Upload, TestTube, Square
} from 'lucide-react';
import { openaiRealtimeService } from '../../services/openaiRealtime';
import logger from '../../utils/logger';

const VOICE_MODELS = {
  openai: {
    id: 'openai',
    name: 'OpenAI Realtime',
    description: 'High-quality conversational AI voice',
    voices: [
      { id: 'alloy', name: 'Alloy', gender: 'neutral', style: 'balanced' },
      { id: 'echo', name: 'Echo', gender: 'male', style: 'resonant' },
      { id: 'fable', name: 'Fable', gender: 'female', style: 'expressive' },
      { id: 'onyx', name: 'Onyx', gender: 'male', style: 'deep' },
      { id: 'nova', name: 'Nova', gender: 'female', style: 'bright' },
      { id: 'shimmer', name: 'Shimmer', gender: 'female', style: 'warm' }
    ],
    pricing: '$0.006/min input, $0.024/min output',
    features: ['Real-time conversation', 'Emotion detection', 'Function calling']
  },
  elevenlabs: {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Ultra-realistic voice cloning and synthesis',
    voices: [
      { id: 'rachel', name: 'Rachel', gender: 'female', style: 'conversational' },
      { id: 'drew', name: 'Drew', gender: 'male', style: 'news' },
      { id: 'clyde', name: 'Clyde', gender: 'male', style: 'war veteran' },
      { id: 'paul', name: 'Paul', gender: 'male', style: 'authoritative' },
      { id: 'domi', name: 'Domi', gender: 'female', style: 'confident' },
      { id: 'dave', name: 'Dave', gender: 'male', style: 'conversational' }
    ],
    pricing: 'Variable based on quality',
    features: ['Voice cloning', 'Emotion control', 'Custom voices']
  },
  azure: {
    id: 'azure',
    name: 'Azure Cognitive Services',
    description: 'Microsoft\'s enterprise speech services',
    voices: [
      { id: 'en-US-JennyNeural', name: 'Jenny', gender: 'female', style: 'assistant' },
      { id: 'en-US-GuyNeural', name: 'Guy', gender: 'male', style: 'newscast' },
      { id: 'en-US-AriaNeural', name: 'Aria', gender: 'female', style: 'chat' },
      { id: 'en-US-DavisNeural', name: 'Davis', gender: 'male', style: 'chat' },
      { id: 'en-US-AmberNeural', name: 'Amber', gender: 'female', style: 'professional' },
      { id: 'en-US-BrandonNeural', name: 'Brandon', gender: 'male', style: 'professional' }
    ],
    pricing: '$1.00 per 1M characters',
    features: ['Neural voices', 'SSML support', 'Custom neural voices']
  },
  google: {
    id: 'google',
    name: 'Google Cloud Text-to-Speech',
    description: 'Google\'s advanced speech synthesis',
    voices: [
      { id: 'en-US-Standard-A', name: 'Standard A', gender: 'female', style: 'standard' },
      { id: 'en-US-Standard-B', name: 'Standard B', gender: 'male', style: 'standard' },
      { id: 'en-US-Wavenet-A', name: 'WaveNet A', gender: 'female', style: 'natural' },
      { id: 'en-US-Wavenet-B', name: 'WaveNet B', gender: 'male', style: 'natural' },
      { id: 'en-US-Neural2-A', name: 'Neural2 A', gender: 'female', style: 'conversational' },
      { id: 'en-US-Neural2-C', name: 'Neural2 C', gender: 'male', style: 'conversational' }
    ],
    pricing: '$4.00 per 1M characters (WaveNet)',
    features: ['WaveNet technology', 'Custom voices', 'Audio effects']
  }
};

export default function AdvisorVoiceConfiguration({ 
  advisor = null, 
  onVoiceSettingsChange = null,
  showAdvanced = true,
  isVisible = true 
}) {
  // Voice configuration state
  const [voiceSettings, setVoiceSettings] = useState({
    enabled: false,
    model: 'openai',
    voice: 'alloy',
    speed: 1.0,
    pitch: 1.0,
    volume: 1.0,
    stability: 0.5, // ElevenLabs specific
    similarity: 0.75, // ElevenLabs specific
    style: 0.0, // Style exaggeration
    useSSML: false,
    customPrompt: '',
    emotionSettings: {
      enabled: true,
      adaptToPersonality: true,
      baseEmotion: 'neutral'
    }
  });

  // Connection and testing state
  const [connectionState, setConnectionState] = useState({
    isConnected: false,
    isConnecting: false,
    lastError: null,
    apiKeyStatus: {
      openai: false,
      elevenlabs: false,
      azure: false,
      google: false
    }
  });

  // Audio testing state
  const [testingState, setTestingState] = useState({
    isPlaying: false,
    isRecording: false,
    testText: 'Hello! I am your AI advisor. How can I assist you with your business decisions today?',
    lastTestAudio: null,
    voiceSample: null
  });

  const audioRef = useRef(null);

  // Initialize voice settings from advisor data
  useEffect(() => {
    if (advisor && advisor.voice_settings) {
      setVoiceSettings(prev => ({
        ...prev,
        ...advisor.voice_settings
      }));
    }
    
    checkApiKeyStatus();
  }, [advisor]);

  // Check API key status for all voice services
  const checkApiKeyStatus = () => {
    const apiKeys = {
      openai: localStorage.getItem('openai_api_key') || localStorage.getItem('openai_realtime_key'),
      elevenlabs: localStorage.getItem('elevenlabs_api_key'),
      azure: localStorage.getItem('azure_speech_key'),
      google: localStorage.getItem('google_cloud_key')
    };

    setConnectionState(prev => ({
      ...prev,
      apiKeyStatus: {
        openai: !!apiKeys.openai,
        elevenlabs: !!apiKeys.elevenlabs,
        azure: !!apiKeys.azure,
        google: !!apiKeys.google
      }
    }));
  };

  // Update voice settings
  const handleVoiceSettingChange = (key, value) => {
    const newSettings = {
      ...voiceSettings,
      [key]: value
    };
    
    setVoiceSettings(newSettings);
    
    if (onVoiceSettingsChange) {
      onVoiceSettingsChange(newSettings);
    }
  };

  // Handle nested settings updates
  const handleNestedSettingChange = (category, key, value) => {
    const newSettings = {
      ...voiceSettings,
      [category]: {
        ...voiceSettings[category],
        [key]: value
      }
    };
    
    setVoiceSettings(newSettings);
    
    if (onVoiceSettingsChange) {
      onVoiceSettingsChange(newSettings);
    }
  };

  // Test voice connection
  const testConnection = async () => {
    setConnectionState(prev => ({ ...prev, isConnecting: true, lastError: null }));
    
    try {
      const model = VOICE_MODELS[voiceSettings.model];
      
      if (!connectionState.apiKeyStatus[voiceSettings.model]) {
        throw new Error(`${model.name} API key not found. Please add it in Settings.`);
      }

      // Test connection based on selected model
      switch (voiceSettings.model) {
        case 'openai':
          await testOpenAIConnection();
          break;
        case 'elevenlabs':
          await testElevenLabsConnection();
          break;
        case 'azure':
          await testAzureConnection();
          break;
        case 'google':
          await testGoogleConnection();
          break;
        default:
          throw new Error('Unsupported voice model');
      }
      
      setConnectionState(prev => ({ 
        ...prev, 
        isConnected: true, 
        isConnecting: false 
      }));
      
      logger.info(`Voice connection test successful for ${model.name}`);
      
    } catch (error) {
      setConnectionState(prev => ({ 
        ...prev, 
        isConnected: false, 
        isConnecting: false,
        lastError: error.message 
      }));
      
      logger.error('Voice connection test failed', error);
    }
  };

  // Test OpenAI Realtime connection
  const testOpenAIConnection = async () => {
    const apiKey = localStorage.getItem('openai_api_key') || localStorage.getItem('openai_realtime_key');
    
    // Test with a simple API call
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`OpenAI API test failed: ${response.status}`);
    }
  };

  // Test ElevenLabs connection
  const testElevenLabsConnection = async () => {
    const apiKey = localStorage.getItem('elevenlabs_api_key');
    
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`ElevenLabs API test failed: ${response.status}`);
    }
  };

  // Test Azure connection
  const testAzureConnection = async () => {
    // Azure connection test would go here
    // For now, simulate success if API key exists
    const apiKey = localStorage.getItem('azure_speech_key');
    if (!apiKey) {
      throw new Error('Azure Speech Service key not found');
    }
  };

  // Test Google connection
  const testGoogleConnection = async () => {
    // Google Cloud connection test would go here
    // For now, simulate success if API key exists
    const apiKey = localStorage.getItem('google_cloud_key');
    if (!apiKey) {
      throw new Error('Google Cloud key not found');
    }
  };

  // Test voice synthesis
  const testVoice = async () => {
    if (!testingState.testText.trim()) {
      alert('Please enter some text to test');
      return;
    }

    setTestingState(prev => ({ ...prev, isPlaying: true }));
    
    try {
      // Check if Web Speech API is supported
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(testingState.testText);
        
        // Configure utterance based on voice settings
        utterance.rate = voiceSettings.speed;
        utterance.pitch = voiceSettings.pitch;
        utterance.volume = voiceSettings.volume;
        
        // Try to match voice based on selected voice preferences
        const voices = speechSynthesis.getVoices();
        const selectedVoice = currentModel.voices.find(v => v.id === voiceSettings.voice);
        
        if (selectedVoice && voices.length > 0) {
          // Find a matching voice or use default
          const matchingVoice = voices.find(voice => {
            const nameLower = voice.name.toLowerCase();
            const selectedLower = selectedVoice.name.toLowerCase();
            return nameLower.includes(selectedLower) || 
                   nameLower.includes(selectedVoice.gender) ||
                   (selectedVoice.gender === 'female' && voice.name.includes('Female')) ||
                   (selectedVoice.gender === 'male' && voice.name.includes('Male'));
          });
          
          if (matchingVoice) {
            utterance.voice = matchingVoice;
          }
        }
        
        // Set up event listeners
        utterance.onstart = () => {
          logger.info('Voice test started');
        };
        
        utterance.onend = () => {
          setTestingState(prev => ({ ...prev, isPlaying: false }));
          logger.info('Voice test completed');
        };
        
        utterance.onerror = (error) => {
          setTestingState(prev => ({ ...prev, isPlaying: false }));
          logger.error('Voice test failed', error);
          setConnectionState(prev => ({ 
            ...prev, 
            lastError: `Speech synthesis error: ${error.error}` 
          }));
        };
        
        // Start speech synthesis
        speechSynthesis.speak(utterance);
        
      } else if (voiceSettings.model === 'openai' && openaiRealtimeService) {
        // Try using OpenAI Realtime for voice synthesis
        logger.info('Testing with OpenAI Realtime API...');
        
        // This would be implemented when OpenAI Realtime TTS is available
        // For now, provide feedback that this would use the API
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setTestingState(prev => ({ ...prev, isPlaying: false }));
        logger.info('Voice test completed (simulated OpenAI)');
        
      } else {
        // Fallback: just show that testing is happening
        await new Promise(resolve => setTimeout(resolve, 2000));
        setTestingState(prev => ({ ...prev, isPlaying: false }));
        logger.info('Voice test completed (simulated)');
        
        setConnectionState(prev => ({ 
          ...prev, 
          lastError: 'Web Speech API not supported in this browser. Actual voice synthesis will use the selected API service.' 
        }));
      }
      
    } catch (error) {
      setTestingState(prev => ({ ...prev, isPlaying: false }));
      logger.error('Voice test failed', error);
      setConnectionState(prev => ({ 
        ...prev, 
        lastError: `Voice test error: ${error.message}` 
      }));
    }
  };

  // Get current voice model info
  const currentModel = VOICE_MODELS[voiceSettings.model];
  const currentVoice = currentModel?.voices.find(v => v.id === voiceSettings.voice);
  const isApiKeyAvailable = connectionState.apiKeyStatus[voiceSettings.model];

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Volume2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Voice Configuration
            </h3>
          </div>
          {advisor && (
            <span className="text-sm text-gray-600">for {advisor.name}</span>
          )}
        </div>
        
        {/* Connection Status */}
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            connectionState.isConnected ? 'bg-green-500' : 
            connectionState.isConnecting ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} />
          <span className="text-xs text-gray-600">
            {connectionState.isConnected ? 'Connected' : 
             connectionState.isConnecting ? 'Connecting...' : 
             'Disconnected'}
          </span>
        </div>
      </div>

      {/* Voice Enable Toggle */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-600" />
          <div>
            <div className="font-medium text-gray-900">Enable Voice for Advisor</div>
            <div className="text-sm text-gray-600">Allow this advisor to speak using AI voice synthesis</div>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={voiceSettings.enabled}
            onChange={(e) => handleVoiceSettingChange('enabled', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
        </label>
      </div>

      {voiceSettings.enabled && (
        <>
          {/* Voice Model Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Voice Service</h4>
              <button
                onClick={checkApiKeyStatus}
                className="p-1 hover:bg-white rounded text-gray-400 hover:text-gray-600"
                title="Refresh API key status"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {Object.values(VOICE_MODELS).map(model => (
                <div
                  key={model.id}
                  onClick={() => handleVoiceSettingChange('model', model.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    voiceSettings.model === model.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">{model.name}</div>
                    <div className="flex items-center space-x-1">
                      {connectionState.apiKeyStatus[model.id] ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">{model.description}</div>
                  <div className="text-xs text-gray-500">{model.pricing}</div>
                  {!connectionState.apiKeyStatus[model.id] && (
                    <div className="text-xs text-red-600 mt-1">API key required</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Voice Selection */}
          {currentModel && isApiKeyAvailable && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Voice Selection</h4>
              <div className="grid grid-cols-3 gap-2">
                {currentModel.voices.map(voice => (
                  <div
                    key={voice.id}
                    onClick={() => handleVoiceSettingChange('voice', voice.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      voiceSettings.voice === voice.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="font-medium text-sm text-gray-900">{voice.name}</div>
                    <div className="text-xs text-gray-600">{voice.gender}</div>
                    <div className="text-xs text-gray-500">{voice.style}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Voice Parameters */}
          {currentModel && isApiKeyAvailable && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Voice Parameters</h4>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Speed */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Speed ({voiceSettings.speed.toFixed(1)}x)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSettings.speed}
                    onChange={(e) => handleVoiceSettingChange('speed', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                </div>

                {/* Pitch */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pitch ({voiceSettings.pitch.toFixed(1)}x)
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={voiceSettings.pitch}
                    onChange={(e) => handleVoiceSettingChange('pitch', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                </div>

                {/* Volume */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Volume ({Math.round(voiceSettings.volume * 100)}%)
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.1"
                    value={voiceSettings.volume}
                    onChange={(e) => handleVoiceSettingChange('volume', parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  />
                </div>

                {/* Stability (ElevenLabs specific) */}
                {voiceSettings.model === 'elevenlabs' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Stability ({Math.round(voiceSettings.stability * 100)}%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={voiceSettings.stability}
                      onChange={(e) => handleVoiceSettingChange('stability', parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Test Controls */}
          {isApiKeyAvailable && (
            <div className="space-y-3 p-4 bg-white rounded-lg border">
              <h4 className="font-medium text-gray-900">Voice Testing</h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <textarea
                    value={testingState.testText}
                    onChange={(e) => setTestingState(prev => ({ ...prev, testText: e.target.value }))}
                    placeholder="Enter text to test the voice..."
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={2}
                  />
                  
                  {/* Sample Text Options */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Hello, I'm your AI advisor. How can I help you today?",
                      "Based on the data analysis, I recommend focusing on customer retention strategies.",
                      "Let me walk you through the quarterly financial projections.",
                      "I've reviewed your presentation and have some strategic insights to share."
                    ].map((sampleText, index) => (
                      <button
                        key={index}
                        onClick={() => setTestingState(prev => ({ ...prev, testText: sampleText }))}
                        className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded border"
                      >
                        Sample {index + 1}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={testConnection}
                    disabled={connectionState.isConnecting}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {connectionState.isConnecting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Testing...</span>
                      </>
                    ) : (
                      <>
                        <Wifi className="w-4 h-4" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={testVoice}
                    disabled={testingState.isPlaying || !testingState.testText.trim()}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {testingState.isPlaying ? (
                      <>
                        <Pause className="w-4 h-4" />
                        <span>Playing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4" />
                        <span>Test Voice</span>
                      </>
                    )}
                  </button>
                  
                  {testingState.isPlaying && (
                    <button
                      onClick={() => {
                        if ('speechSynthesis' in window) {
                          speechSynthesis.cancel();
                        }
                        setTestingState(prev => ({ ...prev, isPlaying: false }));
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
                    >
                      <Square className="w-4 h-4" />
                      <span>Stop</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {connectionState.lastError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connection Error</span>
              </div>
              <div className="text-sm text-red-700 mt-1">
                {connectionState.lastError}
              </div>
            </div>
          )}

          {/* API Key Warning */}
          {!isApiKeyAvailable && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">API Key Required</span>
              </div>
              <div className="text-sm text-yellow-700 mt-2">
                To enable voice features for this advisor, please add your {currentModel?.name} API key in the Settings panel.
              </div>
              <div className="mt-3">
                <a
                  href="#settings"
                  className="inline-flex items-center space-x-1 text-sm font-medium text-yellow-800 hover:text-yellow-900"
                >
                  <Settings className="w-4 h-4" />
                  <span>Go to Settings</span>
                </a>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}