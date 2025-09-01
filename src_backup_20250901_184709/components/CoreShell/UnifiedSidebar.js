import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, FileText, Users, MessageSquare, Video, CreditCard,
  Search, Settings, LogOut, ChevronLeft, ChevronRight,
  Mic, MicOff, Volume2, VolumeX, Bell, HelpCircle, Command,
  ChevronDown, ChevronUp, CheckCircle, Plus, X
} from 'lucide-react';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useVoice } from '../../contexts/VoiceContext';
import { useAppState } from '../../contexts/AppStateContext';
import { useHelp } from '../Help/HelpProvider';
import { HelpTooltip } from '../Help/ContextHelp';

export default function UnifiedSidebar({ activeModule, setActiveModule, user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const { signOut } = useSupabase();
  const { isListening, isVoiceEnabled, toggleListening, toggleVoice } = useVoice();
  const { state, dispatch, actions } = useAppState();
  const { openHelp } = useHelp();
  const searchInputRef = useRef(null);

  const modules = [
    { id: 'ai', name: 'AI Board', icon: MessageSquare, color: 'blue' },
    { id: 'dashboard', name: 'Dashboard', icon: Home, color: 'purple' },
    { id: 'documents', name: 'Documents', icon: FileText, color: 'green' },
    { id: 'advisors', name: 'Advisors', icon: Users, color: 'yellow' },
    { id: 'meetings', name: 'Meetings', icon: Video, color: 'pink' }
  ];

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (!collapsed) {
          searchInputRef.current?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [collapsed]);

  // Help sections for search
  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description: 'Welcome guide and quick start tutorial',
      content: 'Welcome to V30 AI Board of Advisors! Quick Start Guide, Meeting Environments, Your First Meeting, Privacy & Security'
    },
    {
      id: 'environments',
      title: 'Meeting Environments',
      description: 'Guide to Chat, Board Room, Shark Tank, and Enhanced Meeting modes',
      content: 'Standard Chat, Board Room Environment, Shark Tank Environment, Enhanced Meeting, switching environments'
    },
    {
      id: 'advisors',
      title: 'AI Advisors',
      description: 'Guide to celebrity advisors and AI advisory board',
      content: 'Mark Cuban, Jason Calacanis, Sheryl Sandberg, Satya Nadella, Marc Benioff, Reid Hoffman, Ruth Porat, advisor selection tips'
    },
    {
      id: 'documents',
      title: 'Document Management',
      description: 'How to upload, analyze, and work with business documents',
      content: 'PDF, Word, Excel, PowerPoint, document processing, local first approach, AI advisor integration'
    },
    {
      id: 'features',
      title: 'Features & Tools',
      description: 'Voice features, meeting tools, and advanced functionality',
      content: 'Voice input, voice output, Shark Tank timer, Board Room atmosphere, document intelligence'
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      description: 'Data protection, security measures, and privacy policies',
      content: 'data privacy, local processing, security measures, GDPR compliance, data retention'
    }
  ];

  // Search functionality
  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const searchLower = query.toLowerCase();

    // Search help and support content
    helpSections.forEach(section => {
      if (section.title.toLowerCase().includes(searchLower) ||
          section.description.toLowerCase().includes(searchLower) ||
          section.content.toLowerCase().includes(searchLower)) {
        const matchInTitle = section.title.toLowerCase().includes(searchLower);
        const matchInDescription = section.description.toLowerCase().includes(searchLower);
        const matchInContent = section.content.toLowerCase().includes(searchLower);
        
        let highlight = '';
        if (matchInTitle) {
          highlight = section.title;
        } else if (matchInDescription) {
          highlight = section.description;
        } else if (matchInContent) {
          const contentIndex = section.content.toLowerCase().indexOf(searchLower);
          highlight = section.content.substring(
            Math.max(0, contentIndex - 30),
            Math.min(section.content.length, contentIndex + searchLower.length + 30)
          );
        }
        
        results.push({
          id: section.id,
          type: 'help',
          title: section.title,
          description: section.description,
          highlight: highlight
        });
      }
    });

    // Search conversations
    if (state.conversations) {
      state.conversations.forEach(conversation => {
        if (conversation.title?.toLowerCase().includes(searchLower) || 
            conversation.summary?.toLowerCase().includes(searchLower)) {
          results.push({
            id: conversation.id,
            type: 'conversation',
            title: conversation.title || 'Untitled Conversation',
            description: conversation.summary || 'No summary available',
            highlight: conversation.title?.toLowerCase().includes(searchLower) ? 
              conversation.title : conversation.summary
          });
        }
      });
    }

    // Search messages in active conversation
    if (state.conversationMessages) {
      state.conversationMessages.forEach((message, index) => {
        if (message.content?.toLowerCase().includes(searchLower)) {
          const highlightStart = message.content.toLowerCase().indexOf(searchLower);
          const highlight = message.content.substring(
            Math.max(0, highlightStart - 20), 
            Math.min(message.content.length, highlightStart + searchLower.length + 20)
          );
          
          results.push({
            id: `message-${message.id || index}`,
            type: 'conversation',
            title: `Message from ${message.advisor?.name || 'Assistant'}`,
            description: 'In current conversation',
            highlight: highlight
          });
        }
      });
    }

    // Search documents
    if (state.documents) {
      state.documents.forEach(doc => {
        if (doc.name?.toLowerCase().includes(searchLower) || 
            doc.analysis?.summary?.toLowerCase().includes(searchLower)) {
          results.push({
            id: doc.id,
            type: 'document',
            title: doc.name || 'Untitled Document',
            description: doc.analysis?.summary || 'No summary available',
            highlight: doc.name?.toLowerCase().includes(searchLower) ? 
              doc.name : doc.analysis?.summary
          });
        }
      });
    }

    // Search advisors
    if (state.advisors) {
      state.advisors.forEach(advisor => {
        if (advisor.name?.toLowerCase().includes(searchLower) || 
            advisor.role?.toLowerCase().includes(searchLower) ||
            advisor.specialty_focus?.toLowerCase().includes(searchLower) ||
            advisor.background?.toLowerCase().includes(searchLower)) {
          results.push({
            id: advisor.id,
            type: 'advisor',
            title: advisor.name || 'Unknown Advisor',
            description: advisor.role || advisor.specialty_focus || 'No description',
            highlight: advisor.name?.toLowerCase().includes(searchLower) ? 
              advisor.name : advisor.role
          });
        }
      });
    }

    // Sort results: help first, then conversations, documents, advisors
    const sortedResults = results.sort((a, b) => {
      const typeOrder = { help: 0, conversation: 1, document: 2, advisor: 3 };
      return typeOrder[a.type] - typeOrder[b.type];
    });

    // Limit results and show
    const limitedResults = sortedResults.slice(0, 10);
    setSearchResults(limitedResults);
    setShowSearchResults(true);
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    setShowSearchResults(false);
    setSearchTerm('');
    
    if (result.type === 'conversation') {
      if (result.id.startsWith('message-')) {
        // Already in conversation, maybe scroll to message
        setActiveModule('ai');
      } else {
        // Switch to conversation
        if (dispatch && actions.SET_ACTIVE_CONVERSATION) {
          const conversation = state.conversations?.find(c => c.id === result.id);
          if (conversation) {
            dispatch({ type: actions.SET_ACTIVE_CONVERSATION, payload: conversation });
          }
        }
        setActiveModule('ai');
      }
    } else if (result.type === 'document') {
      setActiveModule('documents');
      // Could add document selection here
    } else if (result.type === 'advisor') {
      setActiveModule('advisors');
      // Could add advisor selection here
    } else if (result.type === 'help') {
      // Open help section
      openHelp(result.id);
    }
  };


  return (
    <div className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
              AI
            </div>
            <span className="font-semibold text-gray-800">Board of Advisors</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Search Bar (when expanded) */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search conversations, documents, advisors..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                performSearch(e.target.value);
              }}
              onFocus={() => searchTerm && setShowSearchResults(true)}
              onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
              className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSearchResults([]);
                  setShowSearchResults(false);
                }}
                className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
            <kbd className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
              ⌘K
            </kbd>
          </div>
          
          {/* Search Results Dropdown */}
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-4 right-4 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-80 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={`${result.type}-${result.id || index}`}
                  onClick={() => handleSearchResultClick(result)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start space-x-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    result.type === 'conversation' ? 'bg-blue-100 text-blue-600' :
                    result.type === 'document' ? 'bg-green-100 text-green-600' :
                    result.type === 'advisor' ? 'bg-purple-100 text-purple-600' :
                    result.type === 'help' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {result.type === 'conversation' ? <MessageSquare size={16} /> :
                     result.type === 'document' ? <FileText size={16} /> :
                     result.type === 'advisor' ? <Users size={16} /> :
                     result.type === 'help' ? <HelpCircle size={16} /> :
                     <Search size={16} />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{result.title}</p>
                    <p className="text-xs text-gray-500 truncate">{result.description}</p>
                    {result.highlight && (
                      <p className="text-xs text-blue-600 mt-1 truncate">...{result.highlight}...</p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 capitalize flex-shrink-0">{result.type}</span>
                </button>
              ))}
              
              {searchResults.length === 0 && searchTerm && (
                <div className="px-4 py-3 text-center text-gray-500 text-sm">
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        {modules.map((module) => {
          const Icon = module.icon;
          const isActive = activeModule === module.id;
          
          return (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2 rounded-lg mb-1
                transition-all duration-200 group
                ${isActive 
                  ? `bg-${module.color}-50 text-${module.color}-600` 
                  : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                }
              `}
              title={collapsed ? module.name : ''}
            >
              <Icon size={20} className={`flex-shrink-0 ${isActive ? `text-${module.color}-600` : ''}`} />
              {!collapsed && (
                <>
                  <span className="font-medium">{module.name}</span>
                  {module.id === 'ai' && state.notifications?.length > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {state.notifications.length}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200">
        {/* Voice Controls - Speaker Only */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-center">
            <HelpTooltip content="Toggle voice output settings">
              <button
                onClick={toggleVoice}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceEnabled 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={isVoiceEnabled ? 'Disable voice' : 'Enable voice'}
              >
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </HelpTooltip>
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        {!collapsed && (
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
              <Command size={12} />
              <span>+K for search</span>
              <span>•</span>
              <span>? for help</span>
            </div>
          </div>
        )}

        {/* User Section */}
        <div className="p-3 relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            {!collapsed && (
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'User'}</p>
                <p className="text-xs text-gray-500">{user?.email || 'Guest'}</p>
              </div>
            )}
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <button
                onClick={() => {
                  setActiveModule('settings');
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Settings size={16} />
                <span>Settings</span>
              </button>
              <button
                onClick={() => {
                  openHelp();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <HelpCircle size={16} />
                <span>Help & Support</span>
              </button>
              <div className="border-t border-gray-200 mt-1 pt-1">
                <button
                  onClick={signOut}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}