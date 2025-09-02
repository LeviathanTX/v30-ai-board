import React, { useState, useRef } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Save, X,
  Star, Shield, Briefcase, Brain, MessageSquare,
  Upload, Image as ImageIcon, Mic, FileText
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';

export default function AdvisoryHub() {
  const { state, dispatch, actions } = useAppState();
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    expertise: '',
    avatar_emoji: '👤',
    avatar_url: '',
    personality_traits: '',
    communication_style: 'balanced',
    knowledge_base: '',
    voice_settings: {
      pitch: 'medium',
      speed: 'normal',
      accent: 'neutral'
    }
  });
  const fileInputRef = useRef(null);

  const defaultAdvisors = state.advisors || [];
  const customAdvisors = state.customAdvisors || [];
  const allAdvisors = [...defaultAdvisors, ...customAdvisors];

  const handleEdit = (advisor) => {
    if (!advisor.is_custom) return; // Can't edit default advisors
    
    setEditingAdvisor(advisor);
    setFormData({
      name: advisor.name,
      role: advisor.role,
      expertise: advisor.expertise?.join(', ') || '',
      avatar_emoji: advisor.avatar_emoji || '👤',
      avatar_url: advisor.avatar_url || '',
      personality_traits: advisor.personality?.traits?.join(', ') || '',
      communication_style: advisor.personality?.communication_style || 'balanced',
      knowledge_base: advisor.knowledge_base || '',
      voice_settings: advisor.voice_settings || {
        pitch: 'medium',
        speed: 'normal',
        accent: 'neutral'
      }
    });
  };

  const handleSave = () => {
    const updatedAdvisor = {
      ...editingAdvisor,
      name: formData.name,
      role: formData.role,
      expertise: formData.expertise.split(',').map(e => e.trim()),
      avatar_emoji: formData.avatar_emoji,
      avatar_url: formData.avatar_url,
      personality: {
        traits: formData.personality_traits.split(',').map(t => t.trim()),
        communication_style: formData.communication_style
      },
      knowledge_base: formData.knowledge_base,
      voice_settings: formData.voice_settings
    };

    dispatch({ 
      type: actions.UPDATE_ADVISOR, 
      payload: updatedAdvisor 
    });

    setEditingAdvisor(null);
    resetForm();
  };

  const handleCreate = () => {
    const newAdvisor = {
      id: `custom_${Date.now()}`,
      name: formData.name,
      role: formData.role,
      expertise: formData.expertise.split(',').map(e => e.trim()).filter(e => e),
      avatar_emoji: formData.avatar_emoji,
      avatar_url: formData.avatar_url,
      is_custom: true,
      personality: {
        traits: formData.personality_traits.split(',').map(t => t.trim()).filter(t => t),
        communication_style: formData.communication_style
      },
      knowledge_base: formData.knowledge_base,
      voice_settings: formData.voice_settings
    };

    dispatch({ 
      type: actions.ADD_ADVISOR, 
      payload: newAdvisor 
    });

    setShowCreateForm(false);
    resetForm();
  };

  const handleDelete = (advisorId) => {
    if (window.confirm('Are you sure you want to delete this advisor?')) {
      dispatch({ 
        type: actions.DELETE_ADVISOR, 
        payload: advisorId 
      });
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, this would upload to storage
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, avatar_url: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      expertise: '',
      avatar_emoji: '👤',
      avatar_url: '',
      personality_traits: '',
      communication_style: 'balanced',
      knowledge_base: '',
      voice_settings: {
        pitch: 'medium',
        speed: 'normal',
        accent: 'neutral'
      }
    });
  };

  const availableEmojis = ['👤', '👨‍💼', '👩‍💼', '👨‍🎓', '👩‍🎓', '👨‍💻', '👩‍💻', '👨‍⚖️', '👩‍⚖️', '🧑‍💼', '👨‍🔬', '👩‍🔬'];

  const AdvisorForm = ({ advisor = null }) => (
    <div className="space-y-6">
      {/* Avatar Section */}
      <div className="flex items-start space-x-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
          <div className="flex items-center space-x-4">
            {formData.avatar_url ? (
              <img 
                src={formData.avatar_url} 
                alt="Avatar" 
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">{formData.avatar_emoji}</span>
              </div>
            )}
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg mb-2 flex items-center space-x-2"
              >
                <Upload size={14} />
                <span>Upload Image</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <div className="flex items-center space-x-1">
                {availableEmojis.slice(0, 6).map(emoji => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar_emoji: emoji })}
                    className={`p-1 rounded ${
                      formData.avatar_emoji === emoji ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Dr. Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Chief Innovation Officer"
          />
        </div>
      </div>

      {/* Expertise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Expertise (comma separated)
        </label>
        <input
          type="text"
          value={formData.expertise}
          onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Innovation Strategy, R&D Management, Technology Trends"
        />
      </div>

      {/* Personality */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Personality Traits (comma separated)
        </label>
        <input
          type="text"
          value={formData.personality_traits}
          onChange={(e) => setFormData({ ...formData, personality_traits: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="analytical, innovative, collaborative, direct"
        />
      </div>

      {/* Communication Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Communication Style</label>
        <select
          value={formData.communication_style}
          onChange={(e) => setFormData({ ...formData, communication_style: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="formal">Formal</option>
          <option value="professional">Professional</option>
          <option value="balanced">Balanced</option>
          <option value="friendly">Friendly</option>
          <option value="casual">Casual</option>
        </select>
      </div>

      {/* Knowledge Base */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Knowledge Base / Training Data
        </label>
        <textarea
          value={formData.knowledge_base}
          onChange={(e) => setFormData({ ...formData, knowledge_base: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder="Enter specific knowledge, experiences, or context this advisor should have..."
        />
      </div>

      {/* Voice Settings */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Voice Settings</label>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Pitch</label>
            <select
              value={formData.voice_settings.pitch}
              onChange={(e) => setFormData({ 
                ...formData, 
                voice_settings: { ...formData.voice_settings, pitch: e.target.value }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Speed</label>
            <select
              value={formData.voice_settings.speed}
              onChange={(e) => setFormData({ 
                ...formData, 
                voice_settings: { ...formData.voice_settings, speed: e.target.value }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Accent</label>
            <select
              value={formData.voice_settings.accent}
              onChange={(e) => setFormData({ 
                ...formData, 
                voice_settings: { ...formData.voice_settings, accent: e.target.value }
              })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            >
              <option value="neutral">Neutral</option>
              <option value="british">British</option>
              <option value="american">American</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Advisory Hub</h1>
            <p className="text-sm text-gray-600 mt-1">Manage your AI board members and their expertise</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus size={16} />
            <span>Create Advisor</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Create/Edit Form */}
        {(showCreateForm || editingAdvisor) && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAdvisor ? 'Edit Advisor' : 'Create Custom Advisor'}
            </h2>
            <AdvisorForm advisor={editingAdvisor} />
            <div className="flex items-center justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingAdvisor(null);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={editingAdvisor ? handleSave : handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingAdvisor ? 'Save Changes' : 'Create Advisor'}
              </button>
            </div>
          </div>
        )}

        {/* Advisors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allAdvisors.map((advisor) => (
            <div key={advisor.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl">{advisor.avatar_emoji}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{advisor.name}</h3>
                    <p className="text-sm text-gray-600">{advisor.role}</p>
                  </div>
                </div>
                {advisor.is_custom && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    Custom
                  </span>
                )}
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Expertise:</p>
                <div className="flex flex-wrap gap-1">
                  {advisor.expertise?.map((skill, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MessageSquare size={16} />
                  <span>Active in meetings</span>
                </div>
                <div className="flex items-center space-x-1">
                  {advisor.is_custom && (
                    <>
                      <button
                        onClick={() => handleEdit(advisor)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(advisor.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}