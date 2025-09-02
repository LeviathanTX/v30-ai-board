// src/modules/AIHub-CS21-v2/AIHub-minimal-fix.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Settings, FileText, Users, X, Plus,
  Upload, Eye, EyeOff, Check, AlertCircle, User, Download,
  MessageSquare, Sparkles, Save, RefreshCw, Play, Square,
  Calendar, Clock, UserCheck, Paperclip
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useVoice } from '../../contexts/VoiceContext';
import aiService from '../../services/aiService';

export default function AIHub() {
  const { state, dispatch, actions } = useAppState();
  const { isListening, startListening, stopListening, transcript } = useVoice();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(false);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize with greeting - only once
  useEffect(() => {
    if (!hasGreeted && state.conversationMessages?.length === 0 && state.advisors?.length > 0) {
      setHasGreeted(true);
      const meetingHost = state.advisors.find(a => a.isHost || a.name === 'Meeting Host') || state.advisors[0];
      
      const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Welcome to your AI Board of Advisors! I'm ${meetingHost.name}, and I'll help facilitate your strategic discussions today. What would you like to discuss?`,
        advisor: meetingHost,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: actions.ADD_MESSAGE, payload: welcomeMessage });
    }
  }, [state.conversationMessages, state.advisors, hasGreeted, dispatch, actions]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.conversationMessages, streamingMessage]);

  // Update message from voice transcript
  useEffect(() => {
    if (transcript && isListening) {
      setMessage(transcript);
    }
  }, [transcript, isListening]);

  const advisors = state.advisors || [];

  const getDocumentContext = () => {
    const selectedDocs = state.meetingDocuments || [];
    if (selectedDocs.length === 0) return '';

    return selectedDocs.map(doc => {
      const content = doc.extractedData ? 
        `Document: ${doc.name}
Summary: ${doc.extractedData.summary || 'No summary available'}
Key Points: ${doc.extractedData.keywords?.map(k => k.word).join(', ') || 'None identified'}` :
        `Document: ${doc.name}\nContent: ${(doc.content || '').substring(0, 500)}...`;
      
      return content;
    }).join('\n\n---\n\n');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return;

    const documentContext = getDocumentContext();
    const selectedDocIds = state.meetingDocuments?.map(d => d.id) || [];

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
      documents: selectedDocIds
    };

    dispatch({ type: actions.ADD_MESSAGE, payload: userMessage });
    setMessage('');
    setIsLoading(true);
    setStreamingMessage('');

    try {
      // Add document context to the message if documents are selected
      const enhancedMessage = documentContext ? 
        `${message}\n\n[Context from uploaded documents:\n${documentContext}]` : 
        message;

      // Board meeting mode - all advisors can respond
      const responses = await aiService.conductBoardMeeting(
        enhancedMessage,
        advisors,
        state.meetingDocuments || [],
        { 
          rounds: 1,
          includeDocumentAnalysis: true
        }
      );
      
      responses.forEach(response => {
        const aiMessage = {
          id: `ai-${response.id}`,
          role: 'assistant',
          content: response.content,
          advisor: {
            id: response.advisorId,
            name: response.advisorName,
            role: response.advisorRole,
            avatar_emoji: response.advisorEmoji
          },
          timestamp: response.timestamp,
          referencedDocuments: response.referencedDocuments
        };
        dispatch({ type: actions.ADD_MESSAGE, payload: aiMessage });
      });

      setStreamingMessage('');
    } catch (error) {
      logger.error('Error sending message:', error);
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `Error: ${error.message || 'Failed to get AI response. Please check your API key.'}`,
          type: 'error'
        }
      });
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

  const exportConversation = () => {
    const messages = state.conversationMessages || [];
    let content = `AI Board of Advisors - Conversation Export
Generated: ${new Date().toLocaleString()}
Documents: ${state.meetingDocuments?.length || 0} attached

${'='.repeat(60)}

`;
    
    messages.forEach(msg => {
      const speaker = msg.role === 'user' ? 'You' : `${msg.advisor?.name || 'AI'} (${msg.advisor?.role || 'Advisor'})`;
      content += `${speaker}: ${msg.content}\n`;
      content += `Time: ${new Date(msg.timestamp).toLocaleTimeString()}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-board-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return Paperclip;
    if (fileType.includes('image')) return Eye;
    if (fileType.includes('pdf')) return FileText;
    return Paperclip;
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">AI Board Meeting</h1>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={exportConversation}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Export conversation"
            >
              <Download size={20} className="text-gray-600" />
            </button>
            
            {/* Documents Pill */}
            <button
              onClick={() => setShowDocumentPanel(!showDocumentPanel)}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-2 transition-colors ${
                showDocumentPanel 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FileText size={16} />
              <span className="text-sm font-medium">Documents</span>
              {state.meetingDocuments?.length > 0 && (
                <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {state.meetingDocuments.length}
                </span>
              )}
            </button>
            
            {/* Advisors Pill */}
            <button
              onClick={() => setShowAdvisorPanel(!showAdvisorPanel)}
              className={`px-3 py-1.5 rounded-full flex items-center space-x-2 transition-colors ${
                showAdvisorPanel 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={16} />
              <span className="text-sm font-medium">Advisors</span>
              {advisors.length > 0 && (
                <span className="bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5">
                  {advisors.length}
                </span>
              )}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title="Settings"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {state.conversationMessages?.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-2xl">{msg.advisor?.avatar_emoji || '🤖'}</span>
                      <span className="text-sm font-medium text-gray-700">
                        {msg.advisor?.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {msg.advisor?.role}
                      </span>
                    </div>
                  )}
                  
                  <div className={`rounded-lg px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.documents?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.documents.map(docId => {
                          const doc = state.documents.find(d => d.id === docId);
                          if (!doc) return null;
                          return (
                            <span
                              key={docId}
                              className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
                                msg.role === 'user'
                                  ? 'bg-blue-700 text-blue-100'
                                  : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              <FileText size={12} />
                              <span>{doc.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  <span className="text-xs text-gray-500 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="mb-4 flex justify-start">
                <div className="rounded-lg px-4 py-2 bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm text-gray-600">
                      Advisors are discussing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-end space-x-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your question for the board..."
                  className="w-full px-4 py-2 pr-12 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900 placeholder-gray-500"
                  rows="3"
                />
                
                {/* Voice Input Button */}
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`absolute bottom-2 right-2 p-1.5 rounded-lg transition-colors ${
                    isListening
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'hover:bg-gray-200 text-gray-600'
                  }`}
                  title={isListening ? "Stop listening" : "Start voice input"}
                >
                  {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
              </div>
              
              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  message.trim() && !isLoading
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                <Send size={20} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Document Panel */}
        {showDocumentPanel && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Meeting Documents</h3>
                <button
                  onClick={() => setShowDocumentPanel(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {state.meetingDocuments?.length > 0 ? (
                <div className="space-y-2">
                  {state.meetingDocuments.map(doc => {
                    const FileIcon = getFileIcon(doc.type);
                    
                    return (
                      <div
                        key={doc.id}
                        className="p-3 rounded-lg bg-gray-50"
                      >
                        <div className="flex items-start space-x-3">
                          <FileIcon size={20} className="text-gray-500" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900">
                              {doc.name}
                            </p>
                            {doc.analysis?.summary && (
                              <p className="text-xs mt-1 line-clamp-2 text-gray-600">
                                {doc.analysis.summary}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500 mb-3">
                    No documents in this meeting
                  </p>
                  <button
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('navigate-module', { detail: 'documents' }));
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Go to Document Hub
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Advisor Panel */}
        {showAdvisorPanel && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Board Advisors</h3>
                <button
                  onClick={() => setShowAdvisorPanel(false)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {advisors.map(advisor => (
                <div
                  key={advisor.id}
                  className="p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-3xl">{advisor.avatar_emoji}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {advisor.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {advisor.role}
                      </p>
                      {advisor.expertise && advisor.expertise.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {advisor.expertise.slice(0, 3).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate-module', { detail: 'advisors' }));
                }}
                className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
              >
                Manage Advisors
              </button>
            </div>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className="w-80 bg-white border-l border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Response Style
                </label>
                <select className="mt-1 w-full px-3 py-2 rounded-lg border bg-white border-gray-300">
                  <option>Professional</option>
                  <option>Conversational</option>
                  <option>Technical</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Auto-save Conversations
                </label>
                <div className="mt-1">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span className="ml-2 text-sm text-gray-600">
                      Save conversation history
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}