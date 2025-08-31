// src/modules/DocumentHub-CS21-v1/DocumentAnalysisPanel.js
import React from 'react';
import { X, Brain, Tag, Lightbulb, TrendingUp, AlertTriangle, Activity } from 'lucide-react';

export default function DocumentAnalysisPanel({ document, onClose }) {
  if (!document) return null;

  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity': return TrendingUp;
      case 'risk': return AlertTriangle;
      case 'trend': return Activity;
      default: return Lightbulb;
    }
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{document.name}</h2>
              <p className="text-sm text-gray-500 mt-1">AI Analysis Results</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Summary Section */}
          {document.analysis?.summary && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-600" />
                Executive Summary
              </h3>
              <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">
                {document.analysis.summary}
              </p>
            </div>
          )}

          {/* Business Relevance Score */}
          {document.analysis?.businessRelevance !== undefined && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Business Relevance</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${document.analysis.businessRelevance * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-2xl font-bold text-gray-900">
                  {Math.round(document.analysis.businessRelevance * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Keywords Section */}
          {document.analysis?.keywords && document.analysis.keywords.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Tag className="w-5 h-5 mr-2 text-blue-600" />
                Key Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {document.analysis.keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center"
                    style={{ opacity: 0.6 + (keyword.importance * 0.4) }}
                  >
                    {keyword.word}
                    {keyword.importance > 0.8 && (
                      <span className="ml-1 text-xs">⭐</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Insights Section */}
          {document.analysis?.insights && document.analysis.insights.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
                Strategic Insights
              </h3>
              <div className="space-y-3">
                {document.analysis.insights.map((insight, idx) => {
                  const Icon = getInsightIcon(insight.type);
                  const importanceClass = getImportanceColor(insight.importance);
                  
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        insight.importance === 'high' 
                          ? 'border-red-200 bg-red-50' 
                          : insight.importance === 'medium'
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className={`w-5 h-5 mt-0.5 ${importanceClass.split(' ')[0]}`} />
                        <div className="flex-1">
                          <p className="text-gray-700">{insight.content}</p>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${importanceClass}`}>
                              {insight.importance} priority
                            </span>
                            <span className="text-xs text-gray-500">
                              {insight.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Document Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-medium text-gray-900 mb-3">Document Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium">{document.type}</p>
              </div>
              <div>
                <p className="text-gray-500">Size</p>
                <p className="font-medium">
                  {document.size ? `${(document.size / 1024).toFixed(2)} KB` : 'Unknown'}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Uploaded</p>
                <p className="font-medium">{new Date(document.created_at).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Status</p>
                <p className="font-medium capitalize">{document.status || 'Ready'}</p>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          {document.extractedData?.text && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-3">Content Preview</h3>
              <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {document.extractedData.text.substring(0, 1000)}
                  {document.extractedData.text.length > 1000 && '...'}
                </pre>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-500">
              This analysis helps AI advisors provide more relevant insights
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}