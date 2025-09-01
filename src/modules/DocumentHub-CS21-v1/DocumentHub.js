// src/modules/DocumentHub-CS21-v1/DocumentHub.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileText, File, Image, FileSpreadsheet,
  Download, Trash2, Search, Filter, Grid, List,
  Eye, MoreVertical, FolderOpen, Loader, CheckCircle,
  AlertCircle, Brain, FileSearch, Link2, X, Copy, Share2,
  Sparkles, TrendingUp
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { documentService } from '../../services/supabase';
import { useSupabase } from '../../contexts/SupabaseContext';
import documentProcessor from '../../services/documentProcessor';
import DocumentAnalysisPanel from './DocumentAnalysisPanel';

export default function DocumentHub() {
  const { state, dispatch, actions } = useAppState();
  const { user } = useSupabase();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(null);
  const [showDocMenu, setShowDocMenu] = useState(null);
  const fileInputRef = useRef(null);

  // Auto-save documents to conversation context
  useEffect(() => {
    if (state.activeConversation && selectedDocs.length > 0) {
      dispatch({
        type: actions.SET_MEETING_DOCUMENTS,
        payload: selectedDocs.map(docId => 
          state.documents.find(d => d.id === docId)
        ).filter(Boolean)
      });
    }
  }, [selectedDocs, state.activeConversation, dispatch, actions, state.documents]);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    for (const file of files) {
      try {
        // Create initial document entry
        const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const mockDoc = {
          id: docId,
          name: file.name,
          type: file.type,
          size: file.size,
          status: 'uploading',
          uploadProgress: 0,
          created_at: new Date().toISOString()
        };
        
        dispatch({ type: actions.ADD_DOCUMENT, payload: mockDoc });
        setProcessing(prev => ({ ...prev, [docId]: 'uploading' }));

        // Upload to Supabase or demo mode
        const { data: uploadedDoc, error: uploadError } = await documentService.uploadDocument(
          file,
          user?.id || 'demo'
        );

        if (uploadError) {
          logger.error('Upload error:', uploadError);
          setProcessing(prev => ({ ...prev, [docId]: 'error' }));
          dispatch({
            type: actions.UPDATE_DOCUMENT,
            payload: {
              id: docId,
              status: 'error',
              error: 'Upload failed'
            }
          });
          continue;
        }

        // Update with real document data
        dispatch({ 
          type: actions.UPDATE_DOCUMENT, 
          payload: { 
            ...uploadedDoc, 
            id: docId,
            status: 'processing'
          } 
        });
        setProcessing(prev => ({ ...prev, [docId]: 'processing' }));

        // Process document content
        try {
          const processedData = await documentProcessor.processDocument(file);
          
          // Update document with extracted content
          const updatedDoc = {
            id: docId,
            ...uploadedDoc,
            content: processedData.text,
            extractedData: processedData,
            status: 'ready',
            analysis: {
              summary: processedData.summary,
              keywords: processedData.keywords,
              insights: processedData.insights,
              businessRelevance: processedData.businessRelevance
            }
          };

          dispatch({ type: actions.UPDATE_DOCUMENT, payload: updatedDoc });
          
          // Save to Supabase if available
          if (user?.id && uploadedDoc.id !== docId) {
            await documentService.updateDocument(uploadedDoc.id, {
              content: processedData.text,
              analysis: updatedDoc.analysis
            });
          }

          setProcessing(prev => ({ ...prev, [docId]: 'complete' }));
          
          dispatch({
            type: actions.ADD_NOTIFICATION,
            payload: {
              message: `${file.name} analyzed successfully`,
              type: 'success'
            }
          });
        } catch (processError) {
          logger.error('Processing error:', processError);
          setProcessing(prev => ({ ...prev, [docId]: 'error' }));
          
          dispatch({
            type: actions.UPDATE_DOCUMENT,
            payload: {
              id: docId,
              status: 'error',
              error: 'Failed to analyze document'
            }
          });
          
          dispatch({
            type: actions.ADD_NOTIFICATION,
            payload: {
              message: `Error analyzing ${file.name}: ${processError.message}`,
              type: 'error'
            }
          });
        }
      } catch (error) {
        logger.error('Upload error:', error);
        dispatch({
          type: actions.ADD_NOTIFICATION,
          payload: {
            message: `Failed to upload ${file.name}`,
            type: 'error'
          }
        });
      }
    }
    
    setUploading(false);
    // Clear processing status after a delay
    setTimeout(() => setProcessing({}), 5000);
  };

  const handleDelete = async (docId) => {
    const doc = state.documents.find(d => d.id === docId);
    if (!doc) return;

    if (window.confirm(`Are you sure you want to delete ${doc.name}?`)) {
      dispatch({ type: actions.DELETE_DOCUMENT, payload: docId });
      
      // Remove from Supabase if available
      if (user?.id && doc.storage_path) {
        await documentService.deleteDocument(docId, doc.storage_path);
      }
      
      dispatch({
        type: actions.ADD_NOTIFICATION,
        payload: {
          message: `${doc.name} deleted`,
          type: 'info'
        }
      });
    }
  };

  const filteredDocuments = state.documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.analysis?.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || 
                       (selectedType === 'pdf' && doc.type?.includes('pdf')) ||
                       (selectedType === 'word' && (doc.type?.includes('word') || doc.type?.includes('document'))) ||
                       (selectedType === 'spreadsheet' && (doc.type?.includes('sheet') || doc.type?.includes('excel'))) ||
                       (selectedType === 'text' && doc.type?.includes('text'));
    return matchesSearch && matchesType;
  });

  const getFileIcon = (fileType) => {
    if (!fileType) return File;
    if (fileType.includes('image')) return Image;
    if (fileType.includes('sheet') || fileType.includes('excel')) return FileSpreadsheet;
    if (fileType.includes('pdf')) return FileText;
    return File;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Hub</h1>
            <p className="text-sm text-gray-500 mt-1">Upload and analyze documents for AI insights</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDFs</option>
              <option value="word">Word Docs</option>
              <option value="spreadsheet">Spreadsheets</option>
              <option value="text">Text Files</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}`}
              >
                <List size={20} />
              </button>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:bg-gray-400"
            >
              {uploading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>Upload</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".pdf,.txt,.doc,.docx,.xls,.xlsx,.csv,.jpg,.jpeg,.png"
        />
      </div>

      {/* Document Grid/List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">No documents yet</h3>
            <p className="text-gray-500 mb-6">Upload documents to analyze them with AI advisors</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Upload Your First Document
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredDocuments.map(doc => {
              const FileIcon = getFileIcon(doc.type);
              const isProcessing = processing[doc.id];
              const isSelected = selectedDocs.includes(doc.id);
              const hasAnalysis = doc.analysis && doc.status === 'ready';
              
              return (
                <div
                  key={doc.id}
                  className={`bg-white rounded-lg border-2 p-4 hover:shadow-lg transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } ${hasAnalysis ? 'cursor-pointer' : ''}`}
                  onClick={() => {
                    if (hasAnalysis && !isProcessing) {
                      setShowAnalysis(doc);
                    }
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <FileIcon className={`w-10 h-10 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDocMenu(showDocMenu === doc.id ? null : doc.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <MoreVertical size={16} />
                      </button>
                      
                      {showDocMenu === doc.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasAnalysis) {
                                setShowAnalysis(doc);
                              }
                              setShowDocMenu(null);
                            }}
                            disabled={!hasAnalysis}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 disabled:text-gray-400"
                          >
                            <Eye size={16} />
                            <span>View Analysis</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSelected) {
                                setSelectedDocs(prev => prev.filter(id => id !== doc.id));
                              } else {
                                setSelectedDocs(prev => [...prev, doc.id]);
                              }
                              setShowDocMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                          >
                            <CheckCircle size={16} />
                            <span>{isSelected ? 'Deselect' : 'Select'}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(doc.id);
                              setShowDocMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="font-medium text-gray-900 mb-1 truncate">{doc.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{formatFileSize(doc.size)}</p>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="mb-3">
                      {isProcessing === 'uploading' && (
                        <div className="flex items-center space-x-2 text-blue-600">
                          <Loader className="animate-spin" size={16} />
                          <span className="text-sm">Uploading...</span>
                        </div>
                      )}
                      {isProcessing === 'processing' && (
                        <div className="flex items-center space-x-2 text-purple-600">
                          <Brain className="animate-pulse" size={16} />
                          <span className="text-sm">Analyzing...</span>
                        </div>
                      )}
                      {isProcessing === 'complete' && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <CheckCircle size={16} />
                          <span className="text-sm">Analysis Complete!</span>
                        </div>
                      )}
                      {isProcessing === 'error' && (
                        <div className="flex items-center space-x-2 text-red-600">
                          <AlertCircle size={16} />
                          <span className="text-sm">Analysis Failed</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Analysis Summary */}
                  {hasAnalysis && (
                    <div className="space-y-2">
                      {doc.analysis.summary && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {doc.analysis.summary}
                        </p>
                      )}
                      
                      {doc.analysis.businessRelevance !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Relevance</span>
                          <div className="w-20 bg-gray-200 rounded-full h-1.5">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-600 h-1.5 rounded-full"
                              style={{ width: `${doc.analysis.businessRelevance * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {doc.analysis.insights && doc.analysis.insights.length > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-purple-600">
                          <Sparkles size={12} />
                          <span>{doc.analysis.insights.length} insights</span>
                        </div>
                      )}
                      
                      {doc.analysis.keywords && doc.analysis.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {doc.analysis.keywords.slice(0, 3).map((keyword, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
                            >
                              {keyword.word}
                            </span>
                          ))}
                          {doc.analysis.keywords.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{doc.analysis.keywords.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Hint */}
                  {hasAnalysis && !isProcessing && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-xs text-blue-600 flex items-center">
                        <Eye size={12} className="mr-1" />
                        Click to view full analysis
                      </p>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-400">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedDocs.length === filteredDocuments.length && filteredDocuments.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedDocs(filteredDocuments.map(d => d.id));
                        } else {
                          setSelectedDocs([]);
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Analysis
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relevance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map(doc => {
                  const FileIcon = getFileIcon(doc.type);
                  const isSelected = selectedDocs.includes(doc.id);
                  const hasAnalysis = doc.analysis && doc.status === 'ready';
                  const isProcessing = processing[doc.id];
                  
                  return (
                    <tr key={doc.id} className={isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocs(prev => [...prev, doc.id]);
                            } else {
                              setSelectedDocs(prev => prev.filter(id => id !== doc.id));
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <FileIcon className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <p className="text-sm text-gray-500">
                              {formatFileSize(doc.size)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {hasAnalysis ? (
                          <div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {doc.analysis.summary}
                            </p>
                            {doc.analysis.insights && doc.analysis.insights.length > 0 && (
                              <p className="text-xs text-purple-600 mt-1">
                                {doc.analysis.insights.length} insights available
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-400">
                            {isProcessing ? 'Analyzing...' : 'No analysis'}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {hasAnalysis && doc.analysis.businessRelevance !== undefined ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-blue-600 h-2 rounded-full"
                                style={{ width: `${doc.analysis.businessRelevance * 100}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {Math.round(doc.analysis.businessRelevance * 100)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isProcessing ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Brain className="animate-pulse mr-1" size={12} />
                            Analyzing
                          </span>
                        ) : doc.status === 'ready' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle size={12} className="mr-1" />
                            Ready
                          </span>
                        ) : doc.status === 'error' ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <AlertCircle size={12} className="mr-1" />
                            Error
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => hasAnalysis && setShowAnalysis(doc)}
                            disabled={!hasAnalysis}
                            className="text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                            title="View Analysis"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="text-red-600 hover:text-red-700"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Document Analysis Panel */}
      {showAnalysis && (
        <DocumentAnalysisPanel
          document={showAnalysis}
          onClose={() => setShowAnalysis(null)}
        />
      )}
    </div>
  );
}