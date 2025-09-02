// src/components/AvatarUpload/AvatarUpload.js
import React, { useState } from 'react';
import { Upload, Camera, X, User } from 'lucide-react';
import { supabase } from '../../services/supabase';

export default function AvatarUpload({ advisorId, currentAvatar, currentEmoji, onAvatarUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase Storage
    setUploading(true);
    try {
      // If no supabase connection, just use preview
      if (!supabase) {
        onAvatarUpdate(reader.result);
        setUploading(false);
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${advisorId}-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update advisor
      onAvatarUpdate(publicUrl);
    } catch (error) {
      logger.error('Upload error:', error);
      setError('Failed to upload image. Using local preview.');
      // Fallback to data URL
      onAvatarUpdate(preview);
    } finally {
      setUploading(false);
    }
  };

  const clearAvatar = () => {
    setPreview(null);
    onAvatarUpdate(null);
    setError('');
  };

  const displayAvatar = preview || currentAvatar;

  return (
    <div className="space-y-2">
      <div className="relative">
        {displayAvatar ? (
          <div className="relative w-24 h-24 group">
            <img 
              src={displayAvatar} 
              alt="Avatar" 
              className="w-full h-full rounded-full object-cover border-2 border-gray-200"
            />
            <button
              onClick={clearAvatar}
              className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : currentEmoji ? (
          <div className="relative w-24 h-24 group">
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <span className="text-4xl">{currentEmoji}</span>
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <Camera className="w-8 h-8 text-white" />
            </label>
          </div>
        ) : (
          <label className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            ) : (
              <Camera className="w-8 h-8 text-gray-400" />
            )}
          </label>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        Click to upload a photo (max 5MB)
      </p>
    </div>
  );
}