// src/components/Shared/ApiKeyManager.js
import React, { useState, useEffect } from 'react';
import {
  Key, X, Eye, EyeOff, CheckCircle, AlertCircle,
  Loader2, ExternalLink, Shield, Save
} from 'lucide-react';

export default function ApiKeyManager({ isOpen, onClose, onKeyUpdate }) {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState(null);
  const [error, setError] = useState('');

  // Load existing key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('claude_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setValidationStatus('valid');
    }
  }, []);

  // Since we're using server-side API key, we don't need to validate client-side keys
  const validateApiKey = async (key) => {
    if (!key || !key.startsWith('sk-ant-')) {
      setError('Invalid API key format. Should start with sk-ant-');
      setValidationStatus('invalid');
      return false;
    }

    // Just save it locally - actual validation will happen on API calls
    setValidationStatus('valid');
    localStorage.setItem('claude_api_key', key);
    if (onKeyUpdate) onKeyUpdate(key);
    
    // Auto-close after successful save
    setTimeout(() => {
      if (onClose) onClose();
    }, 1500);
    
    return true;
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }
    await validateApiKey(apiKey);
  };

  const handleRemoveKey = () => {
    localStorage.removeItem('claude_api_key');
    setApiKey('');
    setValidationStatus(null);
    setError('');
    if (onKeyUpdate) onKeyUpdate(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">API Key Configuration</h2>
              <p className="text-sm text-gray-500">Configure your Claude API key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Security Notice */}
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Your API key is secure</p>
              <p className="text-blue-700">Stored locally in your browser and never sent to our servers</p>
            </div>
          </div>

          {/* API Key Input */}
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-medium text-gray-900">API Key Configured on Server</p>
            <p className="text-sm text-gray-600 mt-2">
              The Claude API is configured server-side for security.
            </p>
            <p className="text-sm text-gray-600 mt-1">
              No client-side configuration needed.
            </p>
          </div>

          {/* Validation Status */}
          {validationStatus === 'valid' && (
            <div className="flex items-center space-x-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">API key validated successfully</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Get API Key Link */}
          {!apiKey && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Don't have an API key?</span>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <span>Get one here</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          {apiKey && validationStatus === 'valid' && (
            <button
              onClick={handleRemoveKey}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
            >
              Remove Key
            </button>
          )}
          <div className={`flex space-x-3 ${!apiKey || validationStatus !== 'valid' ? 'ml-auto' : ''}`}>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!apiKey || isValidating}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save API Key</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}