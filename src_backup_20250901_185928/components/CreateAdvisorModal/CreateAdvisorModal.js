// src/components/CreateAdvisorModal/CreateAdvisorModal.js
import React, { useState } from 'react';
import { X, User, Briefcase, Brain, Settings } from 'lucide-react';
import { AI_SERVICES } from '../../config/aiServices';

export default function CreateAdvisorModal({ isOpen, onClose, onCreateAdvisor }) {
  const [advisorData, setAdvisorData] = useState({
    name: '',
    role: '',
    avatar_emoji: '👤',
    expertise: [],
    personality: {
      traits: [],
      communication_style: 'professional'
    },
    ai_service: {
      service_id: 'anthropic',
      model: 'claude-3-5-sonnet-20241022'
    },
    is_custom: true
  });

  const [currentExpertise, setCurrentExpertise] = useState('');
  const [currentTrait, setCurrentTrait] = useState('');

  const communicationStyles = [
    'professional',
    'friendly',
    'direct',
    'analytical',
    'creative',
    'diplomatic'
  ];

  const commonEmojis = [
    '👤', '👩‍💼', '👨‍💼', '🧑‍💼', '👩‍🔬', '👨‍🔬', '👩‍💻', '👨‍💻',
    '👩‍🎓', '👨‍🎓', '🧠', '💡', '🎯', '📊', '💼', '🚀'
  ];

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!advisorData.name.trim() || !advisorData.role.trim()) {
      alert('Please fill in name and role fields');
      return;
    }

    // Generate unique ID
    const newAdvisor = {
      ...advisorData,
      id: `custom-${Date.now()}`,
      expertise: advisorData.expertise.filter(e => e.trim()),
      personality: {
        ...advisorData.personality,
        traits: advisorData.personality.traits.filter(t => t.trim())
      }
    };

    onCreateAdvisor(newAdvisor);
    onClose();
    
    // Reset form
    setAdvisorData({
      name: '',
      role: '',
      avatar_emoji: '👤',
      expertise: [],
      personality: {
        traits: [],
        communication_style: 'professional'
      },
      ai_service: {
        service_id: 'anthropic',
        model: 'claude-3-5-sonnet-20241022'
      },
      is_custom: true
    });
  };

  const addExpertise = () => {
    if (currentExpertise.trim() && !advisorData.expertise.includes(currentExpertise.trim())) {
      setAdvisorData(prev => ({
        ...prev,
        expertise: [...prev.expertise, currentExpertise.trim()]
      }));
      setCurrentExpertise('');
    }
  };

  const removeExpertise = (index) => {
    setAdvisorData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }));
  };

  const addTrait = () => {
    if (currentTrait.trim() && !advisorData.personality.traits.includes(currentTrait.trim())) {
      setAdvisorData(prev => ({
        ...prev,
        personality: {
          ...prev.personality,
          traits: [...prev.personality.traits, currentTrait.trim()]
        }
      }));
      setCurrentTrait('');
    }
  };

  const removeTrait = (index) => {
    setAdvisorData(prev => ({
      ...prev,
      personality: {
        ...prev.personality,
        traits: prev.personality.traits.filter((_, i) => i !== index)
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <User className="w-6 h-6 mr-2 text-blue-600" />
            Create New Advisor
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={advisorData.name}
                onChange={(e) => setAdvisorData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Dr. Sarah Wilson"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role/Title *
              </label>
              <input
                type="text"
                value={advisorData.role}
                onChange={(e) => setAdvisorData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Chief Technology Officer"
                required
              />
            </div>
          </div>

          {/* Avatar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Avatar Emoji
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {commonEmojis.map(emoji => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAdvisorData(prev => ({ ...prev, avatar_emoji: emoji }))}
                  className={`p-2 text-xl rounded-lg border transition-colors ${
                    advisorData.avatar_emoji === emoji 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={advisorData.avatar_emoji}
              onChange={(e) => setAdvisorData(prev => ({ ...prev, avatar_emoji: e.target.value }))}
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="🎯"
            />
          </div>

          {/* Expertise */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Brain className="w-4 h-4 inline mr-1" />
              Areas of Expertise
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentExpertise}
                onChange={(e) => setCurrentExpertise(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Machine Learning, Product Strategy"
              />
              <button
                type="button"
                onClick={addExpertise}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {advisorData.expertise.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeExpertise(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Personality */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Personality & Communication
            </h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Style
              </label>
              <select
                value={advisorData.personality.communication_style}
                onChange={(e) => setAdvisorData(prev => ({
                  ...prev,
                  personality: { ...prev.personality, communication_style: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {communicationStyles.map(style => (
                  <option key={style} value={style}>
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personality Traits
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={currentTrait}
                  onChange={(e) => setCurrentTrait(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., analytical, visionary, pragmatic"
                />
                <button
                  type="button"
                  onClick={addTrait}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {advisorData.personality.traits.map((trait, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {trait}
                    <button
                      type="button"
                      onClick={() => removeTrait(index)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Service Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              AI Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Service
                </label>
                <select
                  value={advisorData.ai_service.service_id}
                  onChange={(e) => {
                    const serviceId = e.target.value;
                    const defaultModel = AI_SERVICES[serviceId]?.models?.[0]?.id || '';
                    setAdvisorData(prev => ({
                      ...prev,
                      ai_service: {
                        service_id: serviceId,
                        model: defaultModel
                      }
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.values(AI_SERVICES).map(service => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model
                </label>
                <select
                  value={advisorData.ai_service.model}
                  onChange={(e) => setAdvisorData(prev => ({
                    ...prev,
                    ai_service: { ...prev.ai_service, model: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {AI_SERVICES[advisorData.ai_service.service_id]?.models?.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} {model.recommended ? '(Recommended)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Advisor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}