// DocumentHub-CS21-v4 Integration Module
// Advanced Document Processing and Due Diligence Analysis for V30 AI Board

import React from 'react';
import DocumentHub from './DocumentHub.js';

// Main DocumentHub component export for integration
export { default as DocumentHub } from './DocumentHub.js';
export { default as DocumentAnalysisPanel } from './DocumentAnalysisPanel.js';
export { default as DueDiligencePanel } from './DueDiligencePanel.js';

// Module configuration and metadata
export const MODULE_CONFIG = {
  name: 'DocumentHub-CS21-v4',
  version: '4.0.0',
  description: 'Advanced Document Processing and Due Diligence Analysis',
  capabilities: [
    'Deep PDF/PPTX/DOCX/XLSX analysis',
    'Cross-document analysis and correlation',
    'VC-grade due diligence framework',
    'Financial statement parsing and analysis',
    'Risk assessment and red flag identification',
    'Entity extraction and relationship mapping',
    'Compliance analysis and gap identification',
    'Investment readiness scoring',
    'Executive summary generation',
    'Industry benchmarking'
  ],
  supportedFileTypes: [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/msword',
    'application/vnd.ms-excel',
    'text/plain',
    'text/csv'
  ]
};

// Route configuration for main app integration
export const ROUTES = {
  main: '/document-hub',
  analysis: '/document-hub/analysis/:documentId',
  dueDiligence: '/document-hub/due-diligence',
  crossAnalysis: '/document-hub/cross-analysis'
};

// Navigation menu configuration
export const NAVIGATION_CONFIG = {
  title: 'Document Hub',
  icon: 'FileText',
  description: 'Advanced document analysis and due diligence',
  order: 3,
  permissions: ['advisor', 'admin'],
  subItems: [
    {
      title: 'Document Analysis',
      path: ROUTES.main,
      icon: 'Search',
      description: 'Upload and analyze documents'
    },
    {
      title: 'Due Diligence',
      path: ROUTES.dueDiligence,
      icon: 'Shield',
      description: 'Comprehensive investment analysis'
    },
    {
      title: 'Cross Analysis',
      path: ROUTES.crossAnalysis,
      icon: 'Network',
      description: 'Multi-document correlation analysis'
    }
  ]
};

// Integration hooks for the main application
export const INTEGRATION_HOOKS = {
  // Called when module is initialized
  onModuleInit: () => {
    console.log('DocumentHub-CS21-v4 module initialized');
  },

  // Called when module is unmounted
  onModuleDestroy: () => {
    console.log('DocumentHub-CS21-v4 module destroyed');
  },

  // Called when new documents are uploaded
  onDocumentsUploaded: (documents) => {
    console.log(`${documents.length} documents uploaded to DocumentHub`);
  },

  // Called when analysis is completed
  onAnalysisComplete: (analysisResults) => {
    console.log('Document analysis completed', analysisResults);
  }
};

// Default props for the DocumentHub component
export const DEFAULT_PROPS = {
  maxFileSize: 50 * 1024 * 1024, // 50MB
  maxFiles: 20,
  enableDueDiligence: true,
  enableCrossAnalysis: true,
  analysisTypes: ['comprehensive', 'financial', 'legal', 'operational', 'market'],
  theme: 'professional'
};

// Utility functions for integration
export const DocumentHubUtils = {
  // Check if file type is supported
  isSupportedFileType: (fileType) => {
    return MODULE_CONFIG.supportedFileTypes.includes(fileType);
  },

  // Get file type category
  getFileTypeCategory: (fileType) => {
    const categories = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'presentation',
      'application/vnd.ms-powerpoint': 'presentation',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
      'application/msword': 'document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'spreadsheet',
      'application/vnd.ms-excel': 'spreadsheet',
      'text/plain': 'text',
      'text/csv': 'data'
    };
    return categories[fileType] || 'unknown';
  },

  // Format analysis score for display
  formatScore: (score) => {
    return Math.round(score);
  },

  // Get score color class
  getScoreColorClass: (score) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 55) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  },

  // Get investment grade display info
  getInvestmentGradeInfo: (grade) => {
    const gradeInfo = {
      'A+': { color: 'text-green-700', bg: 'bg-green-100', description: 'Exceptional' },
      'A': { color: 'text-green-600', bg: 'bg-green-50', description: 'Strong' },
      'A-': { color: 'text-green-500', bg: 'bg-green-50', description: 'Good' },
      'B+': { color: 'text-blue-600', bg: 'bg-blue-50', description: 'Solid' },
      'B': { color: 'text-blue-500', bg: 'bg-blue-50', description: 'Reasonable' },
      'B-': { color: 'text-blue-400', bg: 'bg-blue-50', description: 'Moderate' },
      'C+': { color: 'text-yellow-600', bg: 'bg-yellow-50', description: 'Significant Concerns' },
      'C': { color: 'text-yellow-500', bg: 'bg-yellow-50', description: 'High Risk' },
      'D': { color: 'text-orange-600', bg: 'bg-orange-50', description: 'Poor' },
      'F': { color: 'text-red-600', bg: 'bg-red-50', description: 'Not Suitable' }
    };
    return gradeInfo[grade] || { color: 'text-gray-500', bg: 'bg-gray-50', description: 'Unknown' };
  }
};

// Error boundaries and error handling
export const ERROR_TYPES = {
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  UNSUPPORTED_FORMAT: 'UNSUPPORTED_FORMAT',
  PROCESSING_ERROR: 'PROCESSING_ERROR',
  ANALYSIS_ERROR: 'ANALYSIS_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

// Main component wrapper for easy integration
const DocumentHubWrapper = (props) => {
  return (
    <div className="document-hub-cs21-v4">
      <DocumentHub {...DEFAULT_PROPS} {...props} />
    </div>
  );
};

export default DocumentHubWrapper;

// Event emitter for module communication
export class DocumentHubEvents {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// Global event emitter instance
export const documentHubEvents = new DocumentHubEvents();

// Performance monitoring utilities
export const PerformanceMonitor = {
  startTimer: (operation) => {
    return {
      operation,
      startTime: Date.now(),
      end: function() {
        const duration = Date.now() - this.startTime;
        console.log(`DocumentHub ${operation} took ${duration}ms`);
        return duration;
      }
    };
  },

  logMemoryUsage: () => {
    if (window.performance && window.performance.memory) {
      console.log('DocumentHub Memory Usage:', {
        used: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB'
      });
    }
  }
};