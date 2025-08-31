// src/modules/AIHub-CS21-v1/AIHubEnhanced.js
import React, { useState, useEffect, useRef } from 'react';
import {
  Send, Mic, MicOff, Users, FileText, Brain, 
  Play, Pause, Download, Save, RefreshCw, 
  MessageSquare, Clock, ChevronDown, ChevronUp,
  Sparkles, X, Loader2, Settings, MoreVertical,
  Circle, Eye
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useVoice } from '../../contexts/VoiceContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import aiService from '../../services/aiService';
import secureAIService from '../../services/aiServiceSecure';
import { conversationService } from '../../services/supabase';
import { format } from 'date-fns';

export default function AIHubEnhanced() {
  const { state, dispatch, actions } = useAppState();
  const { user } = useSupabase();
  const { 
    isListening, 
    currentTranscript, 
    speak, 
    toggleListening,
    isVoiceEnabled 
  } = useVoice();

  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);
  const [showDocumentPanel, setShowDocumentPanel] = useState(false);
  const [showAdvisorPanel, setShowAdvisorPanel] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [activeAdvisor, setActiveAdvisor] = useState(null);
  const [conversationMode, setConversationMode] = useState('single');
  const [autoSave, setAutoSave] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [useSecureAPI, setUseSecureAPI] = useState(false);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize conversation
  useEffect(() => {
    if (user?.id && !state.activeConversation && state.selectedAdvisors.length > 0) {
      createNewConversation();
    }
  }, [user?.id, state.selectedAdvisors]);

  const createNewConversation = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await conversationService.createConversation(
        user.id,
        `AI Board Meeting - ${format(new Date(), 'MMM dd, yyyy')}`,
        state.selectedAdvisors.map(a => a.id)
      );

      if (error) throw error;

      dispatch({
        type: actions.SET_ACTIVE_CONVERSATION,
        payload: data
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: 'Failed to create conversation',
          type: 'error'
        }
      });
    }
  };

  // Send message handler
  const handleSendMessage = async () => {
    if (!message.trim() || isTyping) return;

    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message.trim(),
      created_at: new Date().toISOString(),
      referenced_documents: selectedDocuments.map(d => d.id)
    };

    // Add user message to state
    dispatch({
      type: actions.ADD_MESSAGE,
      payload: userMessage
    });

    setMessage('');
    setIsTyping(true);

    try {
      // Get document context
      const documentContext = selectedDocuments.length > 0
        ? `\n\nRelevant documents:\n${selectedDocuments.map(doc => 
            `- ${doc.name}: ${doc.summary}`
          ).join('\n')}`
        : '';

      // Determine which advisor should respond
      let respondingAdvisor;
      if (conversationMode === 'single' && activeAdvisor) {
        respondingAdvisor = activeAdvisor;
      } else if (conversationMode === 'auto') {
        // Let AI decide which advisor should respond
        respondingAdvisor = await selectBestAdvisor(message.trim());
      } else {
        // Board mode - select first advisor (or implement round-robin)
        respondingAdvisor = state.selectedAdvisors[0];
      }

      // Build conversation history
      const conversationHistory = state.conversationMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Prepare messages with advisor context
      const messages = [
        {
          role: 'system',
          content: buildAdvisorPrompt(respondingAdvisor) + documentContext
        },
        ...conversationHistory,
        {
          role: 'user',
          content: userMessage.content
        }
      ];

      // Stream response
      const stream = useSecureAPI 
        ? await secureAIService.chat(messages, { 
            stream: true, 
            conversationId: state.activeConversation?.id 
          })
        : await aiService.streamChat(messages);

      let fullResponse = '';
      const advisorMessage = {
        id: `temp-${Date.now()}-response`,
        role: 'assistant',
        content: '',
        advisor_name: respondingAdvisor.name,
        advisor_id: respondingAdvisor.id,
        created_at: new Date().toISOString()
      };

      // Add placeholder message
      dispatch({
        type: actions.ADD_MESSAGE,
        payload: advisorMessage
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
          fullResponse += chunk.delta.text;
          setStreamingMessage(fullResponse);
          
          // Update message in real-time
          dispatch({
            type: actions.UPDATE_CONVERSATION,
            payload: {
              id: state.activeConversation?.id,
              messages: [...state.conversationMessages.slice(0, -1), {
                ...advisorMessage,
                content: fullResponse
              }]
            }
          });
        }
      }

      // Finalize message
      const finalMessage = {
        ...advisorMessage,
        content: fullResponse
      };

      dispatch({
        type: actions.UPDATE_CONVERSATION,
        payload: {
          id: state.activeConversation?.id,
          messages: [...state.conversationMessages.slice(0, -1), finalMessage]
        }
      });

      // Save to database if autosave is on
      if (autoSave && state.activeConversation?.id) {
        await conversationService.addMessage(
          state.activeConversation.id,
          finalMessage
        );
      }

      // Speak response if voice is enabled
      if (isVoiceEnabled) {
        speak(fullResponse);
      }

      // Handle board mode - get responses from other advisors
      if (conversationMode === 'board' && state.selectedAdvisors.length > 1) {
        await getBoardResponses(userMessage, respondingAdvisor, fullResponse);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: 'Failed to send message',
          type: 'error'
        }
      });
    } finally {
      setIsTyping(false);
      setStreamingMessage('');
    }
  };

  // Build advisor-specific prompt
  const buildAdvisorPrompt = (advisor) => {
    return `You are ${advisor.name}, ${advisor.role}.
Your expertise: ${advisor.expertise.join(', ')}
Personality traits: ${advisor.personality.traits.join(', ')}
Communication style: ${advisor.personality.communication_style}

Provide advice and insights based on your role and expertise. Stay in character.`;
  };

  // Select best advisor using AI
  const selectBestAdvisor = async (userMessage) => {
    // Simple implementation - could be enhanced with AI
    const keywords = userMessage.toLowerCase();
    
    // Match keywords to advisor expertise
    for (const advisor of state.selectedAdvisors) {
      for (const expertise of advisor.expertise) {
        if (keywords.includes(expertise.toLowerCase())) {
          return advisor;
        }
      }
    }

    // Default to first advisor
    return state.selectedAdvisors[0];
  };

  // Get responses from all board members
  const getBoardResponses = async (userMessage, firstAdvisor, firstResponse) => {
    const otherAdvisors = state.selectedAdvisors.filter(a => a.id !== firstAdvisor.id);

    for (const advisor of otherAdvisors) {
      // Add a slight delay between responses
      await new Promise(resolve => setTimeout(resolve, 1000));

      const messages = [
        {
          role: 'system',
          content: buildAdvisorPrompt(advisor) + `\n\nThe user asked: "${userMessage.content}"\n\n${firstAdvisor.name} responded: "${firstResponse}"\n\nProvide your perspective as ${advisor.name}.`
        },
        {
          role: 'user',
          content: 'What is your perspective on this?'
        }
      ];

      try {
        const stream = useSecureAPI
          ? await secureAIService.chat(messages, { stream: true })
          : await aiService.streamChat(messages);

        let advisorResponse = '';
        const advisorMessage = {
          id: `temp-${Date.now()}-${advisor.id}`,
          role: 'assistant',
          content: '',
          advisor_name: advisor.name,
          advisor_id: advisor.id,
          created_at: new Date().toISOString()
        };

        dispatch({
          type: actions.ADD_MESSAGE,
          payload: advisorMessage
        });

        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta?.text) {
            advisorResponse += chunk.delta.text;
            
            dispatch({
              type: actions.UPDATE_CONVERSATION,
              payload: {
                id: state.activeConversation?.id,
                messages: [...state.conversationMessages.slice(0, -1), {
                  ...advisorMessage,
                  content: advisorResponse
                }]
              }
            });
          }
        }

        if (isVoiceEnabled) {
          speak(advisorResponse);
        }

      } catch (error) {
        console.error(`Error getting response from ${advisor.name}:`, error);
      }
    }
  };

  // Voice input handler
  useEffect(() => {
    if (currentTranscript && !isListening) {
      setMessage(prev => prev + ' ' + currentTranscript);
    }
  }, [currentTranscript, isListening]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [state.conversationMessages]);

  // Generate summary
  const generateSummary = async () => {
    if (state.conversationMessages.length < 3) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: 'Need at least 3 messages to generate summary',
          type: 'warning'
        }
      });
      return;
    }

    try {
      const conversationText = state.conversationMessages
        .map(msg => `${msg.advisor_name || 'User'}: ${msg.content}`)
        .join('\n\n');

      const messages = [
        {
          role: 'system',
          content: 'You are a professional meeting summarizer. Create a concise summary with key points and action items.'
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n\n${conversationText}`
        }
      ];

      const response = useSecureAPI
        ? await secureAIService.chat(messages, { stream: false })
        : await aiService.chat(messages);

      const summaryMessage = {
        id: `summary-${Date.now()}`,
        role: 'system',
        content: `📋 **Meeting Summary**\n\n${response.content[0].text}`,
        created_at: new Date().toISOString()
      };

      dispatch({
        type: actions.ADD_MESSAGE,
        payload: summaryMessage
      });

      // Update conversation with summary
      if (state.activeConversation?.id) {
        await conversationService.updateConversation(
          state.activeConversation.id,
          { summary: response.content[0].text }
        );
      }

    } catch (error) {
      console.error('Error generating summary:', error);
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: 'Failed to generate summary',
          type: 'error'
        }
      });
    }
  };

  // Export conversation
  const exportConversation = () => {
    const content = state.conversationMessages
      .map(msg => `${format(new Date(msg.created_at), 'HH:mm')} - ${msg.advisor_name || 'You'}: ${msg.content}`)
      .join('\n\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI-Board-Meeting-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold text-gray-900">AI Board Meeting</h1>
            
            {/* Conversation Mode Selector */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setConversationMode('single')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  conversationMode === 'single'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Single
              </button>
              <button
                onClick={() => setConversationMode('board')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  conversationMode === 'board'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Board
              </button>
              <button
                onClick={() => setConversationMode('auto')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  conversationMode === 'auto'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Auto
              </button>
            </div>

            {/* Online Indicator */}
            {onlineUsers.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Circle className="w-2 h-2 fill-green-500 text-green-500" />
                <span>{onlineUsers.length} viewing</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={generateSummary}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Generate Summary"
            >
              <FileText size={20} className="text-gray-600" />
            </button>
            <button
              onClick={exportConversation}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Export Conversation"
            >
              <Download size={20} className="text-gray-600" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">Auto-save conversations</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useSecureAPI}
                  onChange={(e) => setUseSecureAPI(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">Use secure API route</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Advisor Panel */}
        {showAdvisorPanel && (
          <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900">Board Members</h2>
              <button
                onClick={() => setShowAdvisorPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {state.selectedAdvisors.map((advisor) => {
                const isActive = conversationMode === 'single' && activeAdvisor?.id === advisor.id;
                
                return (
                  <button
                    key={advisor.id}
                    onClick={() => setActiveAdvisor(advisor)}
                    className={`w-full p-3 rounded-lg border transition-all ${
                      isActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{advisor.avatar_emoji}</div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{advisor.name}</p>
                        <p className="text-xs text-gray-600">{advisor.role}</p>
                      </div>
                    </div>
                    {isActive && conversationMode === 'single' && (
                      <div className="mt-2 flex items-center justify-center">
                        <span className="text-xs text-blue-600">Active</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {state.selectedAdvisors.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No advisors selected</p>
                <button
                  onClick={() => {/* Navigate to Advisory Hub */}}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Select Advisors
                </button>
              </div>
            )}
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {state.conversationMessages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Start a conversation with your AI board</p>
                <p className="text-sm text-gray-400 mt-2">
                  {conversationMode === 'board' 
                    ? 'All advisors will provide their perspectives'
                    : conversationMode === 'auto'
                    ? 'The most relevant advisor will respond'
                    : 'Select an advisor to chat one-on-one'}
                </p>
              </div>
            ) : (
              state.conversationMessages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-2xl ${msg.role === 'user' ? 'order-2' : 'order-1'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-lg">
                          {state.selectedAdvisors.find(a => a.id === msg.advisor_id)?.avatar_emoji || '🤖'}
                        </span>
                        <span className="text-sm font-medium text-gray-700">
                          {msg.advisor_name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(msg.created_at), 'HH:mm')}
                        </span>
                      </div>
                    )}
                    
                    <div className={`rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : msg.role === 'system'
                        ? 'bg-gray-100 text-gray-800 italic'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content || streamingMessage}</p>
                      
                      {msg.referenced_documents?.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1">Referenced documents:</p>
                          <div className="flex flex-wrap gap-1">
                            {msg.referenced_documents.map(docId => {
                              const doc = state.documents.find(d => d.id === docId);
                              return doc ? (
                                <span key={docId} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {doc.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {activeAdvisor?.name || 'AI'} is thinking...
                </span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            {/* Document Selection */}
            {selectedDocuments.length > 0 && (
              <div className="mb-3 flex items-center space-x-2">
                <FileText size={16} className="text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {selectedDocuments.map((doc) => (
                    <span
                      key={doc.id}
                      className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                    >
                      {doc.name}
                      <button
                        onClick={() => setSelectedDocuments(prev => prev.filter(d => d.id !== doc.id))}
                        className="ml-1 text-blue-500 hover:text-blue-700"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end space-x-2">
              <button
                onClick={() => setShowDocumentPanel(!showDocumentPanel)}
                className={`p-2 rounded-lg transition-colors ${
                  showDocumentPanel
                    ? 'bg-blue-100 text-blue-600'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
                title="Attach Documents"
              >
                <FileText size={20} />
              </button>

              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    conversationMode === 'single' && activeAdvisor
                      ? `Ask ${activeAdvisor.name}...`
                      : "Ask your AI board..."
                  }
                  className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={message.split('\n').length > 3 ? 4 : 2}
                />
                
                <button
                  onClick={toggleListening}
                  className={`absolute right-2 bottom-2 p-1 rounded transition-colors ${
                    isListening
                      ? 'text-red-600 hover:bg-red-50'
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isListening ? <Mic size={18} /> : <MicOff size={18} />}
                </button>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={!message.trim() || isTyping}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send size={20} />
                <span>Send</span>
              </button>
            </div>
          </div>
        </div>

        {/* Document Panel */}
        {showDocumentPanel && (
          <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-medium text-gray-900">Documents</h2>
              <button
                onClick={() => setShowDocumentPanel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              {state.documents.filter(doc => doc.status === 'ready').map((doc) => {
                const isSelected = selectedDocuments.some(d => d.id === doc.id);
                
                return (
                  <button
                    key={doc.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDocuments(prev => prev.filter(d => d.id !== doc.id));
                      } else {
                        setSelectedDocuments(prev => [...prev, doc]);
                      }
                    }}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <FileText size={20} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {doc.summary}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {state.documents.filter(doc => doc.status === 'ready').length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No documents available</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}