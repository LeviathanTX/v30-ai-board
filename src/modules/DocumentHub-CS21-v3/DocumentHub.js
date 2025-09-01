// src/modules/DocumentHub-CS21-v3/DocumentHub.js - Fixed with Delete functionality
import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Upload, Trash2, Eye, Download, Search, 
  Filter, Grid, List, CheckCircle, AlertCircle, Clock,
  File, FileImage, FileSpreadsheet, X, Loader, BarChart2,
  Share2, Brain, TrendingUp, Edit2
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { useSupabase } from '../../contexts/SupabaseContext';

export default function DocumentHub() {
  const { state, dispatch, actions } = useAppState();
  const { user } = useSupabase();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showIntelligence, setShowIntelligence] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // Enhanced drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  // Delete document handler
  const handleDeleteDocument = (doc) => {
    dispatch({ type: actions.DELETE_DOCUMENT, payload: doc.id });
    
    // If this was the selected document, clear selection
    if (selectedDocument?.id === doc.id) {
      setSelectedDocument(null);
    }
    
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: { 
        message: `${doc.name} deleted successfully`,
        type: 'success'
      }
    });
    
    setShowDeleteConfirm(null);
  };

  // Fixed file upload handler - ensures documents show up
  const handleFileUpload = async (fileList) => {
    const files = Array.from(fileList);
    setIsUploading(true);

    for (const file of files) {
      try {
        // Validate file
        if (file.size > 10 * 1024 * 1024) {
          dispatch({
            type: actions.ADD_NOTIFICATION,
            payload: { 
              message: `${file.name} is too large. Max size is 10MB.`,
              type: 'error'
            }
          });
          continue;
        }

        // Create document entry with unique ID
        const newDoc = {
          id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: file.size,
          status: 'processing',
          created_at: new Date().toISOString(),
          content: '',
          summary: 'Processing document...',
          key_points: []
        };

        // Add to state immediately so it shows up
        dispatch({ type: actions.ADD_DOCUMENT, payload: newDoc });

        // Simulate processing with progress
        setUploadProgress(prev => ({ ...prev, [newDoc.id]: 0 }));
        
        // Simulate progress updates
        for (let i = 0; i <= 100; i += 20) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setUploadProgress(prev => ({ ...prev, [newDoc.id]: i }));
        }

        // Simulate analysis completion
        const processedDoc = {
          ...newDoc,
          status: 'ready',
          summary: `Analysis of ${file.name}. This document contains important business information relevant to your strategic planning.`,
          key_points: [
            'Key insight about market trends',
            'Financial projections for next quarter',
            'Strategic recommendations for growth',
            'Risk factors to consider'
          ],
          analysis: {
            sentiment: 'positive',
            topics: ['strategy', 'finance', 'growth', 'market analysis']
          }
        };

        // Update document with processed data
        dispatch({ type: actions.UPDATE_DOCUMENT, payload: processedDoc });
        
        // Clean up progress
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[newDoc.id];
          return newProgress;
        });

        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: { 
            message: `${file.name} uploaded and analyzed successfully!`,
            type: 'success'
          }
        });

      } catch (error) {
        logger.error('Upload error:', error);
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: { 
            message: `Failed to upload ${file.name}: ${error.message}`,
            type: 'error'
          }
        });
      }
    }

    setIsUploading(false);
  };

  // Enhanced share with advisors
  const shareWithAdvisors = (doc) => {
    dispatch({ type: actions.SELECT_DOCUMENT, payload: doc });
    dispatch({
      type: actions.ADD_NOTIFICATION,
      payload: { 
        message: `${doc.name} shared with AI advisors. Switch to AI Boardroom to discuss.`,
        type: 'success'
      }
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Filter documents
  const filteredDocuments = (state.documents || []).filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === 'all' || 
                       (filterType === 'pdf' && doc.type?.includes('pdf')) ||
                       (filterType === 'doc' && (doc.type?.includes('word') || doc.type?.includes('document'))) ||
                       (filterType === 'spreadsheet' && (doc.type?.includes('sheet') || doc.type?.includes('excel'))) ||
                       (filterType === 'image' && doc.type?.includes('image'));
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
              <FileText className="w-6 h-6" />
              <span>Document Hub</span>
            </h1>
            <p className="text-gray-600 mt-1">
              Upload, analyze, and share documents with your AI advisors
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowIntelligence(!showIntelligence)}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                showIntelligence 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Brain size={20} />
              <span>Intelligence</span>
            </button>
            
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="pdf">PDF</option>
            <option value="doc">Documents</option>
            <option value="spreadsheet">Spreadsheets</option>
            <option value="image">Images</option>
          </select>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Document List/Grid */}
        <div className={`flex-1 p-6 overflow-auto ${showIntelligence ? 'w-2/3' : 'w-full'}`}>
          {/* Enhanced Upload Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`mb-6 border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">
              Drag and drop files here, or{' '}
              <label className="text-blue-600 hover:text-blue-700 cursor-pointer">
                browse
                <input
                  type="file"
                  multiple
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.jpg,.jpeg,.png"
                />
              </label>
            </p>
            <p className="text-sm text-gray-500">
              PDF, DOC, TXT, CSV, XLSX, Images (Max 10MB)
            </p>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="mb-4 space-y-2">
              {Object.entries(uploadProgress).map(([docId, progress]) => (
                <div key={docId} className="bg-white rounded-lg border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Uploading...</span>
                    <span className="text-sm text-gray-500">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Document Grid/List View */}
          {filteredDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No documents match your search' : 'No documents uploaded yet'}
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Upload documents to analyze them with AI
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => setSelectedDocument(doc)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-blue-500" />
                      {doc.status === 'ready' && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          shareWithAdvisors(doc);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Share with AI Advisors"
                      >
                        <Share2 size={16} className="text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(doc);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 truncate mb-1">
                    {doc.name}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                    {doc.summary || 'Processing...'}
                  </p>
                  
                  {/* Key Points Preview */}
                  {doc.key_points && doc.key_points.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-700 mb-1">Key Points:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {doc.key_points.slice(0, 2).map((point, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-blue-500 mr-1">•</span>
                            <span className="line-clamp-1">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatFileSize(doc.size)}</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <FileText className="w-8 h-8 text-blue-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {doc.summary}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{doc.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatFileSize(doc.size)}</td>
                      <td className="px-4 py-3">
                        {doc.status === 'ready' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => shareWithAdvisors(doc)}
                            className="text-blue-600 hover:text-blue-700"
                            title="Share with AI"
                          >
                            <Share2 size={18} />
                          </button>
                          <button
                            onClick={() => setSelectedDocument(doc)}
                            className="text-gray-600 hover:text-gray-700"
                            title="View"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(doc)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Intelligence Dashboard */}
        {showIntelligence && (
          <div className="w-1/3 bg-white border-l border-gray-200 p-6 overflow-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Brain className="w-5 h-5 mr-2 text-purple-600" />
              Document Intelligence
            </h2>

            {selectedDocument ? (
              <div className="space-y-6">
                {/* Document Overview */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-600">{selectedDocument.summary}</p>
                </div>

                {/* Key Insights */}
                {selectedDocument.key_points && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-green-600" />
                      Key Insights
                    </h4>
                    <ul className="space-y-2">
                      {selectedDocument.key_points.map((point, idx) => (
                        <li key={idx} className="flex items-start text-sm">
                          <span className="text-green-500 mr-2 mt-0.5">•</span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* AI Analysis */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <BarChart2 className="w-4 h-4 mr-2 text-blue-600" />
                    AI Analysis
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700">
                      {selectedDocument.analysis?.sentiment || 'Analyzing document sentiment...'}
                    </p>
                    {selectedDocument.analysis?.topics && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Topics:</p>
                        <div className="flex flex-wrap gap-1">
                          {selectedDocument.analysis.topics.map((topic, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => shareWithAdvisors(selectedDocument)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <Share2 size={18} />
                    <span>Share with AI Advisors</span>
                  </button>
                  <button
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center space-x-2"
                  >
                    <BarChart2 size={18} />
                    <span>Deep Analysis</span>
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(selectedDocument)}
                    className="w-full px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 flex items-center justify-center space-x-2"
                  >
                    <Trash2 size={18} />
                    <span>Delete Document</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select a document to view intelligence</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Document</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{showDeleteConfirm.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteDocument(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}