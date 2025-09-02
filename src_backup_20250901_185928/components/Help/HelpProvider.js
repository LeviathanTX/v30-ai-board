// src/components/Help/HelpProvider.js
import React, { createContext, useContext, useState, useEffect } from 'react';

const HelpContext = createContext();

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (!context) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

export default function HelpProvider({ children }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [helpSection, setHelpSection] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ? key to open help
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only trigger if not in an input field
        if (!['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
          e.preventDefault();
          setIsHelpOpen(true);
        }
      }
      
      // Escape to close help
      if (e.key === 'Escape' && isHelpOpen) {
        setIsHelpOpen(false);
        setHelpSection(null);
      }
    };

    const handleOpenHelp = (e) => {
      setIsHelpOpen(true);
      if (e.detail?.section) {
        setHelpSection(e.detail.section);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-help', handleOpenHelp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-help', handleOpenHelp);
    };
  }, [isHelpOpen]);

  const openHelp = (section = null) => {
    setIsHelpOpen(true);
    setHelpSection(section);
  };

  const closeHelp = () => {
    setIsHelpOpen(false);
    setHelpSection(null);
  };

  const value = {
    isHelpOpen,
    helpSection,
    openHelp,
    closeHelp
  };

  return (
    <HelpContext.Provider value={value}>
      {children}
    </HelpContext.Provider>
  );
}