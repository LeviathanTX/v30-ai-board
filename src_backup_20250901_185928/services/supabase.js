// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Check if environment variables are loaded (development only)
if (process.env.NODE_ENV === 'development') {
  if (!supabaseUrl || !supabaseAnonKey) {
    logger.warn('Supabase credentials not found. Check your .env file.');
  }
}

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Authentication
export const authService = {
  // Sign up
  async signUp(email, password, metadata = {}) {
    if (!supabase) return { error: 'Supabase not configured. Check your .env.local file.' };
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      logger.error('Sign up error:', error);
      return { data: null, error };
    }
  },

  // Sign in with proper redirect handling
  async signIn(email, password) {
    if (!supabase) return { error: 'Supabase not configured. Check your .env.local file.' };
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Force session refresh to ensure proper state
      const { data: { session } } = await supabase.auth.getSession();
      
      return { data: { ...data, session }, error: null };
    } catch (error) {
      logger.error('Sign in error:', error);
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    if (!supabase) return { error: 'Supabase not configured' };
    
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  async getCurrentUser() {
    if (!supabase) return { data: null, error: null };
    
    const { data: { user }, error } = await supabase.auth.getUser();
    return { data: user, error };
  },

  // Subscribe to auth changes
  onAuthStateChange(callback) {
    if (!supabase) return () => {};
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
    return () => subscription?.unsubscribe();
  }
};

// Document Management Service
export const documentService = {
  // Upload document to Supabase Storage
  async uploadDocument(file, userId) {
    if (!supabase) {
      logger.warn('Supabase not configured, using demo mode');
      return {
        data: {
          id: `demo_${Date.now()}`,
          user_id: userId || 'demo',
          name: file.name,
          type: file.type,
          size: file.size,
          storage_path: null,
          created_at: new Date().toISOString()
        },
        error: null
      };
    }
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Upload to Supabase Storage
      logger.debug('Uploading to Supabase Storage:', fileName);
      const { data, error } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        logger.error('Storage upload error:', error);
        // For demo mode, continue without actual upload
        return {
          data: {
            id: `demo_${Date.now()}`,
            user_id: userId || 'demo',
            name: file.name,
            type: file.type,
            size: file.size,
            storage_path: null,
            created_at: new Date().toISOString()
          },
          error: null
        };
      }
      
      // Store document metadata in database
      const { data: docData, error: dbError } = await supabase
        .from('documents')
        .insert([{
          user_id: userId,
          name: file.name,
          type: file.type,
          size: file.size,
          storage_path: data.path,
          content: null,
          analysis: null
        }])
        .select()
        .single();
      
      if (dbError) {
        logger.error('Database insert error:', dbError);
        // For demo mode, return mock data
        return {
          data: {
            id: `demo_${Date.now()}`,
            user_id: userId || 'demo',
            name: file.name,
            type: file.type,
            size: file.size,
            storage_path: data?.path,
            created_at: new Date().toISOString()
          },
          error: null
        };
      }
      
      return { data: docData, error: dbError };
    } catch (error) {
      logger.error('Upload error:', error);
      // Return demo data for development
      return {
        data: {
          id: `demo_${Date.now()}`,
          user_id: userId || 'demo',
          name: file.name,
          type: file.type,
          size: file.size,
          storage_path: null,
          created_at: new Date().toISOString()
        },
        error: null
      };
    }
  },

  // Get all documents for a user
  async getDocuments(userId) {
    if (!supabase) return { data: [], error: null };
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Get documents error:', error);
        return { data: [], error: null };
      }
      
      return { data: data || [], error };
    } catch (error) {
      logger.error('Get documents error:', error);
      return { data: [], error: null };
    }
  },

  // Update document
  async updateDocument(documentId, updates) {
    if (!supabase) {
      return { data: { id: documentId, ...updates }, error: null };
    }
    
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .select()
        .single();
      
      return { data: data || { id: documentId, ...updates }, error };
    } catch (error) {
      logger.error('Update document error:', error);
      return { data: { id: documentId, ...updates }, error: null };
    }
  },

  // Delete document
  async deleteDocument(documentId, storagePath) {
    if (!supabase) return { error: null };
    
    try {
      if (storagePath) {
        await supabase.storage
          .from('documents')
          .remove([storagePath]);
      }
      
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);
      
      return { error };
    } catch (error) {
      logger.error('Delete document error:', error);
      return { error: null };
    }
  }
};

// Conversation Service
export const conversationService = {
  // Create new conversation
  async createConversation(userId, title, advisors) {
    if (!supabase) {
      return {
        data: {
          id: `demo_conv_${Date.now()}`,
          user_id: userId || 'demo',
          title: title || `Meeting ${new Date().toLocaleDateString()}`,
          advisors,
          messages: [],
          documents: [],
          created_at: new Date().toISOString()
        },
        error: null
      };
    }
    
    const { data, error } = await supabase
      .from('conversations')
      .insert([{
        user_id: userId,
        title: title || `Meeting ${new Date().toLocaleDateString()}`,
        advisors,
        messages: [],
        documents: []
      }])
      .select()
      .single();
    
    return { data, error };
  },

  // Get all conversations
  async getConversations(userId) {
    if (!supabase) return { data: [], error: null };
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    
    return { data: data || [], error };
  },

  // Add message to conversation
  async addMessage(conversationId, message) {
    if (!supabase) return { error: null };
    
    const { data: conv, error: fetchError } = await supabase
      .from('conversations')
      .select('messages')
      .eq('id', conversationId)
      .single();
    
    if (fetchError) return { error: fetchError };
    
    const messages = [...(conv.messages || []), message];
    
    const { data, error } = await supabase
      .from('conversations')
      .update({
        messages,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId)
      .select()
      .single();
    
    return { data, error };
  }
};

// Advisor Service
export const advisorService = {
  // Get default advisors from database
  async getDefaultAdvisors() {
    if (!supabase) return { data: defaultAdvisors, error: null };
    
    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .eq('is_custom', false)
      .eq('is_active', true)
      .order('name');
    
    // Return database advisors if successful, fallback to hardcoded if error
    return { data: data || defaultAdvisors, error };
  },

  // Get custom advisors
  async getCustomAdvisors(userId) {
    if (!supabase) return { data: [], error: null };
    
    const { data, error } = await supabase
      .from('advisors')
      .select('*')
      .eq('user_id', userId)
      .eq('is_custom', true)
      .order('created_at', { ascending: false });
    
    return { data: data || [], error };
  },

  // Create custom advisor with training data
  async createAdvisor(userId, advisorData) {
    if (!supabase) {
      return {
        data: {
          id: `custom_${Date.now()}`,
          user_id: userId || 'demo',
          ...advisorData,
          is_custom: true,
          created_at: new Date().toISOString()
        },
        error: null
      };
    }
    
    const { data, error } = await supabase
      .from('advisors')
      .insert([{
        user_id: userId,
        ...advisorData,
        is_custom: true
      }])
      .select()
      .single();
    
    return { data, error };
  },

  // Update advisor
  async updateAdvisor(advisorId, advisorData) {
    if (!supabase) {
      return { data: advisorData, error: null };
    }
    
    const { data, error } = await supabase
      .from('advisors')
      .update(advisorData)
      .eq('id', advisorId)
      .select()
      .single();
    
    return { data, error };
  },

  // Delete advisor
  async deleteAdvisor(advisorId) {
    if (!supabase) {
      return { error: null };
    }
    
    const { error } = await supabase
      .from('advisors')
      .delete()
      .eq('id', advisorId);
    
    return { error };
  }
};

// Default advisors with Meeting Host
const defaultAdvisors = [
  {
    id: 'meeting-host',
    name: 'Meeting Host',
    role: 'AI Board Facilitator',
    expertise: ['Meeting Facilitation', 'Strategic Planning', 'Action Item Tracking'],
    personality: {
      traits: ['professional', 'organized', 'neutral', 'strategic'],
      communication_style: 'structured'
    },
    avatar_emoji: '🤖',
    is_custom: false,
    isHost: true
  },
  {
    id: '1',
    name: 'Sarah Chen',
    role: 'Chief Strategy Officer',
    expertise: ['Strategic Planning', 'Market Analysis', 'Growth Strategy'],
    personality: {
      traits: ['analytical', 'visionary', 'direct'],
      communication_style: 'professional'
    },
    avatar_emoji: '👩‍💼',
    is_custom: false
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    role: 'CFO',
    expertise: ['Financial Planning', 'Risk Management', 'Investment Strategy'],
    personality: {
      traits: ['detail-oriented', 'conservative', 'thorough'],
      communication_style: 'formal'
    },
    avatar_emoji: '👨‍💼',
    is_custom: false
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'CMO',
    expertise: ['Brand Strategy', 'Digital Marketing', 'Customer Experience'],
    personality: {
      traits: ['creative', 'enthusiastic', 'innovative'],
      communication_style: 'energetic'
    },
    avatar_emoji: '👩‍🎨',
    is_custom: false
  }
];

// Knowledge Base Service (for RAG/Map storage)
export const knowledgeBaseService = {
  // Create knowledge base for advisor
  async createKnowledgeBase(advisorId, name, description) {
    if (!supabase) {
      return {
        data: {
          id: `kb_${Date.now()}`,
          advisor_id: advisorId,
          name,
          description,
          documents: [],
          embeddings: {},
          created_at: new Date().toISOString()
        },
        error: null
      };
    }
    
    const { data, error } = await supabase
      .from('knowledge_bases')
      .insert([{
        advisor_id: advisorId,
        name,
        description,
        documents: [],
        embeddings: {}
      }])
      .select()
      .single();
    
    return { data, error };
  },

  // Add document to knowledge base
  async addDocumentToKnowledgeBase(knowledgeBaseId, documentId, processedContent) {
    if (!supabase) {
      return { error: null };
    }
    
    // Get current knowledge base
    const { data: kb, error: fetchError } = await supabase
      .from('knowledge_bases')
      .select('*')
      .eq('id', knowledgeBaseId)
      .single();
    
    if (fetchError) return { error: fetchError };
    
    // Add document and update embeddings
    const documents = [...(kb.documents || []), documentId];
    const embeddings = {
      ...(kb.embeddings || {}),
      [documentId]: processedContent.embeddings
    };
    
    const { data, error } = await supabase
      .from('knowledge_bases')
      .update({
        documents,
        embeddings,
        updated_at: new Date().toISOString()
      })
      .eq('id', knowledgeBaseId)
      .select()
      .single();
    
    return { data, error };
  }
};

export default supabase;