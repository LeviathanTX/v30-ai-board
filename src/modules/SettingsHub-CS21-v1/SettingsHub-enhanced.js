// Enhanced AI Services Settings with status indicators and test buttons
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
import logger from '../../utils/logger';
import { advisorService } from '../../services/supabase';
import { openaiRealtimeService } from '../../services/openaiRealtime';

// Enhanced AI Services testing functions
const testAIConnection = async (service, apiKey) => {
  const testEndpoints = {
    openai: {
      url: 'https://api.openai.com/v1/models',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    anthropic: {
      url: 'https://api.anthropic.com/v1/messages',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }]
      })
    },
    deepseek: {
      url: 'https://api.deepseek.com/v1/models',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    },
    google: {
      url: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  };

  const config = testEndpoints[service];
  if (!config) throw new Error('Unknown service');

  const response = await fetch(config.url, {
    method: config.method || 'GET',
    headers: config.headers,
    ...(config.body && { body: config.body })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
};

const renderEnhancedAiServicesSettings = (
  aiServices, 
  setAiServices, 
  voiceServices, 
  setVoiceServices, 
  dispatch, 
  actions
) => {
  const aiServiceConfigs = {
    openai: { name: 'OpenAI', color: 'green', icon: Zap, description: 'GPT-4o, GPT-4o-mini models with advanced capabilities' },
    anthropic: { name: 'Claude (Anthropic)', color: 'orange', icon: Brain, description: 'Claude-3.5 Sonnet with superior reasoning abilities' },
    deepseek: { name: 'DeepSeek', color: 'blue', icon: Cpu, description: 'Cost-effective AI models with strong performance' },
    google: { name: 'Google Gemini', color: 'purple', icon: Sparkles, description: 'Gemini-1.5 Pro with multimodal capabilities' }
  };

  const getStatusIndicator = (serviceState) => {
    if (serviceState.testing) {
      return (
        <div className="flex items-center space-x-2 text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm font-semibold">Testing...</span>
        </div>
      );
    }
    
    if (serviceState.connected) {
      return (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Connected & Active</span>
        </div>
      );
    }
    
    if (serviceState.apiKey && serviceState.apiKey.length > 0) {
      return (
        <div className="flex items-center space-x-2 text-yellow-600">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm font-semibold">Key Entered - Not Tested</span>
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2 text-gray-400">
        <X className="w-5 h-5" />
        <span className="text-sm font-medium">Not Configured</span>
      </div>
    );
  };

  const handleAiServiceKeyChange = (service, value) => {
    setAiServices(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        apiKey: value,
        connected: false,
        error: null
      }
    }));
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
      await testAIConnection(service, serviceConfig.apiKey);
      
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
          error: error.message || 'Connection failed. Please check your API key.' 
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

  const renderVoiceServices = () => {
    const voiceServiceConfigs = {
      openai_realtime: { 
        name: 'OpenAI Realtime Voice', 
        color: 'emerald', 
        icon: Volume2, 
        description: 'Real-time voice conversations with GPT-4o for natural advisor interactions',
        models: ['gpt-4o-realtime-preview', 'gpt-4o-realtime-preview-2024-10-01'],
        features: ['Real-time conversation', 'Voice synthesis', 'Interrupt handling', 'Multiple voice types']
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
        // Test OpenAI Realtime API connection
        await testAIConnection('openai', serviceConfig.apiKey);
        
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
            error: error.message || 'Voice connection failed. Please check your OpenAI API key.' 
          }
        }));
      }
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

    const handleVoiceServiceKeyChange = (service, value) => {
      setVoiceServices(prev => ({
        ...prev,
        [service]: {
          ...prev[service],
          apiKey: value,
          connected: false,
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

    return (
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-green-600 rounded-lg flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Voice Services</h3>
            <p className="text-sm text-gray-600">
              Configure voice API for real-time conversations with your AI advisors.
            </p>
          </div>
        </div>
        
        <div className="grid gap-6">
          {Object.entries(voiceServiceConfigs).map(([service, config]) => {
            const serviceState = voiceServices[service];
            const Icon = config.icon;
            
            return (
              <div key={service} className={`border-2 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md ${
                serviceState.connected 
                  ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-100' 
                  : serviceState.apiKey && serviceState.apiKey.length > 0
                  ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
                      serviceState.connected 
                        ? `bg-emerald-200` 
                        : `bg-${config.color}-200`
                    }`}>
                      <Icon className={`w-7 h-7 transition-colors duration-300 ${
                        serviceState.connected 
                          ? 'text-emerald-700' 
                          : `text-${config.color}-700`
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{config.name}</h4>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          serviceState.connected 
                            ? 'bg-emerald-200 text-emerald-800' 
                            : serviceState.apiKey && serviceState.apiKey.length > 0
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {serviceState.connected ? '🎤 VOICE ACTIVE' : serviceState.apiKey ? '⚠ READY' : '🔇 INACTIVE'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 max-w-md mb-3">{config.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {config.features.map((feature, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {serviceState.testing ? (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <span className="text-sm font-semibold">Testing Voice...</span>
                      </div>
                    ) : serviceState.connected ? (
                      <div className="flex items-center space-x-2 text-emerald-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Voice Ready</span>
                      </div>
                    ) : serviceState.apiKey && serviceState.apiKey.length > 0 ? (
                      <div className="flex items-center space-x-2 text-yellow-600">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Needs Testing</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-gray-400">
                        <X className="w-5 h-5" />
                        <span className="text-sm font-medium">No Voice</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      OpenAI API Key (Same as Chat Services)
                    </label>
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type={serviceState.showKey ? 'text' : 'password'}
                          value={serviceState.apiKey}
                          onChange={(e) => handleVoiceServiceKeyChange(service, e.target.value)}
                          placeholder="Enter your OpenAI API key for voice features"
                          className={`w-full px-4 py-3 pr-12 rounded-xl border-2 focus:outline-none transition-all duration-300 font-mono text-sm ${
                            serviceState.connected 
                              ? 'border-emerald-300 bg-emerald-50 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-400' 
                              : serviceState.apiKey && serviceState.apiKey.length > 0
                              ? 'border-yellow-300 bg-yellow-50 focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400'
                              : 'border-gray-300 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400'
                          }`}
                        />
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                          {serviceState.apiKey && serviceState.apiKey.length > 0 ? (
                            <div className={`w-3 h-3 rounded-full shadow-sm ${
                              serviceState.connected ? 'bg-emerald-500' : 'bg-yellow-500'
                            }`} />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(service, true)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {serviceState.showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        {serviceState.connected ? (
                          <>
                            <button
                              onClick={() => testVoiceService(service)}
                              disabled={serviceState.testing}
                              className="px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <Volume2 className="w-5 h-5" />
                              <span>Test Voice</span>
                            </button>
                            <button
                              onClick={() => disconnectVoiceService(service)}
                              className="px-4 py-3 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 hover:border-red-400 font-semibold transition-all duration-200"
                            >
                              Disconnect
                            </button>
                          </>
                        ) : serviceState.apiKey && serviceState.apiKey.length > 0 ? (
                          <button
                            onClick={() => testVoiceService(service)}
                            disabled={serviceState.testing}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            {serviceState.testing ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Testing Voice...</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-5 h-5" />
                                <span>Test Voice Connection</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed font-semibold">
                            Enter API Key
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {serviceState.error && (
                      <div className="mt-4 p-4 bg-red-100 border-2 border-red-200 rounded-xl">
                        <div className="flex items-center space-x-3 text-red-800">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm font-semibold">{serviceState.error}</span>
                        </div>
                      </div>
                    )}
                    
                    {serviceState.connected && !serviceState.error && (
                      <div className="mt-4 p-4 bg-emerald-100 border-2 border-emerald-200 rounded-xl">
                        <div className="flex items-center space-x-3 text-emerald-800">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-semibold">Voice connection verified successfully!</span>
                        </div>
                        <div className="mt-2 text-xs text-emerald-600">
                          Last tested: {new Date().toLocaleTimeString()} • Ready for voice conversations
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Voice Configuration Options */}
                  {serviceState.connected && (
                    <div className="mt-6 pt-6 border-t border-emerald-200">
                      <h5 className="font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-emerald-600" />
                        <span>Voice Configuration</span>
                      </h5>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Voice Model</label>
                          <select className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-emerald-50">
                            {config.models.map(model => (
                              <option key={model} value={model}>{model}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Voice Type</label>
                          <select className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-emerald-50">
                            <option value="alloy">Alloy (Balanced)</option>
                            <option value="echo">Echo (Male)</option>
                            <option value="fable">Fable (British)</option>
                            <option value="onyx">Onyx (Deep)</option>
                            <option value="nova">Nova (Female)</option>
                            <option value="shimmer">Shimmer (Soft)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* AI Chat Services Section */}
      <div>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">AI Chat Services</h3>
            <p className="text-sm text-gray-600">
              Configure API keys for AI services. Each advisor can use a different AI service for diverse perspectives.
            </p>
          </div>
        </div>
        
        <div className="grid gap-6">
          {Object.entries(aiServiceConfigs).map(([service, config]) => {
            const serviceState = aiServices[service];
            const Icon = config.icon;
            
            return (
              <div key={service} className={`border-2 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md ${
                serviceState.connected 
                  ? 'border-green-300 bg-gradient-to-br from-green-50 to-green-100' 
                  : serviceState.apiKey && serviceState.apiKey.length > 0
                  ? 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}>
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-md transition-all duration-300 ${
                      serviceState.connected 
                        ? `bg-green-200` 
                        : `bg-${config.color}-200`
                    }`}>
                      <Icon className={`w-7 h-7 transition-colors duration-300 ${
                        serviceState.connected 
                          ? 'text-green-700' 
                          : `text-${config.color}-700`
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{config.name}</h4>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                          serviceState.connected 
                            ? 'bg-green-200 text-green-800' 
                            : serviceState.apiKey && serviceState.apiKey.length > 0
                            ? 'bg-yellow-200 text-yellow-800'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                          {serviceState.connected ? '✓ ACTIVE' : serviceState.apiKey ? '⚠ READY' : '✗ INACTIVE'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 max-w-md">{config.description}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    {getStatusIndicator(serviceState)}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      API Key
                    </label>
                    <div className="flex space-x-3">
                      <div className="flex-1 relative">
                        <input
                          type={serviceState.showKey ? 'text' : 'password'}
                          value={serviceState.apiKey}
                          onChange={(e) => handleAiServiceKeyChange(service, e.target.value)}
                          placeholder={`Enter your ${config.name} API key`}
                          className={`w-full px-4 py-3 pr-12 rounded-xl border-2 focus:outline-none transition-all duration-300 font-mono text-sm ${
                            serviceState.connected 
                              ? 'border-green-300 bg-green-50 focus:ring-4 focus:ring-green-100 focus:border-green-400' 
                              : serviceState.apiKey && serviceState.apiKey.length > 0
                              ? 'border-yellow-300 bg-yellow-50 focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400'
                              : 'border-gray-300 bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-400'
                          }`}
                        />
                        {/* Key Status Indicator Dot */}
                        <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                          {serviceState.apiKey && serviceState.apiKey.length > 0 ? (
                            <div className={`w-3 h-3 rounded-full shadow-sm ${
                              serviceState.connected ? 'bg-green-500' : 'bg-yellow-500'
                            }`} />
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-gray-300" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility(service)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {serviceState.showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      
                      <div className="flex space-x-2">
                        {serviceState.connected ? (
                          <>
                            <button
                              onClick={() => testAiService(service)}
                              disabled={serviceState.testing}
                              className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                            >
                              <Wifi className="w-5 h-5" />
                              <span>Test</span>
                            </button>
                            <button
                              onClick={() => disconnectAiService(service)}
                              className="px-4 py-3 border-2 border-red-300 text-red-700 rounded-xl hover:bg-red-50 hover:border-red-400 font-semibold transition-all duration-200"
                            >
                              Disconnect
                            </button>
                          </>
                        ) : serviceState.apiKey && serviceState.apiKey.length > 0 ? (
                          <button
                            onClick={() => testAiService(service)}
                            disabled={serviceState.testing}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2 font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            {serviceState.testing ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span>Testing...</span>
                              </>
                            ) : (
                              <>
                                <Wifi className="w-5 h-5" />
                                <span>Test & Connect</span>
                              </>
                            )}
                          </button>
                        ) : (
                          <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed font-semibold">
                            Enter API Key
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {serviceState.error && (
                      <div className="mt-4 p-4 bg-red-100 border-2 border-red-200 rounded-xl">
                        <div className="flex items-center space-x-3 text-red-800">
                          <AlertCircle className="w-5 h-5" />
                          <span className="text-sm font-semibold">{serviceState.error}</span>
                        </div>
                      </div>
                    )}
                    
                    {serviceState.connected && !serviceState.error && (
                      <div className="mt-4 p-4 bg-green-100 border-2 border-green-200 rounded-xl">
                        <div className="flex items-center space-x-3 text-green-800">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-semibold">Connection verified successfully!</span>
                        </div>
                        <div className="mt-2 text-xs text-green-600">
                          Last tested: {new Date().toLocaleTimeString()}
                        </div>
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
      {renderVoiceServices()}
      
      {/* Usage Guidelines */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-6">
        <h4 className="font-bold text-blue-900 mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5" />
          <span>💡 Usage Guidelines</span>
        </h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <span><strong>Multiple Services:</strong> Connect multiple AI services for diverse advisor perspectives</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <span><strong>Voice Features:</strong> OpenAI Realtime API enables natural voice conversations with advisors</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <span><strong>Fallback:</strong> If a preferred service is unavailable, the system will use the default service</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <span><strong>Security:</strong> API keys are stored locally in your browser and never sent to our servers</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <span><strong>Cost:</strong> You'll be charged directly by each AI service provider based on usage</span>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <span><strong>Voice Quality:</strong> Choose different voice types and models for personalized advisor interactions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { renderEnhancedAiServicesSettings, testAIConnection };