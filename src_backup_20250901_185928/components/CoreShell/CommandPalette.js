import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Home, FileText, Users, MessageSquare, 
  Video, CreditCard, Plus, Upload, Settings, 
  LogOut, HelpCircle, Command, ArrowRight,
  Sparkles, Calendar, BarChart3, Moon, Sun
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';

export default function CommandPalette({ isOpen, onClose, setActiveModule }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { state, dispatch } = useAppState();
  const { signOut } = useSupabase();
  const isDarkMode = state.settings?.theme === 'dark';

  const commands = [
    {
      category: 'Navigation',
      items: [
        { 
          icon: Home, 
          label: 'Go to Dashboard', 
          shortcut: '⌘D',
          action: () => { setActiveModule('dashboard'); onClose(); }
        },
        { 
          icon: FileText, 
          label: 'Go to Documents', 
          shortcut: '⌘F',
          action: () => { setActiveModule('documents'); onClose(); }
        },
        { 
          icon: Users, 
          label: 'Go to Advisors', 
          shortcut: '⌘A',
          action: () => { setActiveModule('advisors'); onClose(); }
        },
        { 
          icon: MessageSquare, 
          label: 'Go to AI Board', 
          shortcut: '⌘B',
          action: () => { setActiveModule('ai'); onClose(); }
        },
        { 
          icon: Video, 
          label: 'Go to Meetings', 
          shortcut: '⌘M',
          action: () => { setActiveModule('meetings'); onClose(); }
        }
      ]
    },
    {
      category: 'Actions',
      items: [
        { 
          icon: Plus, 
          label: 'Start New Meeting', 
          shortcut: '⌘N',
          action: () => {
            setActiveModule('ai');
            dispatch({ type: 'START_MEETING' });
            onClose();
          }
        },
        { 
          icon: Upload, 
          label: 'Upload Document', 
          shortcut: '⌘U',
          action: () => {
            setActiveModule('documents');
            // Trigger upload in document module
            dispatch({ type: 'TRIGGER_UPLOAD' });
            onClose();
          }
        },
        { 
          icon: Sparkles, 
          label: 'AI Quick Analysis', 
          shortcut: '⌘I',
          action: () => {
            setActiveModule('ai');
            dispatch({ type: 'QUICK_ANALYSIS' });
            onClose();
          }
        },
        { 
          icon: Calendar, 
          label: 'Schedule Meeting', 
          shortcut: '⌘S',
          action: () => {
            setActiveModule('meetings');
            dispatch({ type: 'SCHEDULE_MEETING' });
            onClose();
          }
        }
      ]
    },
    {
      category: 'Settings',
      items: [
        { 
          icon: isDarkMode ? Sun : Moon, 
          label: `Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`, 
          shortcut: '⌘T',
          action: () => {
            dispatch({ 
              type: 'UPDATE_SETTINGS', 
              payload: { theme: isDarkMode ? 'light' : 'dark' } 
            });
          }
        },
        { 
          icon: Settings, 
          label: 'Open Settings', 
          shortcut: '⌘,',
          action: () => {
            // Open settings modal
            onClose();
          }
        },
        { 
          icon: HelpCircle, 
          label: 'Help & Support', 
          shortcut: '⌘?',
          action: () => {
            // Open help
            onClose();
          }
        },
        { 
          icon: LogOut, 
          label: 'Sign Out', 
          shortcut: '⌘Q',
          action: async () => {
            await signOut();
            onClose();
          }
        }
      ]
    }
  ];

  // Filter commands based on search
  const filteredCommands = commands.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.label.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  // Calculate total number of items for keyboard navigation
  const totalItems = filteredCommands.reduce((acc, cat) => acc + cat.items.length, 0);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % totalItems);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
          break;
        case 'Enter':
          e.preventDefault();
          let currentIndex = 0;
          for (const category of filteredCommands) {
            for (const item of category.items) {
              if (currentIndex === selectedIndex) {
                item.action();
                return;
              }
              currentIndex++;
            }
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, totalItems, filteredCommands, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Command Palette */}
      <div className="relative min-h-screen flex items-start justify-center pt-[10vh]">
        <div className={`
          relative w-full max-w-2xl mx-4
          ${isDarkMode ? 'bg-gray-900' : 'bg-white'}
          rounded-xl shadow-2xl overflow-hidden
          transform transition-all duration-200 scale-100
        `}>
          {/* Search Header */}
          <div className={`
            p-4 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} 
            border-b
          `}>
            <div className="flex items-center space-x-3">
              <Command size={20} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                className={`
                  flex-1 bg-transparent outline-none text-lg
                  ${isDarkMode ? 'text-white placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}
                `}
              />
              <button
                onClick={onClose}
                className={`
                  p-1.5 rounded-lg transition-colors
                  ${isDarkMode 
                    ? 'hover:bg-gray-800 text-gray-500' 
                    : 'hover:bg-gray-100 text-gray-400'
                  }
                `}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Commands List */}
          <div className="max-h-[60vh] overflow-y-auto py-2">
            {filteredCommands.length === 0 ? (
              <div className={`
                py-8 text-center 
                ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}
              `}>
                No commands found
              </div>
            ) : (
              filteredCommands.map((category, categoryIndex) => (
                <div key={category.category}>
                  <div className={`
                    px-4 py-2 text-xs font-medium uppercase tracking-wider
                    ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}
                  `}>
                    {category.category}
                  </div>
                  {category.items.map((item, itemIndex) => {
                    const Icon = item.icon;
                    let currentIndex = 0;
                    for (let i = 0; i < categoryIndex; i++) {
                      currentIndex += filteredCommands[i].items.length;
                    }
                    currentIndex += itemIndex;
                    const isSelected = currentIndex === selectedIndex;

                    return (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className={`
                          w-full px-4 py-3 flex items-center justify-between
                          transition-all duration-150
                          ${isSelected 
                            ? isDarkMode
                              ? 'bg-gray-800 text-white' 
                              : 'bg-gray-100 text-gray-900'
                            : isDarkMode
                              ? 'hover:bg-gray-800/50 text-gray-300' 
                              : 'hover:bg-gray-50 text-gray-700'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`
                            p-2 rounded-lg
                            ${isSelected 
                              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                              : isDarkMode
                                ? 'bg-gray-800 text-gray-500'
                                : 'bg-gray-100 text-gray-500'
                            }
                          `}>
                            <Icon size={16} />
                          </div>
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.shortcut && (
                            <kbd className={`
                              px-2 py-1 text-xs rounded
                              ${isDarkMode 
                                ? 'bg-gray-800 text-gray-400' 
                                : 'bg-gray-200 text-gray-500'
                              }
                            `}>
                              {item.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <ArrowRight size={16} className="text-gray-400" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className={`
            px-4 py-3 ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} 
            border-t flex items-center justify-between text-xs
            ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}
          `}>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <kbd className={`
                  px-1.5 py-0.5 rounded 
                  ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}
                `}>↑</kbd>
                <kbd className={`
                  px-1.5 py-0.5 rounded 
                  ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}
                `}>↓</kbd>
                <span>to navigate</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className={`
                  px-1.5 py-0.5 rounded 
                  ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}
                `}>↵</kbd>
                <span>to select</span>
              </span>
              <span className="flex items-center space-x-1">
                <kbd className={`
                  px-1.5 py-0.5 rounded 
                  ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}
                `}>esc</kbd>
                <span>to close</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}