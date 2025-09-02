import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Users, FileText, Clock, 
  Calendar, BarChart, Activity, Target,
  MessageSquare, Download, Archive, Trash2,
  Play, Tag, Filter, Search, Edit3, Copy,
  FolderOpen, Star, MoreHorizontal, Eye
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import logger from '../../utils/logger';

export default function DashboardModule() {
  const { state, dispatch, actions } = useAppState();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showConversationManager, setShowConversationManager] = useState(false);
  const [filterBy, setFilterBy] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);

  const stats = [
    { label: 'Active Advisors', value: state.advisors?.length || 7, icon: Users, color: 'blue' },
    { label: 'Documents', value: state.documents?.length || 0, icon: FileText, color: 'green' },
    { label: 'Conversations', value: state.conversations?.length || 0, icon: Activity, color: 'purple' },
    { label: 'This Week', value: '12h 34m', icon: Clock, color: 'yellow' }
  ];

  const quickActions = [
    { label: 'Start Board Meeting', icon: Users, action: 'ai', color: 'blue' },
    { label: 'Upload Document', icon: FileText, action: 'documents', color: 'green' },
    { label: 'View Calendar', icon: Calendar, action: 'meetings', color: 'purple' }
  ];

  const handleQuickAction = (action) => {
    window.dispatchEvent(new CustomEvent('navigate-module', { detail: action }));
  };

  // Load conversations from localStorage on component mount
  useEffect(() => {
    const savedConversations = localStorage.getItem('ai-board-conversations');
    if (savedConversations) {
      try {
        const parsed = JSON.parse(savedConversations);
        setConversations(parsed || []);
      } catch (error) {
        logger.error('Error parsing saved conversations:', error);
        setConversations([]);
      }
    }
  }, []);

  // Save conversations when they change
  const saveConversations = (newConversations) => {
    localStorage.setItem('ai-board-conversations', JSON.stringify(newConversations));
    setConversations(newConversations);
  };

  const continueConversation = (conversation) => {
    // Load the conversation into the current session
    if (dispatch && actions.LOAD_CONVERSATION) {
      dispatch({
        type: actions.LOAD_CONVERSATION,
        payload: conversation
      });
    }
    // Navigate to AI Board
    handleQuickAction('ai');
  };

  const downloadConversation = (conversation) => {
    const content = generateConversationReport(conversation);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${conversation.id}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateConversationReport = (conversation) => {
    const header = `
AI Board of Advisors - Conversation Report
==========================================
Title: ${conversation.title || 'Untitled Conversation'}
Date: ${new Date(conversation.timestamp).toLocaleString()}
Environment: ${conversation.environment || 'Standard Chat'}
Advisors: ${conversation.advisors?.map(a => a.name).join(', ') || 'Unknown'}
Tags: ${conversation.tags?.join(', ') || 'None'}
Duration: ${conversation.duration || 'Unknown'}
==========================================

`;
    
    const messages = conversation.messages?.map(msg => {
      const timestamp = new Date(msg.timestamp).toLocaleTimeString();
      const author = msg.role === 'user' ? 'You' : (msg.advisor?.name || 'AI Assistant');
      return `[${timestamp}] ${author}:\n${msg.content}\n`;
    }).join('\n') || 'No messages found.';

    return header + messages;
  };

  const archiveConversation = (conversationId) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId 
        ? { ...conv, archived: true, archivedAt: new Date().toISOString() }
        : conv
    );
    saveConversations(updatedConversations);
  };

  const deleteConversation = (conversationId) => {
    if (window.confirm('Are you sure you want to permanently delete this conversation?')) {
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      saveConversations(updatedConversations);
    }
  };

  const tagConversation = (conversationId, newTag) => {
    const updatedConversations = conversations.map(conv => {
      if (conv.id === conversationId) {
        const currentTags = conv.tags || [];
        const tags = currentTags.includes(newTag) 
          ? currentTags.filter(tag => tag !== newTag)
          : [...currentTags, newTag];
        return { ...conv, tags };
      }
      return conv;
    });
    saveConversations(updatedConversations);
  };

  // Filter conversations based on current filters
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = !searchTerm || 
      conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages?.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
      (filterBy === 'archived' && conv.archived) ||
      (filterBy === 'active' && !conv.archived) ||
      (filterBy === 'favorites' && conv.favorite);
    
    const matchesTag = !selectedTag || conv.tags?.includes(selectedTag);
    
    return matchesSearch && matchesFilter && matchesTag;
  });

  // Get unique tags from all conversations
  const allTags = [...new Set(conversations.flatMap(conv => conv.tags || []))];

  // Mock some sample conversations if none exist
  useEffect(() => {
    if (conversations.length === 0) {
      const sampleConversations = [
        {
          id: 'sample-1',
          title: 'Q3 Marketing Strategy Review',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          environment: 'Board Room',
          advisors: [
            { name: 'Mark Cuban', avatar_emoji: '🦈' },
            { name: 'Sheryl Sandberg', avatar_emoji: '👩‍💼' }
          ],
          tags: ['Marketing', 'Strategy', 'Q3'],
          messages: [
            {
              id: '1',
              role: 'user',
              content: 'I need help developing our Q3 marketing strategy for the new product launch.',
              timestamp: new Date(Date.now() - 86400000).toISOString()
            }
          ],
          duration: '45 min'
        },
        {
          id: 'sample-2',
          title: 'Funding Round Preparation',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          environment: 'Shark Tank',
          advisors: [
            { name: 'Jason Calacanis', avatar_emoji: '👨‍💼' }
          ],
          tags: ['Funding', 'Pitch', 'Series A'],
          messages: [
            {
              id: '1',
              role: 'user',
              content: 'We are preparing for our Series A round. What should our pitch deck focus on?',
              timestamp: new Date(Date.now() - 172800000).toISOString()
            }
          ],
          duration: '30 min'
        }
      ];
      saveConversations(sampleConversations);
    }
  }, [conversations.length]);

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back! Here's your business overview.</p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                    <Icon size={20} className={`text-${stat.color}-600`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action.action)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 bg-${action.color}-100 rounded-lg group-hover:bg-${action.color}-200 transition-colors`}>
                      <Icon size={20} className={`text-${action.color}-600`} />
                    </div>
                    <span className="font-medium text-gray-900">{action.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Conversation Manager */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Conversations & Meetings</h2>
            <button
              onClick={() => setShowConversationManager(!showConversationManager)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageSquare size={16} />
              <span>{showConversationManager ? 'Hide' : 'Manage'}</span>
            </button>
          </div>

          {showConversationManager && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="favorites">Favorites</option>
                </select>
              </div>

              {/* Tag Filter */}
              {allTags.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Tag size={14} className="text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedTag(null)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTag === null 
                          ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All Tags
                    </button>
                    {allTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                        className={`px-3 py-1 rounded-full text-sm ${
                          selectedTag === tag 
                            ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Conversation List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="mx-auto mb-2 text-gray-300" size={32} />
                    <p>No conversations found</p>
                    <button
                      onClick={() => handleQuickAction('ai')}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                    >
                      Start First Conversation
                    </button>
                  </div>
                ) : (
                  filteredConversations.map(conversation => (
                    <div key={conversation.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">
                            {conversation.title || 'Untitled Conversation'}
                          </h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                            <span className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{new Date(conversation.timestamp).toLocaleDateString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Clock size={14} />
                              <span>{conversation.duration || 'Unknown'}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Users size={14} />
                              <span>{conversation.advisors?.length || 0} advisors</span>
                            </span>
                          </div>
                          {conversation.tags && conversation.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {conversation.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => continueConversation(conversation)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                            title="Continue conversation"
                          >
                            <Play size={16} />
                          </button>
                          <button
                            onClick={() => downloadConversation(conversation)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                            title="Download conversation"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => archiveConversation(conversation.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-100 rounded-lg"
                            title="Archive conversation"
                          >
                            <Archive size={16} />
                          </button>
                          <button
                            onClick={() => deleteConversation(conversation.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                            title="Delete conversation"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {/* Quick tag buttons */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">Quick tags:</span>
                          {['Important', 'Strategy', 'Follow-up'].map(tag => (
                            <button
                              key={tag}
                              onClick={() => tagConversation(conversation.id, tag)}
                              className={`px-2 py-1 text-xs rounded ${
                                conversation.tags?.includes(tag)
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">
                          {conversation.environment || 'Standard Chat'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200">
            {state.conversationMessages?.slice(-5).map((msg, index) => (
              <div key={index} className="p-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">{msg.advisor?.avatar || '👤'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {msg.advisor?.name || 'You'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">{msg.content}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!state.conversationMessages || state.conversationMessages.length === 0) && (
              <div className="p-8 text-center text-gray-500">
                <Activity className="mx-auto mb-2 text-gray-300" size={32} />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h2>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Target size={24} />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Today's Focus</h3>
                <p className="text-white/90">
                  Based on your recent conversations, consider prioritizing customer acquisition strategies. 
                  Your advisors have identified 3 key opportunities in your market segment.
                </p>
                <button 
                  onClick={() => handleQuickAction('ai')}
                  className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  Explore Insights
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}