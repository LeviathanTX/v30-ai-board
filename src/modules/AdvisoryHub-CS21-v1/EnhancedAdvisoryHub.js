import React, { useState } from 'react';
import { 
  Users, Plus, Edit2, Trash2, Save, X, Settings,
  Star, Shield, Briefcase, Brain, MessageSquare, Crown, Mic, Volume2
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { advisorService } from '../../services/supabase';
import CreateAdvisorModal from '../../components/CreateAdvisorModal/EnhancedCreateAdvisorModal';
import EditAdvisorModal from '../../components/EditAdvisorModal/EnhancedEditAdvisorModal';
import AdvisorySettingsModal from '../../components/AdvisorySettingsModal/AdvisorySettingsModal';
import VoiceAdvisorManager from '../../components/VoiceControl/VoiceAdvisorManager';
import logger from '../../utils/logger';

export default function EnhancedAdvisoryHub() {
  const { state, dispatch, actions } = useAppState();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdvisor, setEditingAdvisor] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showVoiceControl, setShowVoiceControl] = useState(false);

  const allAdvisors = state.advisors || [];
  const selectedAdvisors = state.selectedAdvisors || [];

  const handleCreateAdvisor = async (advisorData) => {
    try {
      if (state.user) {
        // Save to database if user is logged in
        const { data, error } = await advisorService.createAdvisor(state.user.id, advisorData);
        if (error) {
          logger.error('Error creating advisor:', error);
          return;
        }
        dispatch({ type: actions.ADD_ADVISOR, payload: data });
      } else {
        // Save to local state if no user
        const newAdvisor = {
          ...advisorData,
          id: `local_${Date.now()}`,
          is_custom: true
        };
        dispatch({ type: actions.ADD_ADVISOR, payload: newAdvisor });
      }
    } catch (error) {
      logger.error('Error creating advisor:', error);
    }
  };

  const handleUpdateAdvisor = async (advisorData) => {
    try {
      if (state.user) {
        // Update in database if user is logged in (all advisors now editable)
        const { error } = await advisorService.updateAdvisor(advisorData.id, advisorData);
        if (error) {
          logger.error('Error updating advisor:', error);
          return;
        }
      }
      
      // Always update local state
      dispatch({ type: actions.UPDATE_ADVISOR, payload: advisorData });
    } catch (error) {
      logger.error('Error updating advisor:', error);
    }
  };

  const handleDeleteAdvisor = async (advisorId) => {
    if (!window.confirm('Are you sure you want to delete this advisor?')) return;
    
    try {
      if (state.user) {
        // Delete from database if user is logged in (all advisors can be deleted)
        const { error } = await advisorService.deleteAdvisor(advisorId);
        if (error) {
          logger.error('Error deleting advisor:', error);
          return;
        }
      }
      
      dispatch({ type: actions.DELETE_ADVISOR, payload: advisorId });
    } catch (error) {
      logger.error('Error deleting advisor:', error);
    }
  };

  const toggleAdvisorSelection = (advisor) => {
    const isSelected = selectedAdvisors.find(a => a.id === advisor.id);
    
    if (isSelected) {
      const newSelection = selectedAdvisors.filter(a => a.id !== advisor.id);
      dispatch({ type: actions.SELECT_ADVISORS, payload: newSelection });
    } else {
      dispatch({ type: actions.SELECT_ADVISORS, payload: [...selectedAdvisors, advisor] });
    }
  };

  const getAdvisorTypeIcon = (advisor) => {
    if (advisor.is_host) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (advisor.is_celebrity) return <Star className="w-4 h-4 text-purple-500" />;
    if (advisor.is_custom) return <Star className="w-4 h-4 text-blue-500" />;
    if (advisor.specialty_focus === 'venture_capital') return <Shield className="w-4 h-4 text-green-500" />;
    return <Briefcase className="w-4 h-4 text-gray-500" />;
  };

  const getAdvisorTypeLabel = (advisor) => {
    if (advisor.is_host) return 'Host';
    if (advisor.is_custom) return 'Custom';
    if (advisor.is_celebrity) return 'Celebrity';
    return 'Core';
  };

  const selectAllAdvisors = () => {
    dispatch({ type: actions.SELECT_ADVISORS, payload: allAdvisors });
  };

  const deselectAllAdvisors = () => {
    dispatch({ type: actions.SELECT_ADVISORS, payload: [] });
  };

  const handleVoiceCommand = (command) => {
    logger.debug('Voice command received in Advisory Hub:', command);
    
    switch (command.action) {
      case 'CREATE_ADVISOR':
        setShowCreateModal(true);
        break;
        
      case 'EDIT_ADVISOR':
      case 'SELECT_ADVISOR':
        if (command.value) {
          const advisor = findAdvisorByName(command.value);
          if (advisor) {
            setEditingAdvisor(advisor);
          }
        }
        break;
        
      case 'DELETE_ADVISOR':
        if (command.value) {
          const advisor = findAdvisorByName(command.value);
          if (advisor) {
            handleDeleteAdvisor(advisor.id);
          }
        }
        break;
        
      default:
        logger.debug('Unhandled voice command in hub:', command);
    }
  };

  const handleAdvisorUpdate = (update) => {
    switch (update.type) {
      case 'CREATE':
        handleCreateAdvisor(update.data);
        break;
      case 'UPDATE':
        handleUpdateAdvisor(update.data);
        break;
      case 'DELETE':
        handleDeleteAdvisor(update.data.id);
        break;
      case 'SELECT_FOR_EDIT':
        setEditingAdvisor(update.data);
        break;
      case 'SAVE':
        handleUpdateAdvisor(update.data);
        break;
      case 'CANCEL':
        // Close any open modals
        setShowCreateModal(false);
        setEditingAdvisor(null);
        break;
    }
  };

  const findAdvisorByName = (name) => {
    const searchName = name.toLowerCase();
    return allAdvisors.find(advisor => 
      advisor.name.toLowerCase().includes(searchName) ||
      searchName.includes(advisor.name.toLowerCase())
    );
  };

  return (
    <div className="h-full overflow-y-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-6 h-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Advisory Board</h1>
            <p className="text-sm text-gray-600">
              Manage your AI advisors • {allAdvisors.length} total • {selectedAdvisors.length} selected
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowVoiceControl(!showVoiceControl)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
              showVoiceControl
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Toggle voice control"
          >
            {showVoiceControl ? <Volume2 className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>Voice</span>
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Advisor</span>
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
        <button
          onClick={selectAllAdvisors}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Select All
        </button>
        <button
          onClick={deselectAllAdvisors}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Deselect All
        </button>
        <span className="text-sm text-gray-500">
          • Click advisors to select/deselect for meetings
        </span>
      </div>

      {/* Advisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAdvisors.map((advisor) => {
          const isSelected = selectedAdvisors.find(a => a.id === advisor.id);
          
          return (
            <div
              key={advisor.id}
              className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                advisor.is_celebrity 
                  ? `${isSelected 
                    ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg' 
                    : 'border-purple-200 bg-gradient-to-br from-white to-purple-50 hover:border-purple-300 hover:shadow-md'
                  }`
                  : isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => toggleAdvisorSelection(advisor)}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}

              {/* Advisor Info */}
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 flex items-center justify-center">
                  {advisor.avatar_image || advisor.avatar_url ? (
                    <img 
                      src={advisor.avatar_image || advisor.avatar_url} 
                      alt={advisor.name}
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div 
                    className="text-3xl"
                    style={{ display: advisor.avatar_image || advisor.avatar_url ? 'none' : 'block' }}
                  >
                    {advisor.avatar_emoji || '👤'}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {advisor.name}
                    </h3>
                    {getAdvisorTypeIcon(advisor)}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{advisor.role}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      advisor.is_celebrity 
                        ? 'bg-purple-100 text-purple-700'
                        : advisor.is_host
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {getAdvisorTypeLabel(advisor)}
                    </span>
                    {advisor.specialty_focus && (
                      <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded">
                        {advisor.specialty_focus.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expertise */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-700 mb-2">EXPERTISE</h4>
                <div className="flex flex-wrap gap-1">
                  {(advisor.expertise || []).slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                    >
                      {skill}
                    </span>
                  ))}
                  {(advisor.expertise || []).length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{(advisor.expertise || []).length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Personality Preview for Celebrity Advisors */}
              {advisor.is_celebrity && advisor.background?.story && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">BACKGROUND</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {advisor.background.story.length > 80 
                      ? advisor.background.story.substring(0, 80) + '...'
                      : advisor.background.story
                    }
                  </p>
                  {advisor.personality?.catchphrases && advisor.personality.catchphrases.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs font-italic text-purple-600">
                        "{advisor.personality.catchphrases[0]}"
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingAdvisor(advisor);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit advisor"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAdvisor(advisor.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete advisor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-1">
                  <Brain className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {advisor.ai_service?.service_id || 'default'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {allAdvisors.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No advisors available</h3>
          <p className="text-gray-600 mb-6">Create your first AI advisor to get started</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Advisor</span>
          </button>
        </div>
      )}

      {/* Create Advisor Modal */}
      <CreateAdvisorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAdvisor={handleCreateAdvisor}
      />

      {/* Edit Advisor Modal */}
      {editingAdvisor && (
        <EditAdvisorModal
          isOpen={!!editingAdvisor}
          onClose={() => setEditingAdvisor(null)}
          advisor={editingAdvisor}
          onUpdateAdvisor={handleUpdateAdvisor}
        />
      )}

      {/* Settings Modal */}
      <AdvisorySettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      {/* Voice Control */}
      <VoiceAdvisorManager
        isVisible={showVoiceControl}
        onVoiceCommand={handleVoiceCommand}
        onAdvisorUpdate={handleAdvisorUpdate}
        currentAdvisor={editingAdvisor}
      />
    </div>
  );
}