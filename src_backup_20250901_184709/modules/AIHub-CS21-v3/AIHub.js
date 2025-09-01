// V19-style AI Hub - Clean without module container
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Settings, FileText, Users, X, Plus
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useVoice } from '../../contexts/VoiceContext';
import aiService from '../../services/aiService';

export default function AIHub() {
  const { state, dispatch } = useAppState();
  const { isListening, startListening, stopListening, transcript } = useVoice();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAdvisors, setActiveAdvisors] = useState([]);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(false);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const advisors = [
    { id: '1', name: 'Sarah Chen', role: 'Chief Strategy Officer', avatar: '👩‍💼' },
    { id: '2', name: 'Marcus Johnson', role: 'CFO', avatar: '👨‍💼' },
    { id: '3', name: 'Emily Rodriguez', role: 'CMO', avatar: '👩‍🎨' }
  ];

  useEffect(() => {
    // Initialize with first advisor
    if (advisors.length > 0 && activeAdvisors.length === 0) {
      setActiveAdvisors([advisors[0]]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.conversationMessages, streamingMessage]);

  useEffect(() => {
    if (transcript && isListening) {
      setMessage(transcript);
    }
  }, [transcript, isListening]);

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    setMessage('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      let fullResponse = '';
      const response = await aiService.sendMessage(message, activeAdvisors[0], {
        conversationHistory: state.conversationMessages || [],
        documents: [],
        stream: false
      });
      fullResponse = response;

      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: fullResponse,
        advisor: activeAdvisors[0],
        timestamp: new Date().toISOString()
      };

      dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold">Live Advisory Session</h2>
              {activeAdvisors.length > 0 && (
                <span className="text-sm text-gray-500">
                  Active in meeting: {activeAdvisors.map(a => a.name).join(', ')}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdvisorPanel(!showAdvisorPanel)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <Users className="w-4 h-4 inline mr-1" />
                Advisors
              </button>
              <button
                onClick={() => setShowDocumentPanel(!showDocumentPanel)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                <FileText className="w-4 h-4 inline mr-1" />
                Documents
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-1.5 border border-gray-300 rounded hover:bg-gray-50"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.conversationMessages?.length === 0 && !streamingMessage ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Start by asking a question or sharing a business challenge</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {state.conversationMessages?.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xl">{msg.advisor?.avatar}</span>
                        <span className="text-sm font-medium text-gray-700">{msg.advisor?.name}</span>
                        <span className="text-xs text-gray-500">{msg.advisor?.role}</span>
                      </div>
                    )}
                    
                    <div className={`px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              
              {streamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-2xl">
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-500">AI is typing...</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-900">
                      <p className="whitespace-pre-wrap">{streamingMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`p-2 rounded ${
                isListening
                  ? 'bg-red-100 text-red-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              className={`px-4 py-2 rounded-lg ${
                message.trim() && !isLoading
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Advisor Panel */}
      {showAdvisorPanel && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Select Advisors</h3>
            <button onClick={() => setShowAdvisorPanel(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            {advisors.map((advisor) => (
              <label key={advisor.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={activeAdvisors.some(a => a.id === advisor.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setActiveAdvisors([...activeAdvisors, advisor]);
                    } else {
                      setActiveAdvisors(activeAdvisors.filter(a => a.id !== advisor.id));
                    }
                  }}
                  className="rounded text-blue-600"
                />
                <span className="text-xl">{advisor.avatar}</span>
                <div>
                  <p className="text-sm font-medium">{advisor.name}</p>
                  <p className="text-xs text-gray-500">{advisor.role}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Document Panel */}
      {showDocumentPanel && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Documents</h3>
            <button onClick={() => setShowDocumentPanel(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          {state.documents?.length > 0 ? (
            <div className="space-y-2">
              {state.documents.map((doc) => (
                <div key={doc.id} className="p-2 bg-gray-50 rounded flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm truncate">{doc.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No documents</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}