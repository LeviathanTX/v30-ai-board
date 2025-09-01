// src/components/VoiceControl/InlineVoiceControl.js
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Settings, Wifi, WifiOff } from 'lucide-react';
import { openaiRealtimeService } from '../../services/openaiRealtime';

export default function InlineVoiceControl({ 
  isVisible = false,
  onVoiceCommand = null,
  currentAdvisor = null,
  onAdvisorUpdate = null 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Set up event listeners
    const handleConnected = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsRecording(false);
    };

    const handleError = (err) => {
      setError(err.message || 'Voice service error');
      setIsConnected(false);
      setIsRecording(false);
    };

    const handleTranscript = (transcript) => {
      setCurrentTranscript(transcript);
    };

    const handleVoiceCommand = (command) => {
      logger.debug('Voice command received:', command);
      if (onVoiceCommand) {
        onVoiceCommand(command);
      }
    };

    const handleTextResponse = (textDelta) => {
      setLastResponse(prev => prev + textDelta);
    };

    const handleRecordingStarted = () => setIsRecording(true);
    const handleRecordingStopped = () => setIsRecording(false);

    // Add event listeners
    openaiRealtimeService.on('connected', handleConnected);
    openaiRealtimeService.on('disconnected', handleDisconnected);
    openaiRealtimeService.on('error', handleError);
    openaiRealtimeService.on('transcript', handleTranscript);
    openaiRealtimeService.on('voiceCommand', handleVoiceCommand);
    openaiRealtimeService.on('textResponse', handleTextResponse);
    openaiRealtimeService.on('recordingStarted', handleRecordingStarted);
    openaiRealtimeService.on('recordingStopped', handleRecordingStopped);

    return () => {
      // Remove event listeners
      openaiRealtimeService.removeAllListeners();
    };
  }, [onVoiceCommand]);

  // Set advisor context when current advisor changes
  useEffect(() => {
    if (currentAdvisor) {
      openaiRealtimeService.setAdvisorContext(currentAdvisor);
    }
  }, [currentAdvisor]);

  // Save API key to localStorage
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('openai_api_key', apiKey);
    }
  }, [apiKey]);

  const handleConnect = async () => {
    try {
      if (!apiKey) {
        setError('Please enter your OpenAI API key');
        setShowSettings(true);
        return;
      }
      
      await openaiRealtimeService.initialize(apiKey);
      await openaiRealtimeService.connect();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDisconnect = () => {
    openaiRealtimeService.disconnect();
  };

  const toggleRecording = async () => {
    if (!isConnected) {
      await handleConnect();
      return;
    }

    if (isRecording) {
      openaiRealtimeService.stopRecording();
    } else {
      try {
        await openaiRealtimeService.startRecording();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Voice Control</h3>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 hover:bg-white/50 rounded"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-3 p-3 bg-white/60 rounded-lg border border-white/80">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Main Controls */}
      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={toggleRecording}
          disabled={!apiKey}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : isConnected
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Talk</span>
            </>
          )}
        </button>

        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={!apiKey}
          className="flex items-center space-x-2 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnected ? (
            <>
              <Wifi className="w-4 h-4 text-green-600" />
              <span>Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-600" />
              <span>Connect</span>
            </>
          )}
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Transcript */}
      {currentTranscript && (
        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="text-xs font-medium text-blue-800 mb-1">You said:</div>
          <div className="text-xs text-blue-700">{currentTranscript}</div>
        </div>
      )}

      {/* Last Response */}
      {lastResponse && (
        <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded">
          <div className="text-xs font-medium text-green-800 mb-1">Assistant:</div>
          <div className="text-xs text-green-700">{lastResponse}</div>
        </div>
      )}

      {/* Voice Commands Help */}
      <div className="text-xs text-gray-600">
        <strong>Try saying:</strong> "Change the name to...", "Add expertise...", "Set role to...", "Save advisor"
      </div>
    </div>
  );
}