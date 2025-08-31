// src/contexts/VoiceContext.js
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const VoiceContext = createContext();

export function VoiceProvider({ children }) {
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [voiceError, setVoiceError] = useState(null);
  
  // const { dispatch } = useAppState(); // Not used currently
  const recognition = useRef(null);
  const synthesis = window.speechSynthesis;

  // Initialize Web Speech API
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = true;
      recognition.current.interimResults = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        
        setCurrentTranscript(transcript);
      };

      recognition.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setVoiceError(event.error);
        setIsListening(false);
      };

      recognition.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognition.current) {
        recognition.current.stop();
      }
    };
  }, []);

  // Toggle listening
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Start listening
  const startListening = () => {
    if (recognition.current) {
      try {
        recognition.current.start();
        setIsListening(true);
        setVoiceError(null);
      } catch (error) {
        console.error('Failed to start recognition:', error);
        setVoiceError('Failed to start voice input');
      }
    } else {
      setVoiceError('Speech recognition not supported');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition.current) {
      recognition.current.stop();
      setIsListening(false);
      setCurrentTranscript('');
    }
  };

  // Speak text
  const speak = (text, voiceType = 'default') => {
    if (!isVoiceEnabled || !synthesis) return;

    // Cancel any ongoing speech
    synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice properties based on advisor type
    const voices = synthesis.getVoices();
    if (voices.length > 0) {
      // Try to find a suitable voice
      let selectedVoice = voices[0];
      
      if (voiceType.includes('female') || voiceType.includes('CMO')) {
        selectedVoice = voices.find(v => v.name.includes('female') || v.name.includes('Female')) || voices[0];
      } else if (voiceType.includes('male') || voiceType.includes('CFO')) {
        selectedVoice = voices.find(v => v.name.includes('male') || v.name.includes('Male')) || voices[0];
      }
      
      utterance.voice = selectedVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthesis) {
      synthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Toggle voice output
  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (!isVoiceEnabled && synthesis) {
      synthesis.cancel();
    }
  };

  const value = {
    // State
    isListening,
    isVoiceEnabled,
    isSpeaking,
    currentTranscript,
    voiceError,
    
    // Actions
    startListening,
    stopListening,
    toggleListening,
    toggleVoice,
    speak,
    stopSpeaking
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
}

export function useVoice() {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within VoiceProvider');
  }
  return context;
}

export default VoiceContext;