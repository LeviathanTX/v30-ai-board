// src/components/Legal/LegalFooter.js
import React, { useState } from 'react';
import { Shield, FileText } from 'lucide-react';
import TermsOfService from './TermsOfService';
import PrivacyPolicy from './PrivacyPolicy';

export default function LegalFooter({ className = "" }) {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <>
      <div className={`flex items-center justify-center space-x-6 text-sm ${className}`}>
        <button
          onClick={() => setShowPrivacy(true)}
          className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <Shield className="w-4 h-4" />
          <span>Privacy Policy</span>
        </button>
        
        <div className="w-px h-4 bg-gray-300" />
        
        <button
          onClick={() => setShowTerms(true)}
          className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FileText className="w-4 h-4" />
          <span>Terms of Service</span>
        </button>
      </div>

      <TermsOfService 
        isOpen={showTerms} 
        onClose={() => setShowTerms(false)} 
      />
      
      <PrivacyPolicy 
        isOpen={showPrivacy} 
        onClose={() => setShowPrivacy(false)} 
      />
    </>
  );
}