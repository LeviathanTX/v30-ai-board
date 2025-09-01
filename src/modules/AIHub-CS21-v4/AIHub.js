// V21 AI Hub with recovered features from V18/V19
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Settings, FileText, Users, X, Plus,
  Upload, Eye, EyeOff, Check, AlertCircle, User, Download
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
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(true);
  const [showDocumentPanel, setShowDocumentPanel] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Including Meeting Host in advisors
  const advisors = [
    { 
      id: 'host', 
      name: 'Meeting Host', 
      role: 'AI Board Facilitator', 
      avatar: '🎯',
      isHost: true,
      expertise: ['Meeting Facilitation', 'Strategic Planning'],
      personality: { traits: ['professional', 'organized'] }
    },
    { 
      id: '1', 
      name: 'Sarah Chen', 
      role: 'Chief Strategy Officer', 
      avatar: '👩‍💼',
      expertise: ['Strategic Planning', 'Market Analysis'],
      personality: { traits: ['analytical', 'visionary'] }
    },
    { 
      id: '2', 
      name: 'Marcus Johnson', 
      role: 'CFO', 
      avatar: '💰',
      expertise: ['Financial Planning', 'Risk Management'],
      personality: { traits: ['detail-oriented', 'conservative'] }
    },
    { 
      id: '3', 
      name: 'Emily Rodriguez', 
      role: 'CMO', 
      avatar: '📈',
      expertise: ['Brand Strategy', 'Digital Marketing'],
      personality: { traits: ['creative', 'enthusiastic'] }
    }
  ];

  // Check API key on mount
  useEffect(() => {
    const savedKey = localStorage.getItem('claude_api_key');
    if (!savedKey && !aiService.hasApiKey()) {
      setShowApiKey(true);
    }
  }, []);

  // Initialize with host
  useEffect(() => {
    if (advisors.length > 0 && activeAdvisors.length === 0) {
      const host = advisors.find(a => a.isHost);
      if (host) {
        setActiveAdvisors([host]);
      }
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

  const validateApiKey = (key) => {
    if (!key || !key.trim()) {
      return 'API key is required';
    }
    if (!key.startsWith('sk-ant-')) {
      return 'API key should start with "sk-ant-"';
    }
    return '';
  };

  const saveApiKey = () => {
    const error = validateApiKey(tempApiKey);
    
    if (error) {
      setApiKeyError(error);
      return;
    }

    // Save to localStorage
    localStorage.setItem('claude_api_key', tempApiKey);
    setTempApiKey('');
    setApiKeySaved(true);
    setApiKeyError('');
    setShowApiKey(false);
    
    // Clear success message after 3 seconds
    setTimeout(() => setApiKeySaved(false), 3000);
  };

  const startMeeting = async () => {
    if (meetingStarted) return;
    
    setMeetingStarted(true);
    
    const host = advisors.find(a => a.isHost);
    if (!host || !activeAdvisors.includes(host)) return;

    // Host greeting
    const hostMessage = {
      id: Date.now(),
      role: 'assistant',
      content: `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} everyone! Welcome to today's AI Board Advisory meeting.

I'm ${host.name}, your meeting facilitator. ${activeAdvisors.length > 1 ? `Joining us today are ${activeAdvisors.filter(a => !a.isHost).map(a => `${a.name} (${a.role})`).join(', ')}.` : ''}

Before we begin, could you please share:
• What are your primary objectives for today's meeting?
• Any specific challenges or opportunities you'd like to discuss?
• Are there particular documents you'd like us to review?

How would you like to start?`,
      advisor: host,
      timestamp: new Date().toISOString()
    };

    dispatch({ type: 'ADD_MESSAGE', payload: hostMessage });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Check if API key exists
    if (!aiService.hasApiKey() && !localStorage.getItem('claude_api_key')) {
      setShowApiKey(true);
      return;
    }

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

    // Start meeting on first message if not started
    if (!meetingStarted && activeAdvisors.find(a => a.isHost)) {
      await startMeeting();
    }

    try {
      // Get responses from all active advisors
      for (const advisor of activeAdvisors) {
        const response = await aiService.sendMessage(message, advisor, {
          conversationHistory: state.conversationMessages || [],
          documents: state.documents || [],
          stream: false
        });

        const aiMessage = {
          id: Date.now() + Math.random(),
          role: 'assistant',
          content: response,
          advisor: advisor,
          timestamp: new Date().toISOString()
        };

        dispatch({ type: 'ADD_MESSAGE', payload: aiMessage });
      }
    } catch (error) {
      logger.error('Error sending message:', error);
      dispatch({
        type: 'ADD_NOTIFICATION',
        payload: {
          message: 'Error getting AI response. Please check your API key.',
          type: 'error'
        }
      });
    } finally {
      setIsLoading(false);
      setStreamingMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Pass to document module
    for (const file of files) {
      const tempDoc = {
        id: `temp_${Date.now()}_${file.name}`,
        name: file.name,
        type: file.type,
        size: file.size,
        created_at: new Date().toISOString()
      };
      
      dispatch({ type: 'ADD_DOCUMENT', payload: tempDoc });
    }

    // Clear the input
    event.target.value = '';
    
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        message: `${files.length} file(s) added to documents`,
        type: 'success'
      }
    });
  };

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header with API Key Bar */}
        <div>
          {/* API Key Bar (if needed) */}
          {showApiKey && !aiService.hasApiKey() && !localStorage.getItem('claude_api_key') && (
            <div className="bg-orange-100 border-b border-orange-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <AlertCircle className="text-orange-600" size={20} />
                  <span className="text-sm text-orange-800">Claude API key required for AI responses</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={tempApiKey}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      onClick={saveApiKey}
                      className="px-3 py-1 text-sm bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                      Save
                    </button>
                  </div>
                  {apiKeyError && (
                    <span className="text-xs text-red-600">{apiKeyError}</span>
                  )}
                  {apiKeySaved && (
                    <span className="text-xs text-green-600 flex items-center">
                      <Check size={14} className="mr-1" />
                      Saved!
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowApiKey(false)}
                  className="text-orange-600 hover:text-orange-800"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Regular Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h2 className="text-lg font-semibold">AI Board Meeting</h2>
                {meetingStarted && (
                  <span className="text-sm text-gray-500">
                    Meeting in progress • {activeAdvisors.map(a => a.name).join(', ')}
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
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {state.conversationMessages?.length === 0 && !streamingMessage ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to your AI Board Meeting</h3>
                <p className="text-gray-500 mb-6">
                  Select advisors and start a conversation. You can also upload documents for context.
                </p>
                {!meetingStarted && activeAdvisors.find(a => a.isHost) && (
                  <button
                    onClick={startMeeting}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Start Meeting
                  </button>
                )}
              </div>
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

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileUpload}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.png,.jpg,.jpeg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-gray-600"
              title="Upload documents"
            >
              <Upload className="w-5 h-5" />
            </button>

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
            <h3 className="font-semibold">Advisors</h3>
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
                  {advisor.isHost && (
                    <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">Host</span>
                  )}
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button onClick={() => setShowDocumentPanel(false)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          {state.documents?.length > 0 ? (
            <div className="space-y-2">
              {state.documents.map((doc) => (
                <div key={doc.id} className="p-2 bg-gray-50 rounded flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm truncate flex-1">{doc.name}</span>
                  {doc.analysis && (
                    <Check className="w-4 h-4 text-green-500" title="Analyzed" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <FileText className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No documents</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700"
              >
                Upload files
              </button>
            </div>
          )}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="absolute top-16 right-6 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Settings</h3>
            <button onClick={() => setShowSettings(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="password"
                  value={localStorage.getItem('claude_api_key') || ''}
                  readOnly
                  className="flex-1 px-3 py-2 text-sm border rounded bg-gray-50"
                />
                <button
                  onClick={() => {
                    localStorage.removeItem('claude_api_key');
                    setShowApiKey(true);
                    setShowSettings(false);
                  }}
                  className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
                >
                  Clear
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Meeting Options
              </label>
              <label className="flex items-center space-x-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">Include Meeting Host</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Export
              </label>
              <button
                onClick={() => {
                  const content = state.conversationMessages?.map(msg => 
                    `${msg.role === 'user' ? 'You' : msg.advisor?.name || 'AI'}: ${msg.content}`
                  ).join('\n\n');
                  
                  const blob = new Blob([content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `ai-board-meeting-${new Date().toISOString().split('T')[0]}.txt`;
                  a.click();
                }}
                className="flex items-center space-x-2 px-3 py-2 text-sm border rounded hover:bg-gray-50"
              >
                <Download size={16} />
                <span>Export Conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}