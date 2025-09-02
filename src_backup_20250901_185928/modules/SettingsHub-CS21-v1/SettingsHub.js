// src/modules/SettingsHub-CS21-v1/SettingsHub.js
import React, { useState, useEffect } from 'react';
import { 
  Settings, User, CreditCard, Palette, Volume2, VolumeX, 
  Globe, Shield, FileText, Home, MessageSquare, Users, 
  Video, Bell, Moon, Sun, Monitor, Save, Check, X,
  ArrowRight, TrendingUp, Sparkles, Building, Clock, BarChart,
  Brain, Database, Download, Upload, Trash2, RefreshCw, Wifi,
  CheckCircle, AlertCircle, Eye, EyeOff, Zap, Cpu
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useVoice } from '../../contexts/VoiceContext';
import LegalFooter from '../../components/Legal/LegalFooter';
import ContextHelp from '../../components/Help/ContextHelp';
import { advisorService } from '../../services/supabase';
import { openaiRealtimeService } from '../../services/openaiRealtime';

export default function SettingsHub() {
  const { state, dispatch, actions } = useAppState();
  const { user } = useSupabase();
  const { isVoiceEnabled, toggleVoice } = useVoice();
  
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    defaultPage: 'ai',
    theme: 'system',
    voiceEnabled: isVoiceEnabled,
    notifications: true,
    autoSave: true,
    billingCycle: 'monthly'
  });
  const [saveStatus, setSaveStatus] = useState('');
  
  // AI Services state - moved here to be available in useEffect
  const [aiServices, setAiServices] = useState({
    openai: { name: 'OpenAI', apiKey: '', connected: false, models: ['gpt-4o', 'gpt-4o-mini'] },
    deepseek: { name: 'DeepSeek', apiKey: '', connected: false, models: ['deepseek-chat'] },
    anthropic: { name: 'Claude (Anthropic)', apiKey: '', connected: false, models: ['claude-3-5-sonnet-20241022'] },
    google: { name: 'Google Gemini', apiKey: '', connected: false, models: ['gemini-1.5-pro'] }
  });
  
  // Voice Services state - moved here to be available in useEffect
  const [voiceServices, setVoiceServices] = useState({
    openai_realtime: { name: 'OpenAI Realtime', apiKey: '', connected: false, models: ['gpt-4o-realtime-preview'] }
  });
  
  // Advisory Board Settings State
  const [isLoading, setIsLoading] = useState(false);
  const [openaiApiKey, setOpenaiApiKey] = useState(localStorage.getItem('openai_api_key') || '');
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [voiceError, setVoiceError] = useState(null);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
    
    // Load AI service API keys
    const loadedAiServices = { ...aiServices };
    Object.keys(loadedAiServices).forEach(service => {
      const storedKey = localStorage.getItem(`${service}_api_key`);
      if (storedKey) {
        loadedAiServices[service].apiKey = storedKey;
        loadedAiServices[service].connected = true;
      }
    });
    setAiServices(loadedAiServices);
    
    // Load Voice service API keys
    const loadedVoiceServices = { ...voiceServices };
    Object.keys(loadedVoiceServices).forEach(service => {
      const storedKey = localStorage.getItem(`${service}_api_key`);
      if (storedKey) {
        loadedVoiceServices[service].apiKey = storedKey;
        loadedVoiceServices[service].connected = true;
      }
    });
    setVoiceServices(loadedVoiceServices);
  }, []);

  // Voice control effects for Advisory Board
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

  // Save settings to localStorage
  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Advisory Board Settings Handlers
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

  const pageOptions = [
    { id: 'ai', name: 'AI Board Meeting', icon: MessageSquare },
    { id: 'dashboard', name: 'Dashboard', icon: Home },
    { id: 'documents', name: 'Documents', icon: FileText },
    { id: 'advisors', name: 'Advisors', icon: Users },
    { id: 'meetings', name: 'Meetings', icon: Video }
  ];

  const subscriptionPlans = [
    {
      name: 'Starter',
      price: { monthly: 199, yearly: 1990 },
      description: 'Perfect for small businesses and solo entrepreneurs',
      features: [
        'Up to 3 AI Advisors',
        '50 monthly meetings',
        '10 document analyses/month',
        'Basic insights and summaries',
        'Email support'
      ],
      color: 'gray',
      popular: false
    },
    {
      name: 'Professional',
      price: { monthly: 499, yearly: 4990 },
      description: 'Ideal for growing companies and teams',
      features: [
        'Unlimited AI Advisors',
        'Unlimited meetings',
        'Unlimited document analysis',
        'Custom advisor creation (up to 5)',
        'Video platform integration',
        'Priority support',
        'Advanced analytics'
      ],
      color: 'blue',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 1999, yearly: 19990 },
      description: 'For large organizations with complex needs',
      features: [
        'Everything in Professional',
        'Unlimited custom advisors',
        'White-label options',
        'SSO integration',
        'Dedicated account manager',
        'Custom integrations',
        'On-premise deployment option'
      ],
      color: 'purple',
      popular: false
    }
  ];

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'ai-services', name: 'AI Services', icon: Brain },
    { id: 'account', name: 'Account', icon: User },
    { id: 'advisors', name: 'Advisory Board', icon: Users },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'privacy', name: 'Privacy & Legal', icon: Shield }
  ];

  // AI Service management functions
  const handleAiServiceKeyChange = (service, value) => {
    setAiServices(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        apiKey: value,
        error: null
      }
    }));
  };
  
  const handleVoiceServiceKeyChange = (service, value) => {
    setVoiceServices(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        apiKey: value,
        error: null
      }
    }));
  };
  
  const toggleKeyVisibility = (service, isVoice = false) => {
    if (isVoice) {
      setVoiceServices(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          showKey: !prev[service].showKey
        }
      }));
    } else {
      setAiServices(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          showKey: !prev[service].showKey
        }
      }));
    }
  };
  
  const testAiService = async (service) => {
    const serviceConfig = aiServices[service];
    if (!serviceConfig.apiKey) {
      setAiServices(prev => ({
        ...prev,
        [service]: { ...prev[service], error: 'API key is required' }
      }));
      return;
    }
    
    setAiServices(prev => ({
      ...prev,
      [service]: { ...prev[service], testing: true, error: null }
    }));
    
    try {
      // Simulate API test - in real implementation, make actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage and update state
      localStorage.setItem(`${service}_api_key`, serviceConfig.apiKey);
      setAiServices(prev => ({
        ...prev,
        [service]: { ...prev[service], testing: false, connected: true }
      }));
      
      // Update AppState context
      if (dispatch && actions.UPDATE_AI_SERVICE) {
        dispatch({
          type: actions.UPDATE_AI_SERVICE,
          payload: {
            service,
            config: { apiKey: serviceConfig.apiKey, connected: true }
          }
        });
      }
    } catch (error) {
      setAiServices(prev => ({
        ...prev,
        [service]: { 
          ...prev[service], 
          testing: false, 
          connected: false, 
          error: 'Connection failed. Please check your API key.' 
        }
      }));
    }
  };
  
  const testVoiceService = async (service) => {
    const serviceConfig = voiceServices[service];
    if (!serviceConfig.apiKey) {
      setVoiceServices(prev => ({
        ...prev,
        [service]: { ...prev[service], error: 'API key is required' }
      }));
      return;
    }
    
    setVoiceServices(prev => ({
      ...prev,
      [service]: { ...prev[service], testing: true, error: null }
    }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      localStorage.setItem(`${service}_api_key`, serviceConfig.apiKey);
      setVoiceServices(prev => ({
        ...prev,
        [service]: { ...prev[service], testing: false, connected: true }
      }));
    } catch (error) {
      setVoiceServices(prev => ({
        ...prev,
        [service]: { 
          ...prev[service], 
          testing: false, 
          connected: false, 
          error: 'Connection failed. Please check your API key.' 
        }
      }));
    }
  };
  
  const disconnectAiService = (service) => {
    localStorage.removeItem(`${service}_api_key`);
    setAiServices(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        apiKey: '',
        connected: false,
        error: null
      }
    }));
  };
  
  const disconnectVoiceService = (service) => {
    localStorage.removeItem(`${service}_api_key`);
    setVoiceServices(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        apiKey: '',
        connected: false,
        error: null
      }
    }));
  };
  
  const renderAiServicesSettings = () => {
    const aiServiceConfigs = {
      openai: { name: 'OpenAI', color: 'green', icon: Zap, description: 'GPT-4o, GPT-4o-mini models with advanced capabilities' },
      anthropic: { name: 'Claude (Anthropic)', color: 'orange', icon: Brain, description: 'Claude-3.5 Sonnet with superior reasoning abilities' },
      deepseek: { name: 'DeepSeek', color: 'blue', icon: Cpu, description: 'Cost-effective AI models with strong performance' },
      google: { name: 'Google Gemini', color: 'purple', icon: Sparkles, description: 'Gemini-1.5 Pro with multimodal capabilities' }
    };
    
    return (
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Chat Services</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure API keys for AI services. Each advisor can use a different AI service for diverse perspectives.
          </p>
          
          <div className="space-y-6">
            {Object.entries(aiServiceConfigs).map(([service, config]) => {
              const serviceState = aiServices[service];
              const Icon = config.icon;
              
              return (
                <div key={service} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${config.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{config.name}</h4>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    </div>
                    
                    {serviceState.connected && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type={serviceState.showKey ? 'text' : 'password'}
                            value={serviceState.apiKey}
                            onChange={(e) => handleAiServiceKeyChange(service, e.target.value)}
                            placeholder={`Enter your ${config.name} API key`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => toggleKeyVisibility(service)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {serviceState.showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {serviceState.connected ? (
                          <button
                            onClick={() => disconnectAiService(service)}
                            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => testAiService(service)}
                            disabled={serviceState.testing || !serviceState.apiKey}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {serviceState.testing ? 'Testing...' : 'Connect'}
                          </button>
                        )}
                      </div>
                      
                      {serviceState.error && (
                        <div className="mt-2 flex items-center space-x-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{serviceState.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Voice Services Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Voice Services</h3>
          <p className="text-sm text-gray-600 mb-6">
            Configure voice API keys for real-time voice interactions.
          </p>
          
          <div className="space-y-6">
            {Object.entries({
              openai_realtime: { name: 'OpenAI Realtime', color: 'green', icon: Volume2, description: 'Real-time voice conversation with GPT-4o' }
            }).map(([service, config]) => {
              const serviceState = voiceServices[service];
              const Icon = config.icon;
              
              return (
                <div key={service} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-${config.color}-100 flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 text-${config.color}-600`} />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{config.name}</h4>
                        <p className="text-sm text-gray-600">{config.description}</p>
                      </div>
                    </div>
                    
                    {serviceState.connected && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        API Key
                      </label>
                      <div className="flex space-x-2">
                        <div className="flex-1 relative">
                          <input
                            type={serviceState.showKey ? 'text' : 'password'}
                            value={serviceState.apiKey}
                            onChange={(e) => handleVoiceServiceKeyChange(service, e.target.value)}
                            placeholder={`Enter your ${config.name} API key`}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => toggleKeyVisibility(service, true)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {serviceState.showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        
                        {serviceState.connected ? (
                          <button
                            onClick={() => disconnectVoiceService(service)}
                            className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={() => testVoiceService(service)}
                            disabled={serviceState.testing || !serviceState.apiKey}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                          >
                            {serviceState.testing ? 'Testing...' : 'Connect'}
                          </button>
                        )}
                      </div>
                      
                      {serviceState.error && (
                        <div className="mt-2 flex items-center space-x-2 text-red-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{serviceState.error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Usage Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="font-medium text-blue-900 mb-2">💡 Usage Guidelines</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Multiple Services:</strong> Connect multiple AI services for diverse advisor perspectives</li>
            <li>• <strong>Fallback:</strong> If a preferred service is unavailable, the system will use the default service</li>
            <li>• <strong>Security:</strong> API keys are stored locally in your browser and never sent to our servers</li>
            <li>• <strong>Cost:</strong> You'll be charged directly by each AI service provider based on usage</li>
          </ul>
        </div>
      </div>
    );
  };
  
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">App Preferences</h3>
        
        {/* Default Page */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Default page when opening app
              </label>
              <ContextHelp 
                helpKey="default-page" 
                position="right"
                iconSize={14}
              />
            </div>
            <select
              value={settings.defaultPage}
              onChange={(e) => updateSetting('defaultPage', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {pageOptions.map(page => {
                const Icon = page.icon;
                return (
                  <option key={page.id} value={page.id}>
                    {page.name}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme preference
            </label>
            <div className="flex space-x-3">
              {[
                { id: 'light', name: 'Light', icon: Sun },
                { id: 'dark', name: 'Dark', icon: Moon },
                { id: 'system', name: 'System', icon: Monitor }
              ].map(theme => {
                const Icon = theme.icon;
                return (
                  <button
                    key={theme.id}
                    onClick={() => updateSetting('theme', theme.id)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                      settings.theme === theme.id
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Settings */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice & Audio
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.voiceEnabled}
                  onChange={(e) => {
                    updateSetting('voiceEnabled', e.target.checked);
                    if (e.target.checked !== isVoiceEnabled) {
                      toggleVoice();
                    }
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  {settings.voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  <span className="text-sm text-gray-700">Enable voice responses</span>
                </div>
              </label>
            </div>
          </div>

          {/* Other Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Preferences
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.notifications}
                  onChange={(e) => updateSetting('notifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Enable notifications</span>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => updateSetting('autoSave', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center space-x-2">
                  <Save className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Auto-save conversations</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-6 border-t border-gray-200">
        <button
          onClick={handleSaveSettings}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {saveStatus === 'saved' ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saveStatus === 'saved' ? 'Saved!' : 'Save Settings'}</span>
        </button>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-sm text-gray-900">{user?.email || 'Not available'}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Account Type</label>
            <p className="text-sm text-gray-900">Professional</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Member Since</label>
            <p className="text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        
        <div className="space-y-3">
          <button className="w-full px-4 py-2 text-left bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            Export conversation history
          </button>
          
          <button className="w-full px-4 py-2 text-left bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors">
            Clear conversation cache
          </button>
          
          <button className="w-full px-4 py-2 text-left bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
            Delete account and all data
          </button>
        </div>
      </div>
    </div>
  );

  const renderSubscriptionSettings = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Subscription Management</h3>
          <ContextHelp 
            helpKey="subscription" 
            position="right"
            iconSize={16}
          />
        </div>
        
        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-6">
          <span className="text-sm font-medium">Billing Cycle</span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm ${settings.billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <button
              onClick={() => updateSetting('billingCycle', settings.billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm ${settings.billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
              <span className="ml-1 text-green-600 font-medium">(Save 20%)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {subscriptionPlans.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 p-6 ${
              plan.popular 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
              
              <div className="mt-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${settings.billingCycle === 'monthly' ? plan.price.monthly : Math.floor(plan.price.yearly / 12)}
                </span>
                <span className="text-gray-600 ml-1">/month</span>
                {settings.billingCycle === 'yearly' && (
                  <div className="text-sm text-green-600 font-medium">
                    Billed annually (${plan.price.yearly})
                  </div>
                )}
              </div>
            </div>
            
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                plan.popular
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {plan.name === 'Professional' ? 'Current Plan' : 'Upgrade'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Privacy & Legal</h3>
          <ContextHelp 
            helpKey="privacy-settings" 
            position="right"
            iconSize={16}
          />
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Your Data is Safe</h4>
              <p className="text-green-700 text-sm">
                We don't store, access, or peek at your documents, ideas, or conversations. 
                Your intellectual property stays yours. Period. 🛡️
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Legal Documents</h4>
            <LegalFooter className="justify-start" />
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">Data Processing</h4>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Local document processing</span>
                <span className="text-sm text-green-600 font-medium">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Conversation encryption</span>
                <span className="text-sm text-green-600 font-medium">✓ Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Data retention</span>
                <span className="text-sm text-gray-600">Local only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvisoryBoardSettings = () => (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advisory Board Overview</h3>
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
      </div>

      {/* General Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advisory Board Preferences</h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
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

      {/* Quick Selection Actions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Selection Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
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

      {/* AI Service Configuration */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Brain className="w-5 h-5 mr-2 text-blue-600" />
          AI Service Configuration
        </h3>
        
        <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
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
      </div>

      {/* Voice Control Settings */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Volume2 className="w-5 h-5 mr-2 text-purple-600" />
          Voice Control Settings
        </h3>
        
        <div className="bg-purple-50 p-4 rounded-lg space-y-4">
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      {/* Data Management */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="w-5 h-5 mr-2 text-green-600" />
          Data Management
        </h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Backup & Restore</h4>
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

          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">Reset Options</h4>
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
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account, preferences, and subscription</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'ai-services' && renderAiServicesSettings()}
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'advisors' && renderAdvisoryBoardSettings()}
          {activeTab === 'subscription' && renderSubscriptionSettings()}
          {activeTab === 'privacy' && renderPrivacySettings()}
        </div>
      </div>
    </div>
  );
}