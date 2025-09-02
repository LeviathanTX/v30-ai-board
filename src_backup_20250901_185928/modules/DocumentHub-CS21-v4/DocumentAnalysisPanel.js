// src/modules/DocumentHub-CS21-v4/DocumentAnalysisPanel.js - Individual Document Analysis Panel
import React, { useState } from 'react';
import { 
  X, FileText, Brain, DollarSign, Scale, AlertTriangle, 
  CheckCircle, Users, Building, Calendar, Tag, Link2,
  TrendingUp, TrendingDown, Shield, Target, Eye, Copy,
  BarChart3, PieChart, LineChart, Activity
} from 'lucide-react';

export default function DocumentAnalysisPanel({ document, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!document || !document.analysis) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No analysis data available for this document</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Eye },
    { id: 'entities', name: 'Entities', icon: Users },
    { id: 'financial', name: 'Financial', icon: DollarSign },
    { id: 'risks', name: 'Risk Factors', icon: AlertTriangle },
    { id: 'compliance', name: 'Compliance', icon: Shield },
    { id: 'structure', name: 'Structure', icon: BarChart3 }
  ];

  const { analysis } = document;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Document Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <FileText className="w-5 h-5 text-blue-600 mr-2" />
          Document Summary
        </h3>
        <p className="text-gray-700 mb-4">{analysis.content?.text?.substring(0, 500)}...</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-50 rounded p-3">
            <div className="text-sm text-gray-600">Document Type</div>
            <div className="font-medium capitalize">{analysis.documentType?.replace(/_/g, ' ') || 'Unknown'}</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded p-3">
            <div className="text-sm text-gray-600">File Size</div>
            <div className="font-medium">{(document.size / 1024).toFixed(1)} KB</div>
          </div>
          <div className="bg-white bg-opacity-50 rounded p-3">
            <div className="text-sm text-gray-600">Processed</div>
            <div className="font-medium">{new Date(document.created_at).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      {analysis.insights && analysis.insights.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Brain className="w-5 h-5 text-purple-600 mr-2" />
            AI Insights
          </h3>
          <div className="space-y-3">
            {analysis.insights.slice(0, 5).map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-700">{insight.content || insight}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(analysis.entities || {}).flat().length}
              </div>
              <div className="text-sm text-blue-800">Entities Found</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {analysis.riskFactors?.length || 0}
              </div>
              <div className="text-sm text-orange-800">Risk Factors</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {analysis.compliance?.score || 'N/A'}%
              </div>
              <div className="text-sm text-green-800">Compliance</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {analysis.content?.tables?.length || 0}
              </div>
              <div className="text-sm text-purple-800">Tables</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEntitiesTab = () => (
    <div className="space-y-6">
      {analysis.entities && Object.keys(analysis.entities).length > 0 ? (
        Object.entries(analysis.entities).map(([entityType, entities]) => (
          entities.length > 0 && (
            <div key={entityType} className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 capitalize flex items-center">
                {entityType === 'people' && <Users className="w-5 h-5 text-blue-600 mr-2" />}
                {entityType === 'companies' && <Building className="w-5 h-5 text-green-600 mr-2" />}
                {entityType === 'financialTerms' && <DollarSign className="w-5 h-5 text-yellow-600 mr-2" />}
                {entityType === 'dates' && <Calendar className="w-5 h-5 text-purple-600 mr-2" />}
                {entityType === 'legalEntities' && <Scale className="w-5 h-5 text-red-600 mr-2" />}
                {!['people', 'companies', 'financialTerms', 'dates', 'legalEntities'].includes(entityType) && 
                  <Tag className="w-5 h-5 text-gray-600 mr-2" />
                }
                {entityType.replace(/([A-Z])/g, ' $1').toLowerCase()} ({entities.length})
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {entities.map((entity, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    entityType === 'people' ? 'bg-blue-50 border-blue-200' :
                    entityType === 'companies' ? 'bg-green-50 border-green-200' :
                    entityType === 'financialTerms' ? 'bg-yellow-50 border-yellow-200' :
                    entityType === 'dates' ? 'bg-purple-50 border-purple-200' :
                    entityType === 'legalEntities' ? 'bg-red-50 border-red-200' :
                    'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="font-medium text-sm">{entity.name || entity}</div>
                    {entity.confidence && (
                      <div className="text-xs text-gray-600 mt-1">
                        Confidence: {Math.round(entity.confidence * 100)}%
                      </div>
                    )}
                    {entity.context && (
                      <div className="text-xs text-gray-500 mt-1 italic truncate">
                        "{entity.context.substring(0, 50)}..."
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ))
      ) : (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No entities extracted</h3>
          <p className="text-gray-500">No people, companies, or other entities were found in this document</p>
        </div>
      )}
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-6">
      {analysis.financialData ? (
        <>
          {/* Financial Statements */}
          {analysis.financialData.statements && Object.keys(analysis.financialData.statements).length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
                Financial Statements
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.financialData.statements).map(([type, statement]) => (
                  statement && (
                    <div key={type} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3 capitalize">{type} Statement</h4>
                      <div className="text-sm text-gray-600 mb-2">
                        Periods: {statement.periods?.join(', ') || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Line Items: {statement.lineItems?.length || 0}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Financial Metrics */}
          {analysis.financialData.metrics && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Activity className="w-5 h-5 text-blue-600 mr-2" />
                Key Metrics
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analysis.financialData.metrics).map(([category, metrics]) => (
                  metrics.length > 0 && (
                    <div key={category} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-3 capitalize">{category}</h4>
                      <div className="space-y-2">
                        {metrics.slice(0, 3).map((metric, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium">{metric.name}</div>
                            <div className="text-gray-600">
                              Current: {Array.isArray(metric.values) ? metric.values[metric.values.length - 1] : metric.values}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Red Flags */}
          {analysis.financialData.redFlags && analysis.financialData.redFlags.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                Financial Red Flags
              </h3>
              
              <div className="space-y-3">
                {analysis.financialData.redFlags.map((flag, index) => (
                  <div key={index} className={`p-3 rounded-lg ${
                    flag.severity === 'high' ? 'bg-red-50 border border-red-200' :
                    flag.severity === 'medium' ? 'bg-orange-50 border border-orange-200' :
                    'bg-yellow-50 border border-yellow-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{flag.category}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        flag.severity === 'high' ? 'bg-red-200 text-red-800' :
                        flag.severity === 'medium' ? 'bg-orange-200 text-orange-800' :
                        'bg-yellow-200 text-yellow-800'
                      }`}>
                        {flag.severity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{flag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No financial data found</h3>
          <p className="text-gray-500">This document doesn't appear to contain financial information</p>
        </div>
      )}
    </div>
  );

  const renderRisksTab = () => (
    <div className="space-y-6">
      {analysis.riskFactors && analysis.riskFactors.length > 0 ? (
        <>
          {/* Risk Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-red-600">
                {analysis.riskFactors.filter(r => r.severity === 'high').length}
              </div>
              <div className="text-sm text-red-800">High Risk</div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-orange-600">
                {analysis.riskFactors.filter(r => r.severity === 'medium').length}
              </div>
              <div className="text-sm text-orange-800">Medium Risk</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {analysis.riskFactors.filter(r => r.severity === 'low').length}
              </div>
              <div className="text-sm text-yellow-800">Low Risk</div>
            </div>
          </div>

          {/* Risk Details */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-2" />
              Risk Factor Details
            </h3>
            
            <div className="space-y-4">
              {analysis.riskFactors.map((risk, index) => (
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
                        <span className="font-medium text-sm capitalize">{risk.category}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{risk.keyword}</p>
                      {risk.context && (
                        <div className="bg-white bg-opacity-50 rounded p-2 text-xs text-gray-600">
                          <strong>Context:</strong> "{risk.context}"
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-4 ${
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
          </div>
        </>
      ) : (
        <div className="text-center py-12">
          <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-green-600 mb-2">No significant risks identified</h3>
          <p className="text-gray-500">This document appears to have minimal risk factors</p>
        </div>
      )}
    </div>
  );

  const renderComplianceTab = () => (
    <div className="space-y-6">
      {analysis.compliance ? (
        <>
          {/* Compliance Score */}
          <div className="bg-white border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
                analysis.compliance.score >= 80 ? 'bg-green-100' :
                analysis.compliance.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              } mb-4`}>
                <span className={`text-2xl font-bold ${
                  analysis.compliance.score >= 80 ? 'text-green-600' :
                  analysis.compliance.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysis.compliance.score}%
                </span>
              </div>
              <h3 className="text-lg font-semibold">Compliance Score</h3>
              <p className="text-gray-600">
                {analysis.compliance.score >= 80 ? 'Excellent compliance posture' :
                 analysis.compliance.score >= 60 ? 'Good compliance with minor gaps' :
                 'Compliance improvements needed'}
              </p>
            </div>
          </div>

          {/* Regulations */}
          {analysis.compliance.regulations && analysis.compliance.regulations.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Scale className="w-5 h-5 text-blue-600 mr-2" />
                Identified Regulations ({analysis.compliance.regulations.length})
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {analysis.compliance.regulations.map((regulation, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    <Scale className="w-3 h-3 mr-1" />
                    {regulation}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Violations */}
          {analysis.compliance.violations && analysis.compliance.violations.length > 0 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                Potential Violations ({analysis.compliance.violations.length})
              </h3>
              
              <div className="space-y-3">
                {analysis.compliance.violations.map((violation, index) => (
                  <div key={index} className="border border-red-200 bg-red-50 rounded-lg p-3">
                    <div className="font-medium text-sm text-red-800 mb-1">{violation.type}</div>
                    {violation.context && (
                      <div className="text-sm text-red-700">
                        Context: "{violation.context}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance analysis available</h3>
          <p className="text-gray-500">Compliance analysis could not be performed on this document</p>
        </div>
      )}
    </div>
  );

  const renderStructureTab = () => (
    <div className="space-y-6">
      {/* Document Structure */}
      {analysis.structure && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-purple-600 mr-2" />
            Document Structure
          </h3>
          
          {analysis.structure.headings && analysis.structure.headings.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Headings ({analysis.structure.headings.length})</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {analysis.structure.headings.map((heading, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <span className="text-gray-500 text-xs">Line {heading.line}:</span>
                    <span className="ml-2">{heading.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tables */}
      {analysis.content?.tables && analysis.content.tables.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-green-600 mr-2" />
            Tables ({analysis.content.tables.length})
          </h3>
          
          <div className="space-y-4">
            {analysis.content.tables.map((table, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium mb-2">Table {index + 1}</h4>
                <div className="text-sm text-gray-600 mb-2">
                  Columns: {table.headers?.length || 0} | Rows: {table.data?.length || 0}
                </div>
                
                {table.headers && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          {table.headers.map((header, headerIndex) => (
                            <th key={headerIndex} className="px-2 py-1 text-left font-medium">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.data?.slice(0, 5).map((row, rowIndex) => (
                          <tr key={rowIndex} className="border-t">
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-2 py-1 text-gray-700">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                        {table.data?.length > 5 && (
                          <tr>
                            <td colSpan={table.headers.length} className="px-2 py-1 text-center text-gray-500 italic">
                              ... {table.data.length - 5} more rows
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {analysis.metadata && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Tag className="w-5 h-5 text-blue-600 mr-2" />
            Document Metadata
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">File Name</div>
              <div className="font-medium">{analysis.metadata.name}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">File Type</div>
              <div className="font-medium">{analysis.metadata.type}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">File Size</div>
              <div className="font-medium">{(analysis.metadata.size / 1024).toFixed(1)} KB</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-600">Uploaded</div>
              <div className="font-medium">{new Date(analysis.metadata.uploadedAt).toLocaleDateString()}</div>
            </div>
            
            {analysis.metadata.title && (
              <div className="space-y-2 md:col-span-2">
                <div className="text-sm text-gray-600">Document Title</div>
                <div className="font-medium">{analysis.metadata.title}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">{document.name}</h2>
              <p className="text-gray-600">Document Analysis Report</p>
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
                      ? 'border-blue-500 text-blue-600'
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
          {activeTab === 'entities' && renderEntitiesTab()}
          {activeTab === 'financial' && renderFinancialTab()}
          {activeTab === 'risks' && renderRisksTab()}
          {activeTab === 'compliance' && renderComplianceTab()}
          {activeTab === 'structure' && renderStructureTab()}
        </div>
      </div>
    </div>
  );
}