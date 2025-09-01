// src/modules/AIHub-CS21-v2/AIHub-dedup.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Mic, MicOff, Settings, FileText, Users, X, Plus,
  Upload, Eye, EyeOff, Check, AlertCircle, User, Download,
  MessageSquare, Sparkles, Save, RefreshCw, Play, Square,
  Calendar, Clock, UserCheck, Paperclip, Volume2
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useVoice } from '../../contexts/VoiceContext';
import aiService from '../../services/aiService';
import MeetingEnvironmentSelector from '../../components/MeetingEnvironment/MeetingEnvironmentSelector';
import BoardRoomEnvironment from '../../components/MeetingEnvironment/BoardRoomEnvironment';
import SharkTankEnvironment from '../../components/MeetingEnvironment/SharkTankEnvironment';
import ContextHelp, { HelpTooltip } from '../../components/Help/ContextHelp';

export default function AIHub() {
  const { state, dispatch, actions } = useAppState();
  const { isListening, startListening, stopListening, transcript } = useVoice();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(false);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [currentEnvironment, setCurrentEnvironment] = useState('chat');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const hasInitializedRef = useRef(false);
  const fileInputRef = useRef(null);

  // Initialize with greeting - prevent duplicates
  useEffect(() => {
    // Check if we already have messages or if we've already initialized
    if (hasInitializedRef.current || !state.advisors?.length) return;
    
    // Check if there's already a welcome message
    const hasWelcomeMessage = state.conversationMessages?.some(msg => 
      msg.content?.includes('Welcome to your AI Board of Advisors')
    );
    
    if (!hasWelcomeMessage && state.conversationMessages?.length === 0) {
      hasInitializedRef.current = true;
      const meetingHost = state.advisors.find(a => a.isHost || a.name === 'Meeting Host') || state.advisors[0];
      
      const welcomeMessage = {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `Welcome to your AI Board of Advisors! I'm ${meetingHost.name}, and I'll help facilitate your strategic discussions today. What would you like to discuss?`,
        advisor: meetingHost,
        timestamp: new Date().toISOString()
      };
      
      dispatch({ type: actions.ADD_MESSAGE, payload: welcomeMessage });
    } else {
      hasInitializedRef.current = true;
    }
  }, [state.advisors, state.conversationMessages, dispatch, actions]);

  // Clear duplicate messages on mount
  useEffect(() => {
    // Remove duplicate welcome messages
    const messages = state.conversationMessages || [];
    const uniqueMessages = [];
    const seenContent = new Set();
    
    for (const msg of messages) {
      const contentKey = msg.content?.substring(0, 100); // Check first 100 chars
      if (!seenContent.has(contentKey)) {
        seenContent.add(contentKey);
        uniqueMessages.push(msg);
      }
    }
    
    if (uniqueMessages.length < messages.length) {
      dispatch({ 
        type: actions.SET_ACTIVE_CONVERSATION, 
        payload: { 
          ...state.activeConversation, 
          messages: uniqueMessages 
        } 
      });
    }
  }, []);

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

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        // Create document entry
        const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockDoc = {
          id: docId,
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'processing',
          created_at: new Date().toISOString(),
          analysis: {
            summary: `Analysis pending for ${file.name}...`,
            businessRelevance: 0.7
          }
        };
        
        dispatch({ type: actions.ADD_DOCUMENT, payload: mockDoc });

        // Simulate processing delay
        setTimeout(() => {
          dispatch({
            type: actions.UPDATE_DOCUMENT,
            payload: {
              id: docId,
              status: 'ready',
              analysis: {
                summary: `This ${file.type.includes('pdf') ? 'PDF' : 'document'} contains important business information relevant to your strategic discussions.`,
                businessRelevance: 0.85,
                keywords: [
                  { word: 'strategy', score: 0.9 },
                  { word: 'growth', score: 0.8 },
                  { word: 'market', score: 0.7 }
                ]
              }
            }
          });
          
          dispatch({
            type: actions.ADD_NOTIFICATION,
            payload: {
              message: `${file.name} analyzed successfully`,
              type: 'success'
            }
          });
        }, 3000);
      } catch (error) {
        console.error('Upload error:', error);
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: {
            message: `Failed to upload ${file.name}`,
            type: 'error'
          }
        });
      }
    }
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
      // Check if we have advisors
      if (!advisors || advisors.length === 0) {
        throw new Error('No advisors selected. Please go to the Advisors module to select advisors.');
      }

      // Add document context to the message if documents are selected
      const enhancedMessage = documentContext ? 
        `${message}\n\n[Context from uploaded documents:\n${documentContext}]` : 
        message;

      // Check if AI service is available
      if (!aiService.apiKey && !process.env.REACT_APP_ANTHROPIC_API_KEY) {
        // Simulate AI response for demo mode
        const demoAdvisor = advisors[0];
        const demoResponse = {
          id: `ai-demo-${Date.now()}`,
          role: 'assistant',
          content: `Based on my analysis as ${demoAdvisor.role}, I can provide insights on "${message}". ${documentContext ? 'Considering the uploaded documents, ' : ''}this is an important strategic consideration for your business. Would you like me to elaborate on any specific aspect?`,
          advisor: {
            id: demoAdvisor.id,
            name: demoAdvisor.name,
            role: demoAdvisor.role,
            avatar_emoji: demoAdvisor.avatar_emoji
          },
          timestamp: new Date().toISOString()
        };
        
        // Simulate typing delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        dispatch({ type: actions.ADD_MESSAGE, payload: demoResponse });
      } else {
        // Real API call
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
      }

      setStreamingMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `Error: ${error.message || 'Failed to get AI response. Please check your API key.'}`,
          type: 'error'
        }
      });
      
      // Add a helpful error message in the chat
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: 'system',
        content: `⚠️ ${error.message || 'Unable to connect to AI service. Please check your API configuration.'}`,
        timestamp: new Date().toISOString()
      };
      dispatch({ type: actions.ADD_MESSAGE, payload: errorMessage });
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

  // Render chat interface wrapped in selected environment
  const renderChatInterface = () => {
    const chatContent = (
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
                    : msg.role === 'system'
                    ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
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
            {/* Upload Icon */}
            <HelpTooltip content="Upload documents to provide context to your AI advisors">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Upload documents"
              >
                <Upload size={20} className="text-gray-600" />
              </button>
            </HelpTooltip>
            
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question for the board..."
                className="w-full px-4 py-2 pr-20 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-100 text-gray-900 placeholder-gray-500"
                rows="3"
              />
              
              {/* Voice Controls */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                {/* Voice Input Button */}
                <HelpTooltip content="Click to start/stop voice input">
                  <button
                    onClick={isListening ? stopListening : startListening}
                    className={`p-1.5 rounded-lg transition-colors ${
                      isListening
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'hover:bg-gray-200 text-gray-600'
                    }`}
                    title={isListening ? "Stop listening" : "Start voice input"}
                  >
                    {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                  </button>
                </HelpTooltip>
                
                {/* Voice Output Button */}
                <HelpTooltip content="Configure voice output settings and preferences">
                  <button
                    className="p-1.5 rounded-lg transition-colors hover:bg-gray-200 text-gray-600"
                    title="Voice output settings"
                  >
                    <Volume2 size={18} />
                  </button>
                </HelpTooltip>
              </div>
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
    );

    // Wrap chat interface in selected environment
    switch (currentEnvironment) {
      case 'boardroom':
        return (
          <BoardRoomEnvironment
            advisors={state.advisors || []}
            selectedAdvisors={advisors}
            messages={state.conversationMessages || []}
            onMessageSend={handleSendMessage}
          >
            {chatContent}
          </BoardRoomEnvironment>
        );
      case 'sharktank':
        return (
          <SharkTankEnvironment
            advisors={state.advisors || []}
            selectedAdvisors={advisors}
            messages={state.conversationMessages || []}
            onMessageSend={handleSendMessage}
          >
            {chatContent}
          </SharkTankEnvironment>
        );
      default:
        return chatContent;
    }
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
              {state.documents?.length > 0 && (
                <>
                  {state.documents.filter(doc => doc.status === 'ready').length > 0 && (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5">
                      {state.documents.filter(doc => doc.status === 'ready').length}
                    </span>
                  )}
                  {state.documents.some(doc => doc.status === 'processing') && (
                    <span className="bg-purple-600 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">
                      {state.documents.filter(doc => doc.status === 'processing').length}
                    </span>
                  )}
                </>
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
            
            {/* Meeting Environment Selector */}
            <div className="mr-2">
              <MeetingEnvironmentSelector 
                currentEnvironment={currentEnvironment}
                onEnvironmentChange={setCurrentEnvironment}
                selectedAdvisors={advisors}
                onAdvisorsChange={(newAdvisors) => {
                  // Update the selected advisors in the app state or context
                  // This would typically dispatch an action to update the global state
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Environment-Wrapped Chat Area */}
        {currentEnvironment === 'chat' ? (
          <div className="flex-1">
            {renderChatInterface()}
          </div>
        ) : (
          <div className="flex-1 relative">
            {renderChatInterface()}
          </div>
        )}

        {/* Document Panel */}
        {showDocumentPanel && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Documents</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1 rounded hover:bg-gray-100"
                    title="Upload documents"
                  >
                    <Upload size={18} className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setShowDocumentPanel(false)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {state.documents?.length > 0 && (
                <p className="text-xs text-gray-500 mb-3">Click documents to add/remove from meeting</p>
              )}
              {state.documents?.length > 0 ? (
                <div className="space-y-2">
                  {state.documents.map(doc => {
                    const FileIcon = getFileIcon(doc.type);
                    const isInMeeting = state.meetingDocuments?.some(d => d.id === doc.id);
                    
                    return (
                      <div
                        key={doc.id}
                        className={`p-3 rounded-lg transition-all ${
                          isInMeeting ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                        } ${
                          doc.status === 'ready' ? 'cursor-pointer hover:bg-gray-100' : 'opacity-75'
                        }`}
                        onClick={() => {
                          if (doc.status === 'ready') {
                            if (isInMeeting) {
                              // Remove from meeting
                              dispatch({ 
                                type: actions.SET_MEETING_DOCUMENTS, 
                                payload: state.meetingDocuments.filter(d => d.id !== doc.id) 
                              });
                            } else {
                              // Add to meeting
                              dispatch({ 
                                type: actions.SET_MEETING_DOCUMENTS, 
                                payload: [...(state.meetingDocuments || []), doc] 
                              });
                            }
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <FileIcon size={20} className={isInMeeting ? 'text-blue-600' : 'text-gray-500'} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-gray-900">
                              {doc.name}
                            </p>
                            {doc.status === 'processing' ? (
                              <p className="text-xs mt-1 text-purple-600 font-medium">
                                Analyzing document...
                              </p>
                            ) : doc.analysis?.summary ? (
                              <p className="text-xs mt-1 line-clamp-2 text-gray-600">
                                {doc.analysis.summary}
                              </p>
                            ) : null}
                            {doc.analysis?.businessRelevance && (
                              <div className="mt-2">
                                <div className="flex items-center space-x-1">
                                  <span className="text-xs text-gray-500">Relevance</span>
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-1.5 rounded-full"
                                      style={{ width: `${doc.analysis.businessRelevance * 100}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            {doc.status === 'processing' && (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600" />
                            )}
                            {isInMeeting && doc.status === 'ready' && (
                              <Check size={16} className="text-blue-600 flex-shrink-0" />
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
                    No documents available
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

      </div>
      
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
        accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
      />
    </div>
  );
}