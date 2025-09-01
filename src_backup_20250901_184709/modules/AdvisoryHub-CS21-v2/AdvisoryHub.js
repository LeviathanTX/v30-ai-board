// src/modules/AdvisoryHub-CS21-v2/AdvisoryHub.js - Enhanced with Create/Edit functionality
import React, { useState } from 'react';
import { 
  Users, UserPlus, Brain, Edit2, Trash2, Save, X, 
  Briefcase, Target, MessageSquare, Star, Plus
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';

export default function AdvisoryHub() {
  const { state, dispatch, actions } = useAppState();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    avatar_emoji: '👤',
    expertise: [],
    personality: { traits: [] },
    background: '',
    is_custom: true
  });
  const [newExpertise, setNewExpertise] = useState('');
  const [newTrait, setNewTrait] = useState('');

  // Combine default and custom advisors
  const allAdvisors = [...(state.advisors || []), ...(state.customAdvisors || [])];

  const categories = [
    { id: 'all', name: 'All Advisors', count: allAdvisors.length },
    { id: 'executive', name: 'Executive', count: allAdvisors.filter(a => a.role?.toLowerCase().includes('executive') || a.role?.toLowerCase().includes('ceo') || a.role?.toLowerCase().includes('coo')).length },
    { id: 'financial', name: 'Financial', count: allAdvisors.filter(a => a.role?.toLowerCase().includes('financial') || a.role?.toLowerCase().includes('cfo')).length },
    { id: 'technical', name: 'Technical', count: allAdvisors.filter(a => a.role?.toLowerCase().includes('technical') || a.role?.toLowerCase().includes('cto')).length },
    { id: 'marketing', name: 'Marketing', count: allAdvisors.filter(a => a.role?.toLowerCase().includes('marketing') || a.role?.toLowerCase().includes('cmo')).length },
    { id: 'custom', name: 'Custom', count: state.customAdvisors?.length || 0 }
  ];

  const emojiOptions = ['👤', '👨‍💼', '👩‍💼', '🧑‍💼', '👨‍🏫', '👩‍🏫', '👨‍⚖️', '👩‍⚖️', '👨‍🔬', '👩‍🔬', '👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '🦸‍♂️', '🦸‍♀️', '🧙‍♂️', '🧙‍♀️', '💡', '🎯', '📊', '💰', '🚀', '🌟'];

  const handleSelectAdvisor = (advisor) => {
    const isSelected = state.selectedAdvisors?.some(a => a.id === advisor.id);
    
    if (isSelected) {
      dispatch({
        type: actions.REMOVE_SELECTED_ADVISOR,
        payload: advisor.id
      });
    } else {
      dispatch({
        type: actions.ADD_SELECTED_ADVISOR,
        payload: advisor
      });
    }
  };

  const handleCreateAdvisor = () => {
    setFormData({
      name: '',
      role: '',
      avatar_emoji: '👤',
      expertise: [],
      personality: { traits: [] },
      background: '',
      is_custom: true
    });
    setEditingAdvisor(null);
    setShowCreateModal(true);
  };

  const handleEditAdvisor = (advisor) => {
    setFormData({
      ...advisor,
      expertise: advisor.expertise || [],
      personality: advisor.personality || { traits: [] }
    });
    setEditingAdvisor(advisor);
    setShowCreateModal(true);
  };

  const handleDeleteAdvisor = (advisor) => {
    if (window.confirm(`Are you sure you want to delete ${advisor.name}?`)) {
      dispatch({
        type: actions.DELETE_ADVISOR,
        payload: advisor.id
      });
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `${advisor.name} deleted successfully`,
          type: 'success'
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role) {
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: 'Please fill in all required fields',
          type: 'error'
        }
      });
      return;
    }

    if (editingAdvisor) {
      dispatch({
        type: actions.UPDATE_ADVISOR,
        payload: {
          ...formData,
          id: editingAdvisor.id
        }
      });
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `${formData.name} updated successfully`,
          type: 'success'
        }
      });
    } else {
      dispatch({
        type: actions.ADD_ADVISOR,
        payload: {
          ...formData,
          id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
      });
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `${formData.name} created successfully`,
          type: 'success'
        }
      });
    }

    setShowCreateModal(false);
  };

  const addExpertise = () => {
    if (newExpertise.trim()) {
      setFormData({
        ...formData,
        expertise: [...formData.expertise, newExpertise.trim()]
      });
      setNewExpertise('');
    }
  };

  const removeExpertise = (index) => {
    setFormData({
      ...formData,
      expertise: formData.expertise.filter((_, i) => i !== index)
    });
  };

  const addTrait = () => {
    if (newTrait.trim()) {
      setFormData({
        ...formData,
        personality: {
          ...formData.personality,
          traits: [...(formData.personality?.traits || []), newTrait.trim()]
        }
      });
      setNewTrait('');
    }
  };

  const removeTrait = (index) => {
    setFormData({
      ...formData,
      personality: {
        ...formData.personality,
        traits: formData.personality.traits.filter((_, i) => i !== index)
      }
    });
  };

  const filteredAdvisors = selectedCategory === 'all' 
    ? allAdvisors 
    : allAdvisors.filter(advisor => {
        if (selectedCategory === 'custom') return advisor.is_custom;
        // Filter by role category
        const role = advisor.role?.toLowerCase() || '';
        switch (selectedCategory) {
          case 'executive':
            return role.includes('executive') || role.includes('ceo') || role.includes('coo') || role.includes('strategy');
          case 'financial':
            return role.includes('financial') || role.includes('cfo') || role.includes('finance');
          case 'technical':
            return role.includes('technical') || role.includes('cto') || role.includes('technology');
          case 'marketing':
            return role.includes('marketing') || role.includes('cmo') || role.includes('brand');
          default:
            return false;
        }
      });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advisory Hub</h1>
            <p className="text-sm text-gray-600 mt-1">
              Select and manage your AI advisors
            </p>
          </div>
          
          <button 
            onClick={handleCreateAdvisor}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <UserPlus size={20} />
            <span>Create Custom Advisor</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-4 mt-4 overflow-x-auto">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category.name} ({category.count})
            </button>
          ))}
        </div>
      </div>

      {/* Advisors Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdvisors.map(advisor => {
            const isSelected = state.selectedAdvisors?.some(a => a.id === advisor.id);
            
            return (
              <div
                key={advisor.id}
                className={`bg-white rounded-lg border-2 p-6 transition-all relative group ${
                  isSelected
                    ? 'border-blue-500 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Edit/Delete buttons for custom advisors */}
                {advisor.is_custom && (
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditAdvisor(advisor);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit2 size={16} className="text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAdvisor(advisor);
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                      title="Delete"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                )}

                <div 
                  onClick={() => handleSelectAdvisor(advisor)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-4xl">{advisor.avatar_emoji || advisor.avatar}</span>
                    {isSelected && (
                      <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                        Selected
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-1">{advisor.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{advisor.role}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Brain size={16} />
                      <span className="truncate">{advisor.personality?.traits?.join(', ') || 'Strategic thinker'}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(advisor.expertise || []).slice(0, 3).map((skill, index) => (
                        <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          {skill}
                        </span>
                      ))}
                      {(advisor.expertise || []).length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded">
                          +{advisor.expertise.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredAdvisors.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No advisors found</p>
            <p className="text-sm text-gray-400">
              Try selecting a different category or create a custom advisor
            </p>
          </div>
        )}
      </div>

      {/* Selected Advisors Bar */}
      {state.selectedAdvisors?.length > 0 && (
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {state.selectedAdvisors.length} advisor{state.selectedAdvisors.length > 1 ? 's' : ''} selected
              </span>
              <div className="flex -space-x-2">
                {state.selectedAdvisors.slice(0, 5).map(advisor => (
                  <div
                    key={advisor.id}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-lg border-2 border-white"
                    title={advisor.name}
                  >
                    {advisor.avatar_emoji || advisor.avatar}
                  </div>
                ))}
                {state.selectedAdvisors.length > 5 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium border-2 border-white">
                    +{state.selectedAdvisors.length - 5}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Advisor Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">
                  {editingAdvisor ? 'Edit Advisor' : 'Create Custom Advisor'}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Avatar
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {emojiOptions.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, avatar_emoji: emoji })}
                        className={`text-2xl p-2 rounded-lg border-2 hover:border-gray-300 ${
                          formData.avatar_emoji === emoji
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Alex Thompson"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role/Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Chief Innovation Officer"
                    required
                  />
                </div>

                {/* Background */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background & Experience
                  </label>
                  <textarea
                    value={formData.background}
                    onChange={(e) => setFormData({ ...formData, background: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the advisor's background, experience, and approach..."
                  />
                </div>

                {/* Expertise */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Areas of Expertise
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newExpertise}
                      onChange={(e) => setNewExpertise(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add expertise area..."
                    />
                    <button
                      type="button"
                      onClick={addExpertise}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeExpertise(index)}
                          className="hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Personality Traits */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Personality Traits
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTrait}
                      onChange={(e) => setNewTrait(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add personality trait..."
                    />
                    <button
                      type="button"
                      onClick={addTrait}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(formData.personality?.traits || []).map((trait, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1"
                      >
                        {trait}
                        <button
                          type="button"
                          onClick={() => removeTrait(index)}
                          className="hover:text-purple-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save size={20} />
                  {editingAdvisor ? 'Update Advisor' : 'Create Advisor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}