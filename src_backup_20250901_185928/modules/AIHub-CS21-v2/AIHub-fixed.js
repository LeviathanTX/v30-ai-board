// src/modules/AIHub-CS21-v2/AIHub-fixed.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Users, User, Sparkles, 
  Download, Copy, Share2, Settings, ChevronDown,
  Brain, FileText, AlertCircle, CheckCircle,
  Zap, TrendingUp, Shield, BarChart3, Clock,
  MessageSquare, MoreVertical, Plus, X, Upload,
  Paperclip, File, FileImage, FileSpreadsheet,
  BookOpen, Target, Lightbulb
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useVoice } from '../../contexts/VoiceContext';
import aiService from '../../services/aiService';

export default function AIHub() {
  const { state, dispatch, actions } = useAppState();
  const { isListening, startListening, stopListening, transcript } = useVoice();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('single'); // single, board, auto
  const [selectedAdvisor, setSelectedAdvisor] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const isDarkMode = state.settings?.theme === 'dark';

  // Initialize selected advisor
  useEffect(() => {
    if (!selectedAdvisor && state.advisors?.length > 0) {
      setSelectedAdvisor(state.advisors[0]);
    }
  }, [state.advisors, selectedAdvisor]);

  // Initial welcome message - only show once
  useEffect(() => {
    if (!hasInitialized && state.conversationMessages?.length === 0 && state.advisors?.length > 0) {
      setHasInitialized(true);
      // Find the meeting host
      const meetingHost = state.advisors.find(a => a.name === 'Meeting Host') || state.advisors[0];
      
      const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Welcome to your AI Board of Advisors! I'm ${meetingHost.name}, and I'll help facilitate your strategic discussions today. 

You can:
• Ask questions to individual advisors or the entire board
• Upload documents for contextual analysis
• Switch between single advisor and board meeting modes

What would you like to discuss today?`,
        advisor: meetingHost,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: actions.ADD_MESSAGE, payload: welcomeMessage });
    }
  }, [hasInitialized, state.conversationMessages, state.advisors, dispatch, actions]);

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
      if (!doc.extractedData && !doc.content) return '';
      
      const content = doc.extractedData ? 
        `Document: ${doc.name}
Type: ${doc.type}
Summary: ${doc.extractedData.summary || 'No summary available'}
Key Points: ${doc.extractedData.keywords?.map(k => k.word).join(', ') || 'None identified'}
${doc.analysis?.insights ? `\nInsights:\n${doc.analysis.insights.map(i => `- ${i.content}`).join('\n')}` : ''}
Content Preview: ${(doc.extractedData.text || doc.content || '').substring(0, 1000)}...` :
        `Document: ${doc.name}\nContent: ${(doc.content || '').substring(0, 1000)}...`;
      
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

      if (mode === 'board') {
        // Board meeting mode - all advisors respond
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
      } else {
        // Single advisor or auto mode
        const targetAdvisor = mode === 'auto' 
          ? selectBestAdvisor(message, documentContext) 
          : selectedAdvisor;

        if (!targetAdvisor) {
          throw new Error('No advisor selected');
        }

        const response = await aiService.sendMessage(
          enhancedMessage,
          targetAdvisor,
          {
            conversationHistory: state.conversationMessages || [],
            documents: state.meetingDocuments || [],
            stream: false
          }
        );

        const aiMessage = {
          id: `ai-${Date.now() + 1}`,
          role: 'assistant',
          content: response,
          advisor: targetAdvisor,
          timestamp: new Date().toISOString()
        };

        dispatch({ type: actions.ADD_MESSAGE, payload: aiMessage });
      }
      setStreamingMessage('');
    } catch (error) {
      logger.error('Error sending message:', error);
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `Error: ${error.message || 'Failed to get AI response. Please check your API key and try again.'}`,
          type: 'error'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectBestAdvisor = (message, documentContext) => {
    // Enhanced advisor selection based on message and document content
    const combinedContext = (message + ' ' + documentContext).toLowerCase();
    
    if (combinedContext.includes('financial') || combinedContext.includes('budget') || 
        combinedContext.includes('revenue') || combinedContext.includes('profit') ||
        combinedContext.includes('cost') || combinedContext.includes('investment')) {
      return advisors.find(a => a.role === 'CFO') || advisors[0];
    }
    
    if (combinedContext.includes('marketing') || combinedContext.includes('brand') || 
        combinedContext.includes('customer') || combinedContext.includes('sales') ||
        combinedContext.includes('campaign') || combinedContext.includes('audience')) {
      return advisors.find(a => a.role === 'CMO') || advisors[0];
    }
    
    if (combinedContext.includes('strategy') || combinedContext.includes('growth') || 
        combinedContext.includes('competitive') || combinedContext.includes('market') ||
        combinedContext.includes('opportunity') || combinedContext.includes('risk')) {
      return advisors.find(a => a.role === 'Chief Strategy Officer') || advisors[0];
    }
    
    return advisors[0]; // Default to first advisor
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
Mode: ${mode.charAt(0).toUpperCase() + mode.slice(1)}
Documents: ${state.meetingDocuments?.length || 0} attached

${'='.repeat(60)}

`;
    
    messages.forEach(msg => {
      const speaker = msg.role === 'user' ? 'You' : `${msg.advisor?.name || 'AI'} (${msg.advisor?.role || 'Advisor'})`;
      content += `${speaker}: ${msg.content}\n`;
      if (msg.documents?.length > 0) {
        content += `[Attached Documents: ${msg.documents.map(docId => {
          const doc = state.documents.find(d => d.id === docId);
          return doc?.name || docId;
        }).join(', ')}]\n`;
      }
      content += `Time: ${new Date(msg.timestamp).toLocaleTimeString()}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-board-conversation-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: {
        message: 'Conversation exported successfully',
        type: 'success'
      }
    });
  };

  const generateSummary = async () => {
    const summaryPrompt = "Please provide a comprehensive executive summary of this conversation, including: 1) Key discussion points, 2) Important insights from any documents discussed, 3) Decisions made, 4) Action items and next steps. Format this as a professional board meeting summary.";
    setMessage(summaryPrompt);
    await handleSendMessage();
  };

  const extractActionItems = async () => {
    const actionPrompt = "Please extract all action items from this conversation. For each action item, specify: 1) The specific task, 2) Who it was assigned to (if mentioned), 3) Due date or timeline (if mentioned), 4) Priority level based on the discussion. Format as a numbered list.";
    setMessage(actionPrompt);
    await handleSendMessage();
  };

  const analyzeDocuments = async () => {
    if (!state.meetingDocuments || state.meetingDocuments.length === 0) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: 'Please add documents to analyze',
          type: 'warning'
        }
      });
      return;
    }
    
    const analysisPrompt = `Please provide a comprehensive analysis of the uploaded documents, focusing on:
1. Key business metrics and KPIs identified
2. Strategic opportunities and risks
3. Financial implications
4. Recommended actions based on the data
5. How these documents relate to our current discussion

Please be specific and reference actual data from the documents.`;
    setMessage(analysisPrompt);
    await handleSendMessage();
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return File;
    if (fileType.includes('image')) return FileImage;
    if (fileType.includes('sheet') || fileType.includes('excel')) return FileSpreadsheet;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  return (
    <div className={`h-full flex ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b px-6 py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                AI Board Meeting
              </h1>
              
              {/* Mode Selector */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setMode('single')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'single'
                      ? 'bg-blue-100 text-blue-700'
                      : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <User size={16} className="inline mr-1" />
                  Single Advisor
                </button>
                <button
                  onClick={() => setMode('board')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'board'
                      ? 'bg-blue-100 text-blue-700'
                      : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Users size={16} className="inline mr-1" />
                  Board Meeting
                </button>
                <button
                  onClick={() => setMode('auto')}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'auto'
                      ? 'bg-blue-100 text-blue-700'
                      : isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Sparkles size={16} className="inline mr-1" />
                  Auto Select
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={exportConversation}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                title="Export conversation"
              >
                <Download size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setShowDocumentPanel(!showDocumentPanel)}
                className={`p-2 rounded-lg ${showDocumentPanel ? 'bg-blue-100 text-blue-600' : ''} ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors relative`}
                title="Documents"
              >
                <FileText size={20} className={isDarkMode && !showDocumentPanel ? 'text-gray-400' : 'text-gray-600'} />
                {state.meetingDocuments && state.meetingDocuments.length > 0 && (
                  <span className="absolute -top-1 -right-1 text-xs bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                    {state.meetingDocuments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowAdvisorPanel(!showAdvisorPanel)}
                className={`p-2 rounded-lg ${showAdvisorPanel ? 'bg-purple-100 text-purple-600' : ''} ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                title="Advisors"
              >
                <Users size={20} className={isDarkMode && !showAdvisorPanel ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
                title="Settings"
              >
                <Settings size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-600'} />
              </button>
            </div>
          </div>

          {/* Selected Advisor (Single Mode) */}
          {mode === 'single' && selectedAdvisor && (
            <div className="mt-4 flex items-center space-x-4">
              <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Speaking with:
              </span>
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-lg">
                <span className="text-lg">{selectedAdvisor.avatar_emoji}</span>
                <span className="text-sm font-medium text-blue-700">{selectedAdvisor.name}</span>
                <span className="text-xs text-blue-600">({selectedAdvisor.role})</span>
              </div>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {state.conversationMessages?.map((msg) => (
            <div
              key={msg.id}
              className={`mb-4 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
            >
              <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-2xl">{msg.advisor?.avatar_emoji}</span>
                    <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {msg.advisor?.name}
                    </span>
                    <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                      {msg.advisor?.role}
                    </span>
                  </div>
                )}
                
                <div className={`rounded-lg px-4 py-2 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.documents?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.documents.map(docId => {
                        const doc = state.documents.find(d => d.id === docId);
                        if (!doc) return null;
                        const FileIcon = getFileIcon(doc.type);
                        return (
                          <span
                            key={docId}
                            className={`text-xs px-2 py-1 rounded flex items-center space-x-1 ${
                              msg.role === 'user'
                                ? 'bg-blue-700 text-blue-100'
                                : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            <FileIcon size={12} />
                            <span>{doc.name}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                
                <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mt-1 block`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {streamingMessage && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-2xl">
                <div className={`rounded-lg px-4 py-2 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-100 text-gray-900'}`}>
                  <p className="whitespace-pre-wrap">{streamingMessage}</p>
                  <span className="inline-block w-2 h-4 bg-gray-600 animate-pulse ml-1"></span>
                </div>
              </div>
            </div>
          )}

          {isLoading && !streamingMessage && (
            <div className="mb-4 flex justify-start">
              <div className={`rounded-lg px-4 py-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {mode === 'board' ? 'Advisors are discussing...' : `${selectedAdvisor?.name || 'AI'} is thinking...`}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className={`${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-t px-6 py-4`}>
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={mode === 'board' ? "Type your question for the board..." : "Type your message..."}
                className={`w-full px-4 py-2 pr-12 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isDarkMode ? 'bg-gray-800 text-white placeholder-gray-400' : 'bg-gray-100 text-gray-900 placeholder-gray-500'
                }`}
                rows="3"
              />
              
              {/* Voice Input Button */}
              <button
                onClick={isListening ? stopListening : startListening}
                className={`absolute bottom-2 right-2 p-1.5 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
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
                  : isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send size={20} />
              <span>Send</span>
            </button>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-4">
              <button
                onClick={generateSummary}
                className={`text-sm flex items-center space-x-1 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <BookOpen size={16} />
                <span>Generate Summary</span>
              </button>
              <button
                onClick={extractActionItems}
                className={`text-sm flex items-center space-x-1 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
              >
                <CheckCircle size={16} />
                <span>Extract Action Items</span>
              </button>
              {state.meetingDocuments && state.meetingDocuments.length > 0 && (
                <button
                  onClick={analyzeDocuments}
                  className={`text-sm flex items-center space-x-1 ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <Brain size={16} />
                  <span>Analyze Documents</span>
                </button>
              )}
            </div>
            
            {state.meetingDocuments && state.meetingDocuments.length > 0 && (
              <div className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                {state.meetingDocuments.length} document(s) in context
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Panel */}
      {showDocumentPanel && (
        <div className={`w-80 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-l flex flex-col`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Meeting Documents
              </h3>
              <button
                onClick={() => setShowDocumentPanel(false)}
                className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {state.meetingDocuments && state.meetingDocuments.length > 0 ? (
              <div className="space-y-2">
                {state.meetingDocuments.map(doc => {
                  const FileIcon = getFileIcon(doc.type);
                  
                  return (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-start space-x-3">
                        <FileIcon size={20} className={isDarkMode ? 'text-gray-400' : 'text-gray-500'} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                            {doc.name}
                          </p>
                          {doc.analysis?.summary && (
                            <p className={`text-xs mt-1 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {doc.analysis.summary}
                            </p>
                          )}
                          {doc.analysis?.businessRelevance !== undefined && (
                            <div className="mt-2">
                              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                {(doc.analysis.businessRelevance * 100).toFixed(0)}% relevant
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} mb-3`}>
                  No documents in this meeting
                </p>
                <button
                  onClick={() => {
                    // Navigate to documents module
                    window.dispatchEvent(new CustomEvent('navigate-module', { detail: 'documents' }));
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Go to Document Hub
                </button>
              </div>
            )}
          </div>
          
          {state.documents && state.documents.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('navigate-module', { detail: 'documents' }));
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
              >
                Manage Documents
              </button>
            </div>
          )}
        </div>
      )}

      {/* Advisor Panel */}
      {showAdvisorPanel && (
        <div className={`w-80 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-l flex flex-col`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Board Advisors
              </h3>
              <button
                onClick={() => setShowAdvisorPanel(false)}
                className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {advisors.map(advisor => (
              <div
                key={advisor.id}
                className={`p-3 rounded-lg cursor-pointer transition-all ${
                  mode === 'single' && selectedAdvisor?.id === advisor.id
                    ? 'bg-blue-50 border-2 border-blue-300'
                    : isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => {
                  if (mode === 'single') {
                    setSelectedAdvisor(advisor);
                  }
                }}
              >
                <div className="flex items-start space-x-3">
                  <span className="text-3xl">{advisor.avatar_emoji}</span>
                  <div className="flex-1">
                    <h4 className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {advisor.name}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
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
        <div className={`w-80 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-l p-6`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className={`p-1 rounded ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Response Style
              </label>
              <select className={`mt-1 w-full px-3 py-2 rounded-lg border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'
              }`}>
                <option>Professional</option>
                <option>Conversational</option>
                <option>Technical</option>
              </select>
            </div>
            
            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Auto-save Conversations
              </label>
              <div className="mt-1">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Save conversation history
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Document Analysis
              </label>
              <div className="mt-1 space-y-2">
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Auto-analyze uploaded documents
                  </span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" defaultChecked className="rounded" />
                  <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Include document context in responses
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
