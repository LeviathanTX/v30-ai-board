// src/components/VoiceControl/AdvisorVoiceSettings.js
import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Settings, Wifi, WifiOff } from 'lucide-react';
import { openaiRealtimeService } from '../../services/openaiRealtime';

export default function AdvisorVoiceSettings({ 
  advisor = null,
  onVoiceCommand = null,
  onAdvisorUpdate = null,
  showInHeader = false,
  isVisible = true,
  onToggleVisible = null 
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [error, setError] = useState(null);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_api_key') || '');

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
      openaiRealtimeService.removeAllListeners();
    };
  }, [onVoiceCommand]);

  // Set advisor context when advisor changes
  useEffect(() => {
    if (advisor) {
      openaiRealtimeService.setAdvisorContext(advisor);
    }
  }, [advisor]);

  const handleConnect = async () => {
    try {
      if (!apiKey) {
        setError('Please enter your OpenAI API key in Settings > AI Settings');
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
        setLastResponse(''); // Clear previous response when starting new recording
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const clearTranscript = () => {
    setCurrentTranscript('');
    setLastResponse('');
    setError(null);
  };

  if (showInHeader) {
    // Compact header version
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => {
            if (onToggleVisible) {
              onToggleVisible();
            } else {
              setShowVoicePanel(!showVoicePanel);
            }
          }}
          className={`p-2 rounded-lg transition-colors ${
            (showVoicePanel || isVisible) ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title="Voice Control"
        >
          <Volume2 className="w-4 h-4" />
        </button>
        
        <div className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-green-500' : 'bg-red-500'
        }`} title={isConnected ? 'Voice Connected' : 'Voice Disconnected'} />

        {showVoicePanel && (
          <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-xl border p-4 min-w-80 z-50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-gray-900">
                  Voice Control - {advisor?.name || 'New Advisor'}
                </h4>
                <button onClick={() => setShowVoicePanel(false)}>
                  <Settings className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              
              {/* Rest of voice controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleRecording}
                  disabled={!apiKey}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isRecording
                      ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                      : isConnected
                      ? 'bg-purple-500 hover:bg-purple-600 text-white'
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
                  onClick={clearTranscript}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm"
                >
                  Clear
                </button>
              </div>

              {error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                  {error}
                </div>
              )}

              {currentTranscript && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="text-xs font-medium text-blue-800 mb-1">You said:</div>
                  <div className="text-xs text-blue-700">{currentTranscript}</div>
                </div>
              )}

              {lastResponse && (
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="text-xs font-medium text-green-800 mb-1">Assistant:</div>
                  <div className="text-xs text-green-700">{lastResponse}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full inline version for modal body
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Volume2 className="w-5 h-5 text-purple-600" />
          <h3 className="text-sm font-semibold text-gray-900">
            Voice Control {advisor && `- ${advisor.name}`}
          </h3>
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
        </div>
        <button
          onClick={clearTranscript}
          className="p-1 hover:bg-white/50 rounded text-xs text-gray-600"
        >
          Clear
        </button>
      </div>

      {/* Main Controls */}
      <div className="flex items-center space-x-3 mb-3">
        <button
          onClick={toggleRecording}
          disabled={!apiKey}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : isConnected
              ? 'bg-purple-500 hover:bg-purple-600 text-white'
              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4" />
              <span>Stop Recording</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4" />
              <span>Start Recording</span>
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
        <strong>Voice Commands:</strong> "Change name to...", "Set role to...", "Add expertise...", "Add trait...", "Save advisor"
      </div>
    </div>
  );
}