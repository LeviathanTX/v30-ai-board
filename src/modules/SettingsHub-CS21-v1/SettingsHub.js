// src/modules/SettingsHub-CS21-v1/SettingsHub.js
import React, { useState, useEffect } from 'react';
import { 
  Settings, User, CreditCard, Palette, Volume2, VolumeX, 
  Globe, Shield, FileText, Home, MessageSquare, Users, 
  Video, Bell, Moon, Sun, Monitor, Save, Check, X,
  ArrowRight, TrendingUp, Sparkles, Building, Clock, BarChart
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';
import { useVoice } from '../../contexts/VoiceContext';
import LegalFooter from '../../components/Legal/LegalFooter';
import ContextHelp from '../../components/Help/ContextHelp';

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

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }
  }, []);

  // Save settings to localStorage
  const handleSaveSettings = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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
    { id: 'account', name: 'Account', icon: User },
    { id: 'subscription', name: 'Subscription', icon: CreditCard },
    { id: 'privacy', name: 'Privacy & Legal', icon: Shield }
  ];

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
          {activeTab === 'account' && renderAccountSettings()}
          {activeTab === 'subscription' && renderSubscriptionSettings()}
          {activeTab === 'privacy' && renderPrivacySettings()}
        </div>
      </div>
    </div>
  );
}