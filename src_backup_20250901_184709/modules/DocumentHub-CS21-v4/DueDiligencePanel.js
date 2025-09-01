// src/modules/DocumentHub-CS21-v4/DueDiligencePanel.js - VC Due Diligence Analysis Panel
import React, { useState } from 'react';
import { 
  X, Award, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  DollarSign, Scale, Brain, BarChart3, Target, Users2, Building,
  FileText, Link2, Star, Zap, Shield, Flag, Calendar, ExternalLink
} from 'lucide-react';

export default function DueDiligencePanel({ results, documents, crossReferences, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!results) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p>Analyzing documents for due diligence...</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Award },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'legal', name: 'Legal & Compliance', icon: Scale },
    { id: 'operational', name: 'Operations', icon: Building },
    { id: 'market', name: 'Market', icon: Target },
    { id: 'risks', name: 'Risk Analysis', icon: AlertTriangle },
    { id: 'cross-refs', name: 'Cross References', icon: Link2 }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(results.overallScore)} mb-4`}>
            <span className={`text-3xl font-bold ${getScoreColor(results.overallScore)}`}>
              {results.overallScore}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Due Diligence Score</h2>
          <p className="text-gray-600">
            {results.overallScore >= 80 ? 'Excellent investment opportunity' :
             results.overallScore >= 60 ? 'Good opportunity with minor concerns' :
             'Significant concerns requiring attention'}
          </p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(results.categoryScores).map(([category, score]) => (
          <div key={category} className="bg-white border rounded-lg p-4">
            <div className="flex items-center mb-2">
              {category === 'financial' && <DollarSign className="w-5 h-5 text-green-600 mr-2" />}
              {category === 'legal' && <Scale className="w-5 h-5 text-blue-600 mr-2" />}
              {category === 'operational' && <Building className="w-5 h-5 text-purple-600 mr-2" />}
              {category === 'market' && <Target className="w-5 h-5 text-orange-600 mr-2" />}
              <h3 className="font-semibold capitalize">{category}</h3>
            </div>
            <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  score >= 80 ? 'bg-green-500' : 
                  score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Findings */}
      {results.findings && results.findings.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Key Findings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.findings.map((finding, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700">{finding}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {results.redFlags && results.redFlags.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            Red Flags ({results.redFlags.length})
          </h3>
          <div className="space-y-3">
            {results.redFlags.map((flag, index) => (
              <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                flag.severity === 'high' ? 'bg-red-50' :
                flag.severity === 'medium' ? 'bg-orange-50' : 'bg-yellow-50'
              }`}>
                <AlertTriangle className={`w-4 h-4 mt-1 flex-shrink-0 ${
                  flag.severity === 'high' ? 'text-red-600' :
                  flag.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{flag.title || flag.description}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      flag.severity === 'high' ? 'bg-red-200 text-red-800' :
                      flag.severity === 'medium' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {flag.severity}
                    </span>
                  </div>
                  {flag.description && flag.title && (
                    <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {results.recommendations && results.recommendations.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Zap className="w-5 h-5 text-blue-600 mr-2" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {results.recommendations.map((rec, index) => (
              <div key={index} className={`flex items-start space-x-3 p-3 rounded-lg ${
                rec.priority === 'high' ? 'bg-red-50' :
                rec.priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
              }`}>
                <Flag className={`w-4 h-4 mt-1 flex-shrink-0 ${
                  rec.priority === 'high' ? 'text-red-600' :
                  rec.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{rec.title}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      rec.priority === 'high' ? 'bg-red-200 text-red-800' :
                      rec.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-blue-200 text-blue-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCrossReferencesTab = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Link2 className="w-5 h-5 text-purple-600 mr-2" />
          Document Cross-References ({crossReferences.length})
        </h3>
        
        {crossReferences.length === 0 ? (
          <div className="text-center py-8">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No cross-references found between documents</p>
          </div>
        ) : (
          <div className="space-y-4">
            {crossReferences.map((ref, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-sm">Document Relationship</h4>
                  <span className="text-xs text-gray-500">Reference #{index + 1}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">{ref.document1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium">{ref.document2}</span>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm text-gray-700">{ref.relationship}</p>
                  
                  {ref.commonEntities && ref.commonEntities.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Common Entities:</p>
                      <div className="flex flex-wrap gap-1">
                        {ref.commonEntities.map((entity, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {entity.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Missing Documents */}
      {results.missingDocuments && results.missingDocuments.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 text-orange-600 mr-2" />
            Missing Critical Documents ({results.missingDocuments.length})
          </h3>
          
          <div className="space-y-3">
            {results.missingDocuments.map((missing, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="font-medium text-sm capitalize">{missing.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-600">{missing.reason}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  missing.importance === 'high' ? 'bg-red-200 text-red-800' :
                  missing.importance === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-blue-200 text-blue-800'
                }`}>
                  {missing.importance}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderRisksTab = () => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Shield className="w-5 h-5 text-red-600 mr-2" />
          Risk Analysis Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{results.redFlags?.filter(r => r.severity === 'high').length || 0}</div>
            <div className="text-sm text-red-800">High Risk</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{results.redFlags?.filter(r => r.severity === 'medium').length || 0}</div>
            <div className="text-sm text-orange-800">Medium Risk</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{results.redFlags?.filter(r => r.severity === 'low').length || 0}</div>
            <div className="text-sm text-yellow-800">Low Risk</div>
          </div>
        </div>

        {/* Risk Categories */}
        <div className="space-y-4">
          <h4 className="font-medium">Risk Categories</h4>
          {results.redFlags && results.redFlags.length > 0 ? (
            <div className="space-y-3">
              {results.redFlags.map((risk, index) => (
                <div key={index} className={`border rounded-lg p-4 ${
                  risk.severity === 'high' ? 'border-red-200 bg-red-50' :
                  risk.severity === 'medium' ? 'border-orange-200 bg-orange-50' :
                  'border-yellow-200 bg-yellow-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <AlertTriangle className={`w-4 h-4 ${
                          risk.severity === 'high' ? 'text-red-600' :
                          risk.severity === 'medium' ? 'text-orange-600' :
                          'text-yellow-600'
                        }`} />
                        <span className="font-medium text-sm">{risk.category || risk.title}</span>
                      </div>
                      <p className="text-sm text-gray-700">{risk.description}</p>
                      {risk.context && (
                        <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs text-gray-600">
                          Context: {risk.context}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      risk.severity === 'high' ? 'bg-red-200 text-red-800' :
                      risk.severity === 'medium' ? 'bg-orange-200 text-orange-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {risk.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-green-300 mx-auto mb-4" />
              <p className="text-green-600 font-medium">No significant risks identified</p>
              <p className="text-gray-500 text-sm">All analyzed documents appear to be low risk</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderPlaceholderTab = (tabName) => (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 capitalize">{tabName} Analysis</h3>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">{tabName.charAt(0).toUpperCase() + tabName.slice(1)} analysis coming soon</p>
          <p className="text-sm text-gray-400">Advanced category-specific insights will be available in future updates</p>
        </div>
        
        {/* Show category score if available */}
        {results.categoryScores[tabName] && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Current {tabName.charAt(0).toUpperCase() + tabName.slice(1)} Score</span>
              <span className={`text-2xl font-bold ${getScoreColor(results.categoryScores[tabName])}`}>
                {results.categoryScores[tabName]}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full ${
                  results.categoryScores[tabName] >= 80 ? 'bg-green-500' : 
                  results.categoryScores[tabName] >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${results.categoryScores[tabName]}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Award className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Due Diligence Analysis</h2>
              <p className="text-gray-600">Comprehensive investment evaluation report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'cross-refs' && renderCrossReferencesTab()}
          {activeTab === 'risks' && renderRisksTab()}
          {(['financial', 'legal', 'operational', 'market'].includes(activeTab)) && renderPlaceholderTab(activeTab)}
        </div>
      </div>
    </div>
  );
}