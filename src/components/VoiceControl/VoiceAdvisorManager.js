// src/components/VoiceControl/VoiceAdvisorManager.js
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Play, Square, Settings } from 'lucide-react';
import { openaiRealtimeService } from '../../services/openaiRealtime';
import { useAppState } from '../../contexts/AppStateContext';

export default function VoiceAdvisorManager({ 
  isVisible = false, 
  onVoiceCommand = null,
  currentAdvisor = null,
  onAdvisorUpdate = null 
}) {
  const { state, dispatch, actions } = useAppState();
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [lastResponse, setLastResponse] = useState('');
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  
  const audioRef = useRef(null);
  const audioChunks = useRef([]);

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
      
      // Handle command locally
      handleAdvisorVoiceCommand(command);
    };

    const handleTextResponse = (textDelta) => {
      setLastResponse(prev => prev + textDelta);
    };

    const handleAudioResponse = (audioDelta) => {
      if (audioDelta) {
        // Convert base64 audio to playable format
        const audioData = atob(audioDelta);
        const audioArray = new Uint8Array(audioData.length);
        for (let i = 0; i < audioData.length; i++) {
          audioArray[i] = audioData.charCodeAt(i);
        }
        audioChunks.current.push(audioArray);
      }
    };

    const handleResponseComplete = () => {
      if (audioChunks.current.length > 0) {
        playAudioResponse();
      }
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
    openaiRealtimeService.on('audioResponse', handleAudioResponse);
    openaiRealtimeService.on('responseComplete', handleResponseComplete);
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

  // Handle advisor-specific voice commands
  const handleAdvisorVoiceCommand = (command) => {
    switch (command.action) {
      case 'CREATE_ADVISOR':
        if (command.value) {
          const advisorData = {
            name: command.value,
            role: 'New Advisor',
            avatar_emoji: '👤',
            expertise: [],
            personality: {
              traits: [],
              communication_style: 'professional'
            }
          };
          
          // Emit create advisor event
          if (onAdvisorUpdate) {
            onAdvisorUpdate({ type: 'CREATE', data: advisorData });
          }
          
          respondToUser(`I'll help you create a new advisor named ${command.value}. What role should they have?`);
        }
        break;

      case 'EDIT_ADVISOR':
        if (command.value) {
          const advisor = findAdvisorByName(command.value);
          if (advisor) {
            openaiRealtimeService.setAdvisorContext(advisor);
            if (onAdvisorUpdate) {
              onAdvisorUpdate({ type: 'SELECT_FOR_EDIT', data: advisor });
            }
            respondToUser(`I'll help you edit ${advisor.name}. What would you like to change?`);
          } else {
            respondToUser(`I couldn't find an advisor named ${command.value}. Please check the name and try again.`);
          }
        }
        break;

      case 'DELETE_ADVISOR':
        if (command.value) {
          const advisor = findAdvisorByName(command.value);
          if (advisor) {
            if (onAdvisorUpdate) {
              onAdvisorUpdate({ type: 'DELETE', data: advisor });
            }
            respondToUser(`I'll delete the advisor ${advisor.name}. Are you sure you want to proceed?`);
          }
        }
        break;

      case 'UPDATE_FIELD':
        if (currentAdvisor && command.field && command.value) {
          const updatedAdvisor = { ...currentAdvisor };
          
          if (command.field === 'communication_style') {
            updatedAdvisor.personality = {
              ...updatedAdvisor.personality,
              communication_style: command.value
            };
          } else {
            updatedAdvisor[command.field] = command.value;
          }
          
          if (onAdvisorUpdate) {
            onAdvisorUpdate({ type: 'UPDATE', data: updatedAdvisor });
          }
          
          respondToUser(`I've updated the ${command.field} to ${command.value}.`);
        }
        break;

      case 'ADD_EXPERTISE':
        if (currentAdvisor && command.value) {
          const updatedAdvisor = {
            ...currentAdvisor,
            expertise: [...(currentAdvisor.expertise || []), command.value]
          };
          
          if (onAdvisorUpdate) {
            onAdvisorUpdate({ type: 'UPDATE', data: updatedAdvisor });
          }
          
          respondToUser(`I've added ${command.value} to the expertise list.`);
        }
        break;

      case 'ADD_TRAIT':
        if (currentAdvisor && command.value) {
          const updatedAdvisor = {
            ...currentAdvisor,
            personality: {
              ...currentAdvisor.personality,
              traits: [...(currentAdvisor.personality?.traits || []), command.value]
            }
          };
          
          if (onAdvisorUpdate) {
            onAdvisorUpdate({ type: 'UPDATE', data: updatedAdvisor });
          }
          
          respondToUser(`I've added ${command.value} as a personality trait.`);
        }
        break;

      case 'SAVE_ADVISOR':
        if (currentAdvisor) {
          if (onAdvisorUpdate) {
            onAdvisorUpdate({ type: 'SAVE', data: currentAdvisor });
          }
          respondToUser(`I've saved the changes to ${currentAdvisor.name}.`);
        }
        break;

      case 'CANCEL':
        if (onAdvisorUpdate) {
          onAdvisorUpdate({ type: 'CANCEL' });
        }
        respondToUser('Operation cancelled.');
        break;

      default:
        logger.debug('Unhandled voice command:', command);
    }
  };

  // Find advisor by name (fuzzy matching)
  const findAdvisorByName = (name) => {
    if (!state.advisors) return null;
    
    const searchName = name.toLowerCase();
    return state.advisors.find(advisor => 
      advisor.name.toLowerCase().includes(searchName) ||
      searchName.includes(advisor.name.toLowerCase())
    );
  };

  // Respond to user with text and voice
  const respondToUser = (message) => {
    setLastResponse(message);
    
    // Generate audio response
    if (isConnected) {
      openaiRealtimeService.generateAdvisorResponse(message);
    }
  };

  // Play audio response
  const playAudioResponse = () => {
    if (audioChunks.current.length === 0) return;

    try {
      // Combine audio chunks
      const totalLength = audioChunks.current.reduce((sum, chunk) => sum + chunk.length, 0);
      const combinedAudio = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of audioChunks.current) {
        combinedAudio.set(chunk, offset);
        offset += chunk.length;
      }

      // Convert to audio blob
      const audioBlob = new Blob([combinedAudio], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.play().then(() => {
          setIsSpeaking(true);
        }).catch(err => {
          logger.error('Failed to play audio:', err);
        });
      }
      
      // Clear audio chunks
      audioChunks.current = [];
      
    } catch (error) {
      logger.error('Failed to play audio response:', error);
    }
  };

  // Connect to OpenAI Realtime
  const handleConnect = async () => {
    try {
      if (!apiKey) {
        setError('Please enter your OpenAI API key');
        return;
      }
      
      await openaiRealtimeService.initialize(apiKey);
      await openaiRealtimeService.connect();
    } catch (err) {
      setError(err.message);
    }
  };

  // Disconnect from service
  const handleDisconnect = () => {
    openaiRealtimeService.disconnect();
  };

  // Toggle recording
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
    <div className="fixed top-20 right-4 bg-white rounded-lg shadow-xl border p-4 min-w-80 max-w-96 z-[60] border-blue-200">
      <audio 
        ref={audioRef} 
        onEnded={() => setIsSpeaking(false)}
        onError={() => setIsSpeaking(false)}
      />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Mic className="w-5 h-5 mr-2 text-blue-600" />
          Voice Advisor Control
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenAI API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      )}

      {/* Status */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          {currentAdvisor && (
            <span className="text-sm text-blue-600">
              • Editing: {currentAdvisor.name}
            </span>
          )}
        </div>
        
        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center space-x-3 mb-4">
        <button
          onClick={toggleRecording}
          disabled={!isConnected && !apiKey}
          className={`p-3 rounded-full transition-colors ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>

        <button
          onClick={isConnected ? handleDisconnect : handleConnect}
          disabled={!apiKey && !isConnected}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>

        {isSpeaking && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Volume2 className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Speaking...</span>
          </div>
        )}
      </div>

      {/* Transcript */}
      {currentTranscript && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-blue-800 mb-1">
            You said:
          </label>
          <p className="text-sm text-blue-700">{currentTranscript}</p>
        </div>
      )}

      {/* Last Response */}
      {lastResponse && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <label className="block text-sm font-medium text-green-800 mb-1">
            Assistant:
          </label>
          <p className="text-sm text-green-700">{lastResponse}</p>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p><strong>Voice Commands:</strong></p>
        <p>• "Create new advisor named [name]"</p>
        <p>• "Edit advisor [name]"</p>
        <p>• "Change the role to [role]"</p>
        <p>• "Add expertise [skill]"</p>
        <p>• "Save the advisor"</p>
      </div>
    </div>
  );
}