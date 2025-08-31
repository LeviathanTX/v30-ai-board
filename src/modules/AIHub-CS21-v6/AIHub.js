// V21 AI Hub v6 - Enhanced with Start/Stop Meeting functionality
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Settings, FileText, Users, X, Plus,
  Upload, Eye, EyeOff, Check, AlertCircle, User, Download,
  MessageSquare, Sparkles, Save, RefreshCw, Play, Square,
  Calendar, Clock, UserCheck
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useVoice } from '../../contexts/VoiceContext';
import aiService from '../../services/aiService';

export default function AIHub() {
  const { state, dispatch, actions } = useAppState();
  const { isListening, startListening, stopListening, transcript } = useVoice();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeAdvisors, setActiveAdvisors] = useState([]);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(true);
  const [showDocumentPanel, setShowDocumentPanel] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [meetingActive, setMeetingActive] = useState(false);
  const [meetingStartTime, setMeetingStartTime] = useState(null);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [tempApiKey, setTempApiKey] = useState('');
  const [apiKeyError, setApiKeyError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const meetingTimerRef = useRef(null);

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

  // Timer for meeting duration
  useEffect(() => {
    if (meetingActive && meetingStartTime) {
      meetingTimerRef.current = setInterval(() => {
        const duration = Math.floor((Date.now() - meetingStartTime) / 1000);
        setMeetingDuration(duration);
      }, 1000);
    } else {
      if (meetingTimerRef.current) {
        clearInterval(meetingTimerRef.current);
      }
    }
    return () => {
      if (meetingTimerRef.current) {
        clearInterval(meetingTimerRef.current);
      }
    };
  }, [meetingActive, meetingStartTime]);

  // Format meeting duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    dispatch({ 
      type: actions.ADD_NOTIFICATION, 
      payload: { 
        message: `${files.length} file(s) selected. Please use the Document Hub to upload and process files.`,
        type: 'info'
      }
    });
  };

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

    localStorage.setItem('claude_api_key', tempApiKey);
    aiService.setApiKey(tempApiKey);
    setTempApiKey('');
    setApiKeySaved(true);
    setApiKeyError('');
    setShowApiKey(false);
    
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: { 
        message: 'API key saved successfully!',
        type: 'success'
      }
    });
  };

  const toggleAdvisor = (advisor) => {
    setActiveAdvisors(prev => {
      const isActive = prev.some(a => a.id === advisor.id);
      if (isActive) {
        // Don't remove if it's the only advisor
        if (prev.length === 1) return prev;
        return prev.filter(a => a.id !== advisor.id);
      } else {
        return [...prev, advisor];
      }
    });
  };

  const startMeeting = async () => {
    setMeetingActive(true);
    setMeetingStartTime(Date.now());
    setMeetingDuration(0);
    
    // Create a new conversation
    const newConversation = {
      id: `meeting_${Date.now()}`,
      title: `Board Meeting - ${new Date().toLocaleDateString()}`,
      advisors: activeAdvisors,
      startTime: new Date().toISOString(),
      messages: []
    };
    
    dispatch({ type: actions.ADD_CONVERSATION, payload: newConversation });
    dispatch({ type: actions.SET_ACTIVE_CONVERSATION, payload: newConversation });
    
    // Host opens the meeting
    const host = activeAdvisors.find(a => a.isHost);
    if (host) {
      const openingMessage = {
        id: Date.now(),
        role: 'assistant',
        advisor: host,
        content: `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} everyone. Welcome to today's AI Board Advisory meeting.

I'm ${host.name}, your meeting facilitator. ${activeAdvisors.length > 1 ? `We have ${activeAdvisors.filter(a => !a.isHost).map(a => `${a.name} (${a.role})`).join(', ')} joining us today.` : ''}

The meeting has officially started. What topics would you like to discuss today?`,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: actions.ADD_MESSAGE, payload: openingMessage });
    }
    
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: { 
        message: 'Meeting started successfully',
        type: 'success'
      }
    });
  };

  const stopMeeting = async () => {
    const duration = formatDuration(meetingDuration);
    
    // Host closes the meeting
    const host = activeAdvisors.find(a => a.isHost);
    if (host) {
      const closingMessage = {
        id: Date.now(),
        role: 'assistant',
        advisor: host,
        content: `Thank you all for your valuable insights today. This concludes our board meeting.

Meeting Duration: ${duration}
Total Messages: ${state.conversationMessages.length}
Participating Advisors: ${activeAdvisors.map(a => a.name).join(', ')}

The meeting summary and action items will be available in your meeting history. Have a productive day!`,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: actions.ADD_MESSAGE, payload: closingMessage });
    }
    
    setMeetingActive(false);
    setMeetingStartTime(null);
    setMeetingDuration(0);
    
    // Update conversation with end time
    if (state.activeConversation) {
      dispatch({
        type: actions.UPDATE_CONVERSATION,
        payload: {
          ...state.activeConversation,
          endTime: new Date().toISOString(),
          duration: meetingDuration
        }
      });
    }
    
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: { 
        message: `Meeting ended. Duration: ${duration}`,
        type: 'info'
      }
    });
  };

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;

    // Check API key
    const savedKey = localStorage.getItem('claude_api_key');
    if (!savedKey && !aiService.hasApiKey()) {
      setShowApiKey(true);
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    dispatch({ type: actions.ADD_MESSAGE, payload: userMessage });
    setMessage('');
    setIsLoading(true);

    try {
      // Get response from active advisors
      const respondingAdvisors = activeAdvisors.length > 0 ? activeAdvisors : [advisors[0]];
      
      for (const advisor of respondingAdvisors) {
        let responseContent = '';
        
        if (state.conversationMessages.length === 0 && !meetingActive) {
          responseContent = `Hello! I'm ${advisor.name}, your ${advisor.role}. ${advisor.isHost ? "I can facilitate today's advisory session. " : ''}I'm here to help with ${advisor.expertise.join(', ').toLowerCase()}. How can I assist you today?`;
        } else {
          // Get actual AI response
          const stream = await aiService.streamMessage(
            userMessage.content,
            advisor,
            state.conversationMessages,
            state.selectedDocument
          );

          for await (const chunk of stream) {
            responseContent += chunk;
            setStreamingMessage(responseContent);
          }
        }

        const advisorMessage = {
          id: Date.now() + Math.random(),
          role: 'assistant',
          advisor: advisor,
          content: responseContent,
          timestamp: new Date().toISOString()
        };

        dispatch({ type: actions.ADD_MESSAGE, payload: advisorMessage });
        setStreamingMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: { 
          message: 'Failed to get AI response. Please check your API key.',
          type: 'error'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportConversation = () => {
    const content = state.conversationMessages.map(msg => {
      if (msg.role === 'user') {
        return `User: ${msg.content}`;
      } else {
        return `${msg.advisor?.name || 'AI'}: ${msg.content}`;
      }
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-board-meeting-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Sidebar - Advisors */}
      {showAdvisorPanel && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users size={18} />
                Advisors
              </span>
              <button 
                onClick={() => setShowAdvisorPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {advisors.map(advisor => (
                <button
                  key={advisor.id}
                  onClick={() => toggleAdvisor(advisor)}
                  className={`w-full p-3 rounded-lg border transition-all ${
                    activeAdvisors.some(a => a.id === advisor.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{advisor.avatar}</span>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{advisor.name}</div>
                      <div className="text-sm text-gray-500">{advisor.role}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header with Meeting Controls */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Board Meeting</h1>
                <p className="text-gray-600 mt-1">
                  {activeAdvisors.length} advisor{activeAdvisors.length !== 1 ? 's' : ''} active
                  {meetingActive && ` • Meeting in progress`}
                </p>
              </div>
              
              {/* Meeting Status */}
              {meetingActive && (
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{formatDuration(meetingDuration)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Meeting Controls */}
              {!meetingActive ? (
                <button
                  onClick={startMeeting}
                  disabled={activeAdvisors.length === 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Play size={18} />
                  Start Meeting
                </button>
              ) : (
                <button
                  onClick={stopMeeting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <Square size={18} />
                  End Meeting
                </button>
              )}
              
              {!showAdvisorPanel && (
                <button
                  onClick={() => setShowAdvisorPanel(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Users size={18} />
                  Show Advisors
                </button>
              )}
              
              {!showDocumentPanel && (
                <button
                  onClick={() => setShowDocumentPanel(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileText size={18} />
                  Show Documents
                </button>
              )}
              
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {state.conversationMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {meetingActive ? 'Meeting Started' : 'Start Your AI Board Meeting'}
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                {meetingActive 
                  ? 'The meeting is now in session. Share your topics or questions.'
                  : 'Click "Start Meeting" to begin a formal board session, or just start chatting with your advisors.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {state.conversationMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'assistant' && msg.advisor && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{msg.advisor.avatar}</span>
                        <span className="font-medium text-gray-700">{msg.advisor.name}</span>
                        <span className="text-sm text-gray-500">• {msg.advisor.role}</span>
                      </div>
                    )}
                    <div className={`rounded-lg px-4 py-2 ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white border border-gray-200'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {streamingMessage && (
                <div className="flex justify-start">
                  <div className="max-w-2xl">
                    <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                      <p className="whitespace-pre-wrap">{streamingMessage}</p>
                      <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
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
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder={meetingActive ? "Share your thoughts with the board..." : "Type your message..."}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            
            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Upload Document"
            >
              <Upload size={20} />
            </button>
            
            {/* Voice Button */}
            <button
              onClick={() => isListening ? stopListening() : startListening()}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {isListening ? <Mic size={20} /> : <MicOff size={20} />}
            </button>
            
            <button
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <Send size={18} />
              )}
              <span>Send</span>
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 mt-3">
            <button 
              onClick={exportConversation}
              disabled={state.conversationMessages.length === 0}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 disabled:opacity-50"
            >
              <Download size={16} />
              Export
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <Save size={16} />
              Save Meeting
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <Sparkles size={16} />
              Generate Summary
            </button>
            <button className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1">
              <Calendar size={16} />
              Schedule Next
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Documents */}
      {showDocumentPanel && (
        <div className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText size={18} />
                Documents
              </span>
              <button 
                onClick={() => setShowDocumentPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {(state.documents || []).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No documents uploaded</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Upload Document
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {state.documents.map(doc => (
                  <div 
                    key={doc.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      state.selectedDocument?.id === doc.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => dispatch({ type: actions.SELECT_DOCUMENT, payload: doc })}
                  >
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {doc.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {doc.status === 'ready' ? 'Ready' : 'Processing...'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
      />

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">AI Board Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Claude API Key
                  </label>
                  <div className="flex gap-2">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={tempApiKey || localStorage.getItem('claude_api_key') || ''}
                      onChange={(e) => setTempApiKey(e.target.value)}
                      placeholder="sk-ant-..."
                      className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="px-3 py-2 border rounded hover:bg-gray-50"
                    >
                      {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {apiKeyError && (
                    <p className="text-red-600 text-sm mt-1">{apiKeyError}</p>
                  )}
                  {apiKeySaved && (
                    <p className="text-green-600 text-sm mt-1">API key saved successfully!</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Meeting Mode
                  </label>
                  <select className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="auto">Auto (Let advisors decide)</option>
                    <option value="sequential">Sequential (One at a time)</option>
                    <option value="panel">Panel (All respond)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Response Length
                  </label>
                  <select className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="concise">Concise</option>
                    <option value="balanced">Balanced</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (tempApiKey) saveApiKey();
                    setShowSettings(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Key Required Modal */}
      {showApiKey && !showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-amber-500" size={24} />
              <h2 className="text-xl font-semibold">API Key Required</h2>
            </div>
            
            <p className="text-gray-600 mb-4">
              To use AI advisors, you need to provide your Claude API key. 
              You can get one from the Anthropic Console.
            </p>
            
            <button
              onClick={() => {
                setShowApiKey(false);
                setShowSettings(true);
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Open Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}