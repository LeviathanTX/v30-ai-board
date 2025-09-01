// src/modules/DocumentHub-CS21-v4/DocumentHub.js - Advanced Document Hub with VC Due Diligence
import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, FileText, File, Image, FileSpreadsheet, Presentation,
  Download, Trash2, Search, Filter, Grid, List, Eye, MoreVertical,
  FolderOpen, Loader, CheckCircle, AlertCircle, Brain, FileSearch,
  Link2, X, Copy, Share2, Sparkles, TrendingUp, AlertTriangle,
  Shield, DollarSign, Scale, BarChart3, Target, Users2, Clock,
  Zap, Award, BookOpen, Briefcase
} from 'lucide-react';
import { useAppState } from '../../contexts/AppStateContext';
import { documentService } from '../../services/supabase';
import { useSupabase } from '../../contexts/SupabaseContext';
import advancedDocumentIntelligence from '../../services/documentIntelligenceV2';
import DocumentAnalysisPanel from './DocumentAnalysisPanel';
import DueDiligencePanel from './DueDiligencePanel';

export default function AdvancedDocumentHub() {
  const { state, dispatch, actions } = useAppState();
  const { user } = useSupabase();
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState({});
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [showAnalysis, setShowAnalysis] = useState(null);
  const [showDueDiligence, setShowDueDiligence] = useState(false);
  const [dueDiligenceResults, setDueDiligenceResults] = useState(null);
  const [showDocMenu, setShowDocMenu] = useState(null);
  const fileInputRef = useRef(null);

  // Enhanced document states
  const [documentCategories, setDocumentCategories] = useState({});
  const [crossReferences, setCrossReferences] = useState([]);
  const [riskAssessment, setRiskAssessment] = useState(null);

  const documentTypes = [
    { id: 'all', label: 'All Documents', icon: File },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'legal', label: 'Legal', icon: Scale },
    { id: 'business', label: 'Business', icon: Briefcase },
    { id: 'technical', label: 'Technical', icon: Brain },
    { id: 'hr', label: 'HR/People', icon: Users2 }
  ];

  useEffect(() => {
    if (state.documents && state.documents.length > 0) {
      categorizeDocuments();
      updateCrossReferences();
    }
  }, [state.documents]);

  const handleAdvancedFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    
    for (const file of files) {
      // Create initial document entry
      const docId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      try {
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

        // Upload to Supabase
        const { data: uploadedDoc, error: uploadError } = await documentService.uploadDocument(
          file,
          user?.id || 'demo'
        );

        if (uploadError) {
          setProcessing(prev => ({ ...prev, [docId]: 'error' }));
          continue;
        }

        // Advanced processing with new intelligence service
        setProcessing(prev => ({ ...prev, [docId]: 'analyzing' }));
        
        try {
          const processedData = await advancedDocumentIntelligence.processDocumentDeep(file);
          
          // Update document with advanced analysis
          const enhancedDoc = {
            ...uploadedDoc,
            id: docId,
            status: 'completed',
            analysis: {
              ...processedData,
              processedAt: new Date().toISOString()
            }
          };

          dispatch({ 
            type: actions.UPDATE_DOCUMENT, 
            payload: enhancedDoc 
          });
          
          setProcessing(prev => ({ ...prev, [docId]: 'completed' }));
        } catch (analysisError) {
          console.error('Advanced analysis error:', analysisError);
          setProcessing(prev => ({ ...prev, [docId]: 'analysis_failed' }));
        }

      } catch (error) {
        console.error('Document upload error:', error);
        setProcessing(prev => ({ ...prev, [docId]: 'error' }));
      }
    }
    
    setUploading(false);
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const categorizeDocuments = () => {
    const categories = state.documents.reduce((acc, doc) => {
      const category = doc.analysis?.documentType || 'unknown';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {});
    
    setDocumentCategories(categories);
  };

  const updateCrossReferences = async () => {
    try {
      const processedDocs = state.documents.filter(doc => doc.analysis);
      if (processedDocs.length > 1) {
        const refs = await advancedDocumentIntelligence.findDocumentCrossReferences(processedDocs);
        setCrossReferences(refs);
      }
    } catch (error) {
      console.error('Cross-reference error:', error);
    }
  };

  const performDueDiligence = async () => {
    try {
      setShowDueDiligence(true);
      const processedDocs = state.documents.filter(doc => doc.analysis);
      
      if (processedDocs.length === 0) {
        setDueDiligenceResults({
          overallScore: 0,
          categoryScores: {},
          findings: [],
          recommendations: [{
            priority: 'high',
            title: 'Upload Documents',
            description: 'No documents available for due diligence analysis'
          }],
          missingDocuments: []
        });
        return;
      }

      const results = await advancedDocumentIntelligence.performDueDiligenceAnalysis(
        processedDocs,
        'comprehensive'
      );
      
      setDueDiligenceResults(results);
      
      // Update risk assessment
      const risks = processedDocs.flatMap(doc => doc.analysis.riskFactors || []);
      setRiskAssessment({
        totalRisks: risks.length,
        highRisks: risks.filter(r => r.severity === 'high').length,
        categories: risks.reduce((acc, risk) => {
          acc[risk.category] = (acc[risk.category] || 0) + 1;
          return acc;
        }, {})
      });

    } catch (error) {
      console.error('Due diligence error:', error);
    }
  };

  const filteredDocuments = state.documents?.filter(doc => {
    if (!doc) return false;
    
    const matchesSearch = searchQuery === '' || 
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.analysis?.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedType === 'all' || 
      doc.analysis?.documentType?.includes(selectedType);
    
    return matchesSearch && matchesType;
  }) || [];

  const getDocumentIcon = (doc) => {
    const type = doc.type || '';
    const docType = doc.analysis?.documentType || '';
    
    if (type.includes('pdf')) return FileText;
    if (type.includes('sheet') || type.includes('excel')) return FileSpreadsheet;
    if (type.includes('presentation') || type.includes('powerpoint')) return Presentation;
    if (type.includes('image')) return Image;
    if (docType.includes('financial')) return DollarSign;
    if (docType.includes('legal')) return Scale;
    return File;
  };

  const getDocumentStatusBadge = (doc) => {
    const status = processing[doc.id] || doc.status;
    const riskCount = doc.analysis?.riskFactors?.length || 0;
    
    if (status === 'uploading') {
      return <div className="flex items-center text-blue-600"><Loader className="w-3 h-3 mr-1 animate-spin" />Uploading</div>;
    }
    if (status === 'analyzing') {
      return <div className="flex items-center text-purple-600"><Brain className="w-3 h-3 mr-1 animate-pulse" />Analyzing</div>;
    }
    if (status === 'completed') {
      if (riskCount > 0) {
        return <div className="flex items-center text-orange-600"><AlertTriangle className="w-3 h-3 mr-1" />{riskCount} Risks</div>;
      }
      return <div className="flex items-center text-green-600"><CheckCircle className="w-3 h-3 mr-1" />Analyzed</div>;
    }
    if (status === 'error') {
      return <div className="flex items-center text-red-600"><AlertCircle className="w-3 h-3 mr-1" />Error</div>;
    }
    
    return null;
  };

  const renderDocumentCard = (doc) => {
    const Icon = getDocumentIcon(doc);
    const hasAnalysis = doc.analysis && Object.keys(doc.analysis).length > 0;
    
    return (
      <div key={doc.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center flex-1 min-w-0">
            <Icon className="w-8 h-8 text-blue-600 mr-3 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-gray-900 truncate">{doc.name}</h3>
              <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
            </div>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowDocMenu(showDocMenu === doc.id ? null : doc.id)}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            
            {showDocMenu === doc.id && (
              <div className="absolute right-0 top-6 bg-white border rounded-lg shadow-lg z-10 py-1 min-w-48">
                <button
                  onClick={() => {
                    setShowAnalysis(doc);
                    setShowDocMenu(null);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Analysis
                </button>
                <button
                  onClick={() => setSelectedDocs(prev => 
                    prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]
                  )}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center"
                >
                  {selectedDocs.includes(doc.id) ? 
                    <>
                      <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                      Selected
                    </> :
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Select
                    </>
                  }
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="mb-2">
          {getDocumentStatusBadge(doc)}
        </div>
        
        {hasAnalysis && (
          <div className="space-y-2">
            {doc.analysis.summary && (
              <p className="text-xs text-gray-600 line-clamp-2">{doc.analysis.summary}</p>
            )}
            
            <div className="flex flex-wrap gap-1">
              {doc.analysis.entities?.financialTerms?.slice(0, 3).map((term, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  <DollarSign className="w-3 h-3 mr-1" />
                  {term.name}
                </span>
              ))}
              
              {doc.analysis.riskFactors?.slice(0, 2).map((risk, idx) => (
                <span key={idx} className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                  risk.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  {risk.category}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{new Date(doc.created_at).toLocaleDateString()}</span>
            {doc.analysis?.compliance?.score && (
              <span className={`flex items-center ${
                doc.analysis.compliance.score >= 80 ? 'text-green-600' :
                doc.analysis.compliance.score >= 60 ? 'text-orange-600' : 'text-red-600'
              }`}>
                <Shield className="w-3 h-3 mr-1" />
                {doc.analysis.compliance.score}%
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="w-8 h-8 mr-3 text-blue-600" />
              Advanced Document Intelligence
            </h1>
            <p className="text-gray-600 mt-1">VC-Grade Due Diligence Analysis</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={performDueDiligence}
              disabled={!state.documents || state.documents.length === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Award className="w-4 h-4" />
              <span>Due Diligence</span>
            </button>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload'}</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-blue-600">{state.documents?.length || 0}</div>
                <div className="text-sm text-blue-800">Total Documents</div>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {state.documents?.filter(d => d.analysis).length || 0}
                </div>
                <div className="text-sm text-green-800">Analyzed</div>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-orange-600">{riskAssessment?.totalRisks || 0}</div>
                <div className="text-sm text-orange-800">Risk Factors</div>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <Link2 className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-purple-600">{crossReferences.length}</div>
                <div className="text-sm text-purple-800">Cross References</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search documents, content, entities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {documentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.label}</option>
              ))}
            </select>
            
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Grid/List */}
      <div className="flex-1 overflow-auto p-6">
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 mb-6">Upload documents to start your due diligence analysis</p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
            : 'space-y-2'
          }>
            {filteredDocuments.map(renderDocumentCard)}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv"
        onChange={handleAdvancedFileUpload}
        className="hidden"
      />

      {/* Analysis Modal */}
      {showAnalysis && (
        <DocumentAnalysisPanel
          document={showAnalysis}
          onClose={() => setShowAnalysis(null)}
        />
      )}

      {/* Due Diligence Results */}
      {showDueDiligence && (
        <DueDiligencePanel
          results={dueDiligenceResults}
          documents={state.documents}
          crossReferences={crossReferences}
          onClose={() => setShowDueDiligence(false)}
        />
      )}
    </div>
  );
}