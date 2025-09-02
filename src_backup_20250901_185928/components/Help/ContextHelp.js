// src/components/Help/ContextHelp.js
import React, { useState, useEffect } from 'react';
import { HelpCircle, X, ExternalLink } from 'lucide-react';

const HELP_CONTENT = {
  'meeting-environment': {
    title: 'Meeting Environments',
    content: 'Choose your meeting style: Standard Chat for casual conversations, Board Room for formal meetings, Shark Tank for investor pitches, or Enhanced Meeting for advanced features.',
    moreInfo: 'Learn more about each environment and their unique features.'
  },
  'advisor-selection': {
    title: 'AI Advisors',
    content: 'Select advisors to participate in your meeting. Each advisor brings unique expertise and personality. Use the All/None toggle for quick selection.',
    moreInfo: 'Discover how different advisors can enhance your discussions.'
  },
  'voice-controls': {
    title: 'Voice Controls',
    content: 'Click the microphone to speak your message, and use the speaker icon to adjust voice output settings. Voice input supports multiple languages.',
    moreInfo: 'Explore advanced voice features and keyboard shortcuts.'
  },
  'document-upload': {
    title: 'Document Upload',
    content: 'Upload documents to share context with your AI advisors. Supported formats include PDF, Word, Excel, and text files. Your documents remain private.',
    moreInfo: 'Learn about document security and processing capabilities.'
  },
  'subscription': {
    title: 'Subscription Management',
    content: 'Manage your plan, billing, and usage limits. Upgrade for more features like longer meetings, additional advisors, and priority support.',
    moreInfo: 'Compare plans and features in detail.'
  },
  'default-page': {
    title: 'Default Page',
    content: 'Set which page opens when you start the app. Choose from AI Board, Dashboard, Documents, Advisors, or Meetings based on your workflow.',
    moreInfo: 'Customize your startup experience and navigation preferences.'
  },
  'privacy-settings': {
    title: 'Privacy & Security',
    content: 'Your conversations and documents are processed locally when possible and deleted immediately after processing. We never store your intellectual property.',
    moreInfo: 'Read our complete privacy policy and terms of service.'
  },
  'keyboard-shortcuts': {
    title: 'Keyboard Shortcuts',
    content: 'Use Cmd/Ctrl+K to open the command palette, Cmd/Ctrl+Enter to send messages, and Esc to close dialogs. More shortcuts available in Help.',
    moreInfo: 'View all available keyboard shortcuts and customize them.'
  },
  'shark-tank-timer': {
    title: 'Shark Tank Timer',
    content: 'Set a time limit for your pitch. The timer changes color as time runs out - yellow for the last minute, red for the final 30 seconds.',
    moreInfo: 'Learn about Shark Tank mode features and best practices.'
  }
};

export default function ContextHelp({ 
  helpKey, 
  position = 'top', 
  className = '', 
  iconSize = 16,
  showOnHover = false 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [helpContent, setHelpContent] = useState(null);

  useEffect(() => {
    if (helpKey && HELP_CONTENT[helpKey]) {
      setHelpContent(HELP_CONTENT[helpKey]);
    }
  }, [helpKey]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (!showOnHover) {
      setIsVisible(!isVisible);
    }
  };

  const handleOpenFullHelp = () => {
    // Dispatch custom event to open help documentation
    window.dispatchEvent(new CustomEvent('open-help', { 
      detail: { section: helpKey } 
    }));
    setIsVisible(false);
  };

  if (!helpContent) return null;

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Help Icon Trigger */}
      <button
        onClick={handleToggle}
        onMouseEnter={showOnHover ? () => setIsVisible(true) : undefined}
        onMouseLeave={showOnHover ? () => setIsVisible(false) : undefined}
        className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded-full hover:bg-blue-50"
        title={`Help: ${helpContent.title}`}
      >
        <HelpCircle size={iconSize} />
      </button>

      {/* Popup Content */}
      {isVisible && (
        <>
          {/* Backdrop for click-to-close */}
          {!showOnHover && (
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsVisible(false)}
            />
          )}
          
          {/* Popup */}
          <div className={`
            absolute z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 p-4
            ${positionClasses[position]}
          `}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 text-sm">
                {helpContent.title}
              </h3>
              {!showOnHover && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Content */}
            <p className="text-gray-600 text-sm leading-relaxed mb-3">
              {helpContent.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <button
                onClick={handleOpenFullHelp}
                className="text-blue-600 hover:text-blue-700 text-xs flex items-center space-x-1 hover:underline"
              >
                <span>{helpContent.moreInfo}</span>
                <ExternalLink size={12} />
              </button>
              <div className="text-xs text-gray-400">
                Press ? for shortcuts
              </div>
            </div>

            {/* Arrow pointer */}
            <div className={`
              absolute w-2 h-2 bg-white border transform rotate-45
              ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1 border-r border-b border-gray-200' : ''}
              ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-l border-t border-gray-200' : ''}
              ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1 border-t border-r border-gray-200' : ''}
              ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1 border-b border-l border-gray-200' : ''}
            `} />
          </div>
        </>
      )}
    </div>
  );
}

// Quick help tooltip component for simple cases
export function HelpTooltip({ content, position = 'top', children, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (
        <div className={`
          absolute z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap
          ${positionClasses[position]}
        `}>
          {content}
          
          {/* Arrow */}
          <div className={`
            absolute w-2 h-2 bg-gray-900 transform rotate-45
            ${position === 'top' ? 'top-full left-1/2 -translate-x-1/2 -mt-1' : ''}
            ${position === 'bottom' ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1' : ''}
            ${position === 'left' ? 'left-full top-1/2 -translate-y-1/2 -ml-1' : ''}
            ${position === 'right' ? 'right-full top-1/2 -translate-y-1/2 -mr-1' : ''}
          `} />
        </div>
      )}
    </div>
  );
}