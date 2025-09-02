// src/components/AdvisorySettingsModal/AdvisorySettingsModal.js
import React, { useState, useEffect } from 'react';
import { X, Settings, Users, Brain, Database, Download, Upload, Trash2, RefreshCw, Mic, Volume2, Wifi, WifiOff } from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { advisorService } from '../../services/supabase';
import { useSupabase } from '../../contexts/SupabaseContext';
import { openaiRealtimeService } from '../../services/openaiRealtime';

export default function AdvisorySettingsModal({ isOpen, onClose }) {
  const { state, dispatch, actions } = useAppState();
  const { user } = useSupabase();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  
  // Voice control states
  const [openaiApiKey, setOpenaiApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Voice control effects
  useEffect(() => {
    const handleVoiceConnected = () => {
      setIsVoiceConnected(true);
      setVoiceError(null);
    };

    const handleVoiceDisconnected = () => {
      setIsVoiceConnected(false);
    };

    const handleVoiceError = (err) => {
      setVoiceError(err.message || 'Voice service error');
      setIsVoiceConnected(false);
    };

    openaiRealtimeService.on('connected', handleVoiceConnected);
    openaiRealtimeService.on('disconnected', handleVoiceDisconnected);
    openaiRealtimeService.on('error', handleVoiceError);

    return () => {
      openaiRealtimeService.removeAllListeners();
    };
  }, []);

  // Save API key to localStorage
  useEffect(() => {
    if (openaiApiKey) {
      localStorage.setItem('openai_api_key', openaiApiKey);
    }
  }, [openaiApiKey]);

  // Voice control handlers
  const handleTestVoiceConnection = async () => {
    if (!openaiApiKey) {
      setVoiceError('Please enter your OpenAI API key first');
      return;
    }

    setIsTestingVoice(true);
    try {
      await openaiRealtimeService.initialize(openaiApiKey);
      await openaiRealtimeService.connect();
      setTimeout(() => {
        openaiRealtimeService.disconnect();
        setIsTestingVoice(false);
      }, 2000);
    } catch (err) {
      setVoiceError(err.message);
      setIsTestingVoice(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'selection', name: 'Selection', icon: Users },
    { id: 'ai', name: 'AI Settings', icon: Brain },
    { id: 'data', name: 'Data Management', icon: Database }
  ];

  const handleExportAdvisors = () => {
    const advisorsData = {
      timestamp: new Date().toISOString(),
      advisors: state.advisors,
      selectedAdvisors: state.selectedAdvisors,
      customAdvisors: state.customAdvisors
    };
    
    const blob = new Blob([JSON.stringify(advisorsData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `advisors-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportAdvisors = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.advisors && Array.isArray(importedData.advisors)) {
          dispatch({ type: actions.SET_ADVISORS, payload: importedData.advisors });
          if (importedData.selectedAdvisors) {
            dispatch({ type: actions.SELECT_ADVISORS, payload: importedData.selectedAdvisors });
          }
          alert('Advisors imported successfully!');
        } else {
          throw new Error('Invalid file format');
        }
      } catch (error) {
        alert('Failed to import advisors. Please check the file format.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('This will reset all advisors to defaults and remove custom advisors. Are you sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      // Reload default advisors from database
      const { data: defaultAdvisors, error } = await advisorService.getDefaultAdvisors();
      if (error) throw error;

      dispatch({ type: actions.SET_ADVISORS, payload: defaultAdvisors });
      dispatch({ type: actions.SELECT_ADVISORS, payload: defaultAdvisors.slice(0, 5) });
      
      alert('Advisors reset to defaults successfully!');
    } catch (error) {
      logger.error('Reset failed:', error);
      alert('Failed to reset advisors. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSelections = () => {
    dispatch({ type: actions.SELECT_ADVISORS, payload: [] });
  };

  const handleSelectAll = () => {
    dispatch({ type: actions.SELECT_ADVISORS, payload: state.advisors });
  };

  const handleSelectRecommended = () => {
    // Select a recommended set: Host + diverse expertise
    const recommended = state.advisors.filter(advisor => 
      advisor.is_host || 
      ['Chief Strategy Officer', 'CFO', 'CMO', 'Chief Technology Officer'].includes(advisor.role) ||
      advisor.name === 'Mark Cuban'
    ).slice(0, 5);
    
    dispatch({ type: actions.SELECT_ADVISORS, payload: recommended });
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">{state.advisors?.length || 0}</div>
          <div className="text-sm text-blue-800">Total Advisors</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-green-600">{state.selectedAdvisors?.length || 0}</div>
          <div className="text-sm text-green-800">Selected</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">{state.customAdvisors?.length || 0}</div>
          <div className="text-sm text-purple-800">Custom Advisors</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Advisory Board Preferences</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              defaultChecked 
            />
            <span className="ml-2 text-sm text-gray-700">Auto-select new advisors for meetings</span>
          </label>
          
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              defaultChecked 
            />
            <span className="ml-2 text-sm text-gray-700">Show advisor expertise in UI</span>
          </label>
          
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
            />
            <span className="ml-2 text-sm text-gray-700">Enable advisor knowledge base integration</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSelectionTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Quick Selection Actions</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={handleSelectAll}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Users className="w-4 h-4" />
            <span>Select All</span>
          </button>
          
          <button
            onClick={handleClearSelections}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
          
          <button
            onClick={handleSelectRecommended}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Users className="w-4 h-4" />
            <span>Recommended</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Selection by Category</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              const coreTeam = state.advisors.filter(a => !a.is_custom && !a.is_celebrity);
              dispatch({ type: actions.SELECT_ADVISORS, payload: coreTeam });
            }}
            className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Core Team Only
          </button>
          
          <button
            onClick={() => {
              const celebrities = state.advisors.filter(a => a.is_celebrity);
              dispatch({ type: actions.SELECT_ADVISORS, payload: celebrities });
            }}
            className="px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
          >
            Celebrity Advisors
          </button>
          
          <button
            onClick={() => {
              const sharks = state.advisors.filter(a => a.specialty_focus === 'venture_capital' || a.role.includes('Shark'));
              dispatch({ type: actions.SELECT_ADVISORS, payload: sharks });
            }}
            className="px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
          >
            Shark Tank
          </button>
          
          <button
            onClick={() => {
              const custom = state.advisors.filter(a => a.is_custom);
              dispatch({ type: actions.SELECT_ADVISORS, payload: custom });
            }}
            className="px-3 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Custom Only
          </button>
        </div>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="space-y-8">
      {/* API Keys Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Brain className="w-4 h-4 mr-2 text-blue-600" />
          AI Service API Keys
        </h4>
        
        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OpenAI API Key (Required for Voice Control)
            </label>
            <div className="flex space-x-2">
              <input
                type="password"
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleTestVoiceConnection}
                disabled={!openaiApiKey || isTestingVoice}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isTestingVoice ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Wifi className="w-4 h-4" />
                )}
                <span>{isTestingVoice ? 'Testing...' : 'Test'}</span>
              </button>
            </div>
            {voiceError && (
              <p className="mt-1 text-sm text-red-600">{voiceError}</p>
            )}
            {isVoiceConnected && !voiceError && (
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <Wifi className="w-4 h-4 mr-1" />
                Voice service connected successfully
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Anthropic Claude API Key
              </label>
              <input
                type="password"
                placeholder="sk-ant-..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Gemini API Key
              </label>
              <input
                type="password"
                placeholder="AIza..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Voice Control Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 flex items-center">
          <Volume2 className="w-4 h-4 mr-2 text-purple-600" />
          Voice Control Settings
        </h4>
        
        <div className="space-y-4 bg-purple-50 p-4 rounded-lg">
          <div className="space-y-3">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                defaultChecked 
              />
              <span className="ml-2 text-sm text-gray-700">Enable voice control for advisor management</span>
            </label>
            
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                defaultChecked 
              />
              <span className="ml-2 text-sm text-gray-700">Auto-connect voice when editing advisors</span>
            </label>
            
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
              />
              <span className="ml-2 text-sm text-gray-700">Show voice transcription during editing</span>
            </label>
            
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                defaultChecked 
              />
              <span className="ml-2 text-sm text-gray-700">Enable audio responses from AI assistant</span>
            </label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Model
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>gpt-4o-realtime-preview</option>
                <option>gpt-4o-realtime-preview-2024-10-01</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Voice Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option>alloy</option>
                <option>echo</option>
                <option>fable</option>
                <option>onyx</option>
                <option>nova</option>
                <option>shimmer</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Default AI Service Configuration */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Default AI Service Configuration</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default AI Service for New Advisors
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>🤖 Anthropic Claude</option>
              <option>🧠 OpenAI GPT</option>
              <option>💎 Google Gemini</option>
              <option>🌊 DeepSeek</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Response Style
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Balanced</option>
              <option>Creative</option>
              <option>Precise</option>
              <option>Detailed</option>
            </select>
          </div>
        </div>
      </div>

      {/* AI Response Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">AI Response Settings</h4>
        
        <div className="space-y-3">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              defaultChecked 
            />
            <span className="ml-2 text-sm text-gray-700">Enable streaming responses</span>
          </label>
          
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
            />
            <span className="ml-2 text-sm text-gray-700">Show AI service attribution</span>
          </label>
          
          <label className="flex items-center">
            <input 
              type="checkbox" 
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
            />
            <span className="ml-2 text-sm text-gray-700">Enable fallback AI services</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Backup & Restore</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleExportAdvisors}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            <span>Export Advisors</span>
          </button>
          
          <label className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Import Advisors</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportAdvisors}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900">Reset Options</h4>
        
        <div className="space-y-3">
          <button
            onClick={handleResetToDefaults}
            disabled={isLoading}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('This will remove all custom advisors. Are you sure?')) {
                const nonCustom = state.advisors.filter(a => !a.is_custom);
                dispatch({ type: actions.SET_ADVISORS, payload: nonCustom });
              }
            }}
            className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove Custom Advisors</span>
          </button>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Data Storage</h5>
        <p className="text-xs text-gray-600">
          {user ? 
            'Your advisor configurations are synced to the cloud and will be available across devices.' :
            'Your advisor configurations are stored locally. Sign in to sync across devices.'
          }
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Settings className="w-6 h-6 mr-2 text-blue-600" />
            Advisory Board Settings
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'selection' && renderSelectionTab()}
          {activeTab === 'ai' && renderAITab()}
          {activeTab === 'data' && renderDataTab()}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}