// src/config/aiServices.js
export const AI_SERVICES = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    provider: 'Anthropic',
    models: [
      { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', recommended: true },
      { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
      { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' }
    ],
    icon: '🤖',
    color: 'bg-orange-100 text-orange-800',
    description: 'Advanced reasoning and analysis',
    features: ['Complex reasoning', 'Code analysis', 'Long context'],
    apiKeyFormat: 'sk-ant-...',
    maxTokens: 4096,
    supportsStreaming: true,
    pricingTier: 'premium'
  },
  openai: {
    id: 'openai',
    name: 'OpenAI GPT',
    provider: 'OpenAI',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', recommended: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
    ],
    icon: '🧠',
    color: 'bg-green-100 text-green-800',
    description: 'Versatile language understanding',
    features: ['Creative writing', 'General knowledge', 'Code generation'],
    apiKeyFormat: 'sk-...',
    maxTokens: 4096,
    supportsStreaming: true,
    pricingTier: 'standard'
  },
  google: {
    id: 'google',
    name: 'Google Gemini',
    provider: 'Google',
    models: [
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', recommended: true },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' },
      { id: 'gemini-pro', name: 'Gemini Pro' }
    ],
    icon: '💎',
    color: 'bg-blue-100 text-blue-800',
    description: 'Multimodal AI with strong reasoning',
    features: ['Multimodal input', 'Large context', 'Fast inference'],
    apiKeyFormat: 'AI...',
    maxTokens: 8192,
    supportsStreaming: true,
    pricingTier: 'standard'
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek Chat', recommended: true },
      { id: 'deepseek-coder', name: 'DeepSeek Coder' }
    ],
    icon: '🌊',
    color: 'bg-purple-100 text-purple-800',
    description: 'Cost-effective AI reasoning',
    features: ['Math reasoning', 'Code generation', 'Cost effective'],
    apiKeyFormat: 'sk-...',
    maxTokens: 4096,
    supportsStreaming: true,
    pricingTier: 'budget'
  }
};

export const DEFAULT_SERVICE = 'anthropic';
export const DEFAULT_MODEL_BY_SERVICE = {
  anthropic: 'claude-3-5-sonnet-20241022',
  openai: 'gpt-4o',
  google: 'gemini-1.5-pro',
  deepseek: 'deepseek-chat'
};

export const AI_SERVICE_ENDPOINTS = {
  anthropic: '/api/claude',
  openai: '/api/openai',
  google: '/api/gemini',
  deepseek: '/api/deepseek'
};

// Validation functions
export const validateApiKey = (serviceId, apiKey) => {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, error: 'API key is required' };
  }

  const service = AI_SERVICES[serviceId];
  if (!service) {
    return { valid: false, error: 'Unknown AI service' };
  }

  // Basic format validation
  const format = service.apiKeyFormat;
  if (format.includes('...')) {
    const prefix = format.split('...')[0];
    if (!apiKey.startsWith(prefix)) {
      return { valid: false, error: `API key should start with "${prefix}"` };
    }
  }

  // Length validation
  if (apiKey.length < 20) {
    return { valid: false, error: 'API key appears too short' };
  }

  return { valid: true };
};

export const getServiceIcon = (serviceId) => {
  return AI_SERVICES[serviceId]?.icon || '🤖';
};

export const getServiceColor = (serviceId) => {
  return AI_SERVICES[serviceId]?.color || 'bg-gray-100 text-gray-800';
};

export const getRecommendedModel = (serviceId) => {
  const service = AI_SERVICES[serviceId];
  if (!service) return null;
  
  const recommendedModel = service.models.find(model => model.recommended);
  return recommendedModel || service.models[0];
};

// Error handling helpers
export const getAIErrorMessage = (error, serviceId) => {
  const service = AI_SERVICES[serviceId];
  const serviceName = service?.name || 'AI Service';
  
  if (error.message?.includes('API key')) {
    return `${serviceName} API key is invalid or missing. Please check your settings.`;
  }
  
  if (error.message?.includes('quota') || error.message?.includes('limit')) {
    return `${serviceName} usage limit reached. Please check your API quota.`;
  }
  
  if (error.message?.includes('401') || error.message?.includes('403')) {
    return `${serviceName} authentication failed. Please verify your API key.`;
  }
  
  if (error.message?.includes('429')) {
    return `${serviceName} rate limit exceeded. Please wait and try again.`;
  }
  
  if (error.message?.includes('500') || error.message?.includes('502')) {
    return `${serviceName} is temporarily unavailable. Please try again later.`;
  }
  
  return `${serviceName} error: ${error.message || 'Unknown error occurred'}`;
};