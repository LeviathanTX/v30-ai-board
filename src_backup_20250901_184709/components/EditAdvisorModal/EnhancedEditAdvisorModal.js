// src/components/EditAdvisorModal/EnhancedEditAdvisorModal.js
import React, { useState, useEffect, useRef } from 'react';
import { X, User, Briefcase, Brain, Settings, Upload, FileText, Trash2, CheckCircle, Save, Image, Camera, Mic, MicOff, Volume2 } from 'lucide-react';
import { AI_SERVICES } from '../../config/aiServices';
import { knowledgeBaseService } from '../../services/supabase';
import { useSupabase } from '../../contexts/SupabaseContext';
import AdvisorVoiceSettings from '../VoiceControl/AdvisorVoiceSettings';

export default function EnhancedEditAdvisorModal({ isOpen, onClose, advisor, onUpdateAdvisor }) {
  const { user } = useSupabase();
  const fileInputRef = useRef(null);
  const avatarInputRef = useRef(null);
  
  const [advisorData, setAdvisorData] = useState({
    name: '',
    role: '',
    avatar_emoji: '👤',
    avatar_image: null,
    expertise: [],
    personality: {
      traits: [],
      communication_style: 'professional'
    },
    ai_service: {
      service_id: 'anthropic',
      model: 'claude-3-5-sonnet-20241022'
    },
    system_prompt: '',
    is_custom: true
  });

  const [currentExpertise, setCurrentExpertise] = useState('');
  const [currentTrait, setCurrentTrait] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [avatarType, setAvatarType] = useState('emoji'); // 'emoji' or 'image'
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [showVoiceControl, setShowVoiceControl] = useState(false);

  const communicationStyles = [
    'professional',
    'friendly',
    'direct',
    'analytical',
    'creative',
    'diplomatic',
    'energetic',
    'warm',
    'authoritative',
    'inspirational',
    'structured',
    'empowering-leader',
    'data-driven',
    'systematic',
    'thoughtful-leader'
  ];

  const commonEmojis = [
    '👤', '👩‍💼', '👨‍💼', '🧑‍💼', '👩‍🔬', '👨‍🔬', '👩‍💻', '👨‍💻',
    '👩‍🎓', '👨‍🎓', '🧠', '💡', '🎯', '📊', '💼', '🚀', '⚡', '🌟',
    '🦈', '🎙️', '👑', '💪', '💰', '☁️', '🔒', '🌱', '🔥', '🤝'
  ];

  // Initialize form data when advisor changes
  useEffect(() => {
    if (advisor && isOpen) {
      // Determine avatar type and set preview
      const hasImage = advisor.avatar_image || advisor.avatar_url;
      setAvatarType(hasImage ? 'image' : 'emoji');
      setAvatarPreview(hasImage ? (advisor.avatar_image || advisor.avatar_url) : null);
      
      setAdvisorData({
        ...advisor,
        name: advisor.name || '',
        role: advisor.role || '',
        avatar_emoji: advisor.avatar_emoji || '👤',
        avatar_image: advisor.avatar_image || null,
        expertise: Array.isArray(advisor.expertise) ? advisor.expertise : [],
        personality: {
          traits: Array.isArray(advisor.personality?.traits) ? advisor.personality.traits : [],
          communication_style: advisor.personality?.communication_style || 'professional'
        },
        ai_service: advisor.ai_service || {
          service_id: 'anthropic',
          model: 'claude-3-5-sonnet-20241022'
        },
        system_prompt: advisor.system_prompt || '',
        is_custom: advisor.is_custom !== undefined ? advisor.is_custom : true
      });
      
      // TODO: Load existing documents for this advisor
      setUploadedDocuments([]);
      setUploadError('');
    }
  }, [advisor, isOpen]);

  if (!isOpen || !advisor) return null;

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadError('');

    try {
      for (const file of files) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`File type ${file.type} not supported. Please use PDF, TXT, MD, or Word documents.`);
        }

        // Validate file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error(`File ${file.name} is too large. Maximum size is 10MB.`);
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'advisor_knowledge');
        formData.append('advisorId', advisor.id);

        // Get auth token
        const token = user ? await user.getIdToken?.() || 'demo-token' : 'demo-token';

        const response = await fetch('/api/documents/process', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        const result = await response.json();
        
        setUploadedDocuments(prev => [...prev, {
          id: result.documentId || `doc_${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          processed: result.processed || false
        }]);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeDocument = (docId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  const handleAvatarImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Image must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target.result);
      setAdvisorData(prev => ({ ...prev, avatar_image: file }));
    };
    reader.readAsDataURL(file);
  };

  const handleVoiceCommand = (command) => {
    switch (command.action) {
      case 'UPDATE_FIELD':
        if (command.field === 'name' && command.value) {
          setAdvisorData(prev => ({ ...prev, name: command.value }));
        } else if (command.field === 'role' && command.value) {
          setAdvisorData(prev => ({ ...prev, role: command.value }));
        } else if (command.field === 'communication_style' && command.value) {
          setAdvisorData(prev => ({
            ...prev,
            personality: { ...prev.personality, communication_style: command.value }
          }));
        }
        break;
        
      case 'ADD_EXPERTISE':
        if (command.value && !advisorData.expertise.includes(command.value)) {
          setAdvisorData(prev => ({
            ...prev,
            expertise: [...prev.expertise, command.value]
          }));
        }
        break;
        
      case 'ADD_TRAIT':
        if (command.value && !advisorData.personality.traits.includes(command.value)) {
          setAdvisorData(prev => ({
            ...prev,
            personality: {
              ...prev.personality,
              traits: [...prev.personality.traits, command.value]
            }
          }));
        }
        break;
        
      case 'SAVE_ADVISOR':
        handleSubmit(new Event('submit'));
        break;
        
      case 'CANCEL':
        onClose();
        break;
    }
  };

  const handleAdvisorUpdate = (update) => {
    switch (update.type) {
      case 'UPDATE':
        setAdvisorData(update.data);
        break;
      case 'SAVE':
        handleSubmit(new Event('submit'));
        break;
      case 'CANCEL':
        onClose();
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!advisorData.name.trim() || !advisorData.role.trim()) {
      alert('Please fill in name and role fields');
      return;
    }

    setIsSaving(true);

    try {
      // Update advisor data
      const updatedAdvisor = {
        ...advisorData,
        expertise: advisorData.expertise.filter(e => e.trim()),
        personality: {
          ...advisorData.personality,
          traits: advisorData.personality.traits.filter(t => t.trim())
        }
      };

      await onUpdateAdvisor(updatedAdvisor);

      // Handle knowledge base updates if documents were uploaded
      if (uploadedDocuments.length > 0) {
        try {
          // Create or update knowledge base
          const { data: knowledgeBase, error: kbError } = await knowledgeBaseService.createKnowledgeBase(
            advisor.id,
            `${updatedAdvisor.name} Knowledge Base`,
            `Updated documents for ${updatedAdvisor.name}`
          );

          if (kbError) {
            console.error('Failed to update knowledge base:', kbError);
          } else {
            console.log('Knowledge base updated:', knowledgeBase);
          }
        } catch (error) {
          console.error('Knowledge base update error:', error);
        }
      }

      onClose();
      
    } catch (error) {
      console.error('Error updating advisor:', error);
      alert('Failed to update advisor. Please try again.');
    } finally {
      setIsSaving(false);
    }
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

  const getAdvisorTypeLabel = () => {
    if (advisor.is_host) return 'Meeting Host';
    if (advisor.is_custom) return 'Custom Advisor';
    if (advisor.is_celebrity) return 'Celebrity Advisor';
    if (advisor.specialty_focus === 'venture_capital') return 'Shark Tank Advisor';
    return 'Core Team Advisor';
  };

  const canEdit = advisor.is_custom || user; // Allow editing of non-custom advisors if user is logged in

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Edit AI Advisor
              </h2>
              <p className="text-sm text-gray-600">{getAdvisorTypeLabel()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <AdvisorVoiceSettings 
                advisor={advisorData}
                onVoiceCommand={handleVoiceCommand}
                onAdvisorUpdate={handleAdvisorUpdate}
                showInHeader={true}
                isVisible={showVoiceControl}
                onToggleVisible={() => setShowVoiceControl(!showVoiceControl)}
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {!canEdit && (
          <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> You can edit this advisor's configuration, but changes will only be saved locally until you sign in.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Voice Control Section - Inline */}
          <AdvisorVoiceSettings 
            advisor={advisorData}
            onVoiceCommand={handleVoiceCommand}
            onAdvisorUpdate={handleAdvisorUpdate}
            showInHeader={false}
            isVisible={showVoiceControl}
          />

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Basic Information
            </h3>
            
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
                Advisor Avatar
              </label>
              
              {/* Avatar Type Selector */}
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setAvatarType('emoji')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    avatarType === 'emoji' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">😊</span>
                  <span>Emoji</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarType('image')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                    avatarType === 'image' 
                      ? 'bg-blue-50 border-blue-500 text-blue-700' 
                      : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  <span>Image</span>
                </button>
              </div>

              {avatarType === 'emoji' && (
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {commonEmojis.map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setAdvisorData(prev => ({ ...prev, avatar_emoji: emoji }))}
                        className={`w-10 h-10 text-xl hover:bg-gray-100 rounded-lg transition-colors ${
                          advisorData.avatar_emoji === emoji ? 'bg-blue-100 ring-2 ring-blue-500' : ''
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
                    className="w-24 px-2 py-1 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="🤖"
                    maxLength={2}
                  />
                </div>
              )}

              {avatarType === 'image' && (
                <div>
                  <div className="flex items-center space-x-4">
                    {/* Image Preview */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                      {avatarPreview ? (
                        <img 
                          src={avatarPreview} 
                          alt="Avatar preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    
                    {/* Upload Button */}
                    <div className="flex-1">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{avatarPreview ? 'Change Image' : 'Upload Image'}</span>
                      </button>
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max 2MB • PNG, JPG, GIF
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt (Optional)
              </label>
              <textarea
                value={advisorData.system_prompt}
                onChange={(e) => setAdvisorData(prev => ({ ...prev, system_prompt: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Define how this advisor should behave and respond..."
                rows={3}
              />
            </div>
          </div>

          {/* Knowledge Base */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Knowledge Base (MCP Documents)
            </h3>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Documents</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  Upload PDF, TXT, MD, or Word documents to enhance this advisor's knowledge base
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 10MB per file • Supports PDF, TXT, MD, DOC, DOCX
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.txt,.md,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {uploadError && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}

            {uploadedDocuments.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Documents:</h4>
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.size / 1024 / 1024).toFixed(2)} MB
                          {doc.processed && <span className="ml-2 inline-flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                            Processed
                          </span>}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDocument(doc.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Expertise */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Brain className="w-5 h-5 mr-2" />
              Expertise & Skills
            </h3>
            
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentExpertise}
                onChange={(e) => setCurrentExpertise(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add an area of expertise..."
              />
              <button
                type="button"
                onClick={addExpertise}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            
            {advisorData.expertise.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {advisorData.expertise.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeExpertise(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Personality */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Personality & AI Configuration
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Communication Style */}
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
                      {style.charAt(0).toUpperCase() + style.slice(1).replace(/-/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* AI Service */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  AI Service
                </label>
                <select
                  value={advisorData.ai_service.service_id}
                  onChange={(e) => {
                    const service = AI_SERVICES[e.target.value];
                    const defaultModel = service?.models.find(m => m.recommended) || service?.models[0];
                    setAdvisorData(prev => ({
                      ...prev,
                      ai_service: {
                        service_id: e.target.value,
                        model: defaultModel?.id || prev.ai_service.model
                      }
                    }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(AI_SERVICES).map(([id, service]) => (
                    <option key={id} value={id}>
                      {service.icon} {service.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* AI Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI Model
              </label>
              <select
                value={advisorData.ai_service.model}
                onChange={(e) => setAdvisorData(prev => ({
                  ...prev,
                  ai_service: { ...prev.ai_service, model: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {AI_SERVICES[advisorData.ai_service.service_id]?.models.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} {model.recommended && '(Recommended)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Personality Traits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Personality Traits
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={currentTrait}
                  onChange={(e) => setCurrentTrait(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTrait())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a personality trait..."
                />
                <button
                  type="button"
                  onClick={addTrait}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Add
                </button>
              </div>
              
              {advisorData.personality.traits.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {advisorData.personality.traits.map((trait, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center"
                    >
                      {trait}
                      <button
                        type="button"
                        onClick={() => removeTrait(index)}
                        className="ml-2 text-gray-600 hover:text-gray-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}