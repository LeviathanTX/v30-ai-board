// src/services/documentIntelligence.js
import { supabase } from './supabase';

// Claude API configuration
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_API_KEY = process.env.REACT_APP_ANTHROPIC_API_KEY;

// Advanced Document Intelligence Service
export const documentIntelligence = {
  // Analyze a set of documents for deep insights
  async analyzeDocumentSet(documentIds, analysisType = 'financial') {
    try {
      logger.debug('Analyzing document set:', documentIds, analysisType);
      
      // For demo purposes without real documents loaded
      if (documentIds.length === 0) {
        return this.generateSampleAnalysis(analysisType);
      }

      // Get documents from state (in a real app, would fetch from database)
      const documents = documentIds.map(id => {
        // This would normally fetch from your state or database
        return { id, name: `Document ${id}`, content: 'Sample content' };
      });

      // Use Claude for advanced analysis
      if (CLAUDE_API_KEY) {
        return await this.analyzeWithClaude(documents, analysisType);
      }

      // Fallback to sample analysis
      return this.generateSampleAnalysis(analysisType);
    } catch (error) {
      logger.error('Document analysis error:', error);
      throw error;
    }
  },

  // Analyze documents with Claude AI
  async analyzeWithClaude(documents, analysisType) {
    try {
      const analysisPrompts = {
        financial: `Analyze these business documents for financial insights:
- Extract all revenue, expense, and profit metrics
- Identify financial trends and patterns
- Calculate growth rates and margins
- Find cost optimization opportunities
- Highlight any financial risks or concerns`,
        
        strategic: `Analyze these documents for strategic business insights:
- Identify market opportunities and threats
- Assess competitive positioning
- Evaluate growth strategies
- Find innovation opportunities
- Recommend strategic priorities`,
        
        operational: `Analyze these documents for operational insights:
- Identify efficiency improvements
- Find process optimization opportunities
- Assess resource utilization
- Highlight operational risks
- Recommend operational enhancements`,
        
        risk: `Analyze these documents for risk assessment:
- Identify business risks and vulnerabilities
- Assess compliance issues
- Evaluate mitigation strategies
- Prioritize risk factors
- Recommend risk management actions`,
        
        crossref: `Analyze relationships between these documents:
- Find common themes and patterns
- Identify contradictions or inconsistencies
- Map dependencies between documents
- Highlight synergies and connections
- Create a unified narrative`
      };

      const prompt = `${analysisPrompts[analysisType]}

Documents to analyze:
${documents.map((doc, i) => `${i + 1}. ${doc.name}: ${doc.content?.substring(0, 1000)}`).join('\n\n')}

Please provide your analysis in JSON format with:
- metrics: array of {label, value, trend (1 or -1), change (percentage)}
- insights: array of key insights
- crossReferences: array of {doc1, doc2, relationship} (if applicable)
- actionItems: array of {title, description}`;

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const claudeResponse = data.content[0].text;
      
      try {
        return JSON.parse(claudeResponse);
      } catch (parseError) {
        logger.warn('Could not parse Claude response, using fallback');
        return this.generateSampleAnalysis(analysisType);
      }
    } catch (error) {
      logger.error('Claude analysis error:', error);
      return this.generateSampleAnalysis(analysisType);
    }
  },

  // Generate sample analysis results
  generateSampleAnalysis(analysisType) {
    const analysisResults = {
      financial: {
        metrics: [
          { label: 'Total Revenue', value: '$4.2M', trend: 1, change: 18 },
          { label: 'Gross Margin', value: '42%', trend: 1, change: 3.5 },
          { label: 'Operating Expenses', value: '$2.8M', trend: -1, change: -2 },
          { label: 'EBITDA', value: '$1.4M', trend: 1, change: 22 }
        ],
        insights: [
          'Revenue growth accelerated in Q4, driven by new product launches and market expansion',
          'Operating margins improved by 350 basis points through cost optimization initiatives',
          'Cash flow remains strong with 45 days of operating expenses in reserve',
          'Customer acquisition costs decreased by 18% while lifetime value increased by 26%'
        ],
        crossReferences: [
          { doc1: 'Q4-Financial-Report.pdf', doc2: 'Sales-Forecast-2024.xlsx', relationship: 'Revenue projections align' },
          { doc1: 'Budget-2024.xlsx', doc2: 'Expense-Report-Q4.pdf', relationship: 'Cost savings identified' }
        ],
        actionItems: [
          {
            title: 'Accelerate Growth Initiatives',
            description: 'Based on strong Q4 performance, increase investment in proven growth channels'
          },
          {
            title: 'Optimize Cost Structure',
            description: 'Additional 10% cost reduction opportunity identified in operational analysis'
          }
        ]
      },
      strategic: {
        metrics: [
          { label: 'Market Share', value: '18%', trend: 1, change: 2.3 },
          { label: 'NPS Score', value: '72', trend: 1, change: 8 },
          { label: 'Product Adoption', value: '3.2K', trend: 1, change: 45 },
          { label: 'Churn Rate', value: '5.2%', trend: -1, change: -1.8 }
        ],
        insights: [
          'Market positioning strengthened through differentiated product offerings',
          'Customer satisfaction at all-time high, driving organic growth',
          'Competitive advantage established in key market segments',
          'Strategic partnerships yielding measurable returns'
        ],
        actionItems: [
          {
            title: 'Expand Market Presence',
            description: 'Target adjacent markets with proven product-market fit'
          },
          {
            title: 'Strengthen Partnerships',
            description: 'Deepen strategic alliances to accelerate growth'
          }
        ]
      },
      operational: {
        metrics: [
          { label: 'Efficiency Score', value: '87%', trend: 1, change: 12 },
          { label: 'Process Time', value: '2.3 days', trend: -1, change: -35 },
          { label: 'Quality Score', value: '94%', trend: 1, change: 3 },
          { label: 'Resource Utilization', value: '78%', trend: 1, change: 8 }
        ],
        insights: [
          'Process automation reduced cycle times by 35% across key workflows',
          'Quality improvements resulted in 22% reduction in rework',
          'Resource optimization freed up 15% capacity for growth initiatives',
          'Digital transformation initiatives showing measurable ROI'
        ],
        actionItems: [
          {
            title: 'Scale Automation',
            description: 'Expand successful automation to remaining manual processes'
          },
          {
            title: 'Enhance Quality Systems',
            description: 'Implement predictive quality controls'
          }
        ]
      },
      risk: {
        metrics: [
          { label: 'Risk Score', value: 'Medium', trend: -1, change: -15 },
          { label: 'Compliance Rate', value: '98%', trend: 1, change: 2 },
          { label: 'Incidents', value: '3', trend: -1, change: -40 },
          { label: 'Mitigation Coverage', value: '92%', trend: 1, change: 5 }
        ],
        insights: [
          'Overall risk profile improved through proactive mitigation strategies',
          'Compliance frameworks strengthened across all business units',
          'Cybersecurity posture enhanced with new protective measures',
          'Supply chain risks identified and mitigation plans in place'
        ],
        actionItems: [
          {
            title: 'Strengthen Cyber Defenses',
            description: 'Implement advanced threat detection systems'
          },
          {
            title: 'Diversify Supply Chain',
            description: 'Reduce single-source dependencies'
          }
        ]
      },
      crossref: {
        insights: [
          'Financial performance metrics correlate strongly with customer satisfaction scores',
          'Operational efficiency gains directly impact profit margins',
          'Risk mitigation investments show positive ROI within 6 months',
          'Strategic initiatives align with financial projections'
        ],
        crossReferences: [
          { doc1: 'Financial-Report.pdf', doc2: 'Customer-Survey.xlsx', relationship: 'Revenue correlates with NPS' },
          { doc1: 'Risk-Assessment.pdf', doc2: 'Budget-Plan.xlsx', relationship: 'Risk investments justified' },
          { doc1: 'Operations-Review.ppt', doc2: 'P&L-Statement.pdf', relationship: 'Efficiency drives margins' },
          { doc1: 'Strategy-Deck.ppt', doc2: 'Market-Analysis.pdf', relationship: 'Strategy aligns with market' }
        ],
        actionItems: [
          {
            title: 'Integrate Planning Systems',
            description: 'Align strategic, financial, and operational planning'
          },
          {
            title: 'Create Unified Dashboard',
            description: 'Consolidate insights across all business dimensions'
          }
        ]
      }
    };

    return analysisResults[analysisType] || analysisResults.financial;
  },

  // Extract financial data from documents
  async extractFinancialData(document) {
    try {
      // This would use Claude to extract financial data
      return {
        metrics: [
          { label: 'Revenue', value: '$2.3M', trend: 1, change: 15 },
          { label: 'Expenses', value: '$1.8M', trend: -1, change: -5 },
          { label: 'Profit Margin', value: '18%', trend: 1, change: 3 },
          { label: 'Cash Flow', value: '$450K', trend: 1, change: 22 }
        ],
        tables: [
          {
            title: 'Quarterly Performance',
            headers: ['Quarter', 'Revenue', 'Expenses', 'Profit'],
            rows: [
              ['Q1 2024', '$2.1M', '$1.7M', '$400K'],
              ['Q2 2024', '$2.2M', '$1.8M', '$400K'],
              ['Q3 2024', '$2.3M', '$1.8M', '$500K'],
              ['Q4 2024', '$2.3M', '$1.8M', '$500K']
            ]
          }
        ],
        charts: {
          revenue_trend: {
            type: 'line',
            data: [2.1, 2.2, 2.3, 2.3],
            labels: ['Q1', 'Q2', 'Q3', 'Q4']
          },
          expense_breakdown: {
            type: 'pie',
            data: [35, 25, 20, 15, 5],
            labels: ['Salaries', 'Operations', 'Marketing', 'R&D', 'Other']
          }
        }
      };
    } catch (error) {
      logger.error('Financial extraction error:', error);
      return null;
    }
  },

  // Find cross-references between documents
  async findCrossReferences(documents) {
    try {
      const references = [];
      
      // In a real implementation, this would use Claude to find semantic relationships
      for (let i = 0; i < documents.length; i++) {
        for (let j = i + 1; j < documents.length; j++) {
          const doc1 = documents[i];
          const doc2 = documents[j];
          
          // Check for common topics
          const commonTopics = doc1.analysis?.topics?.filter(topic => 
            doc2.analysis?.topics?.includes(topic)
          );
          
          if (commonTopics?.length > 0) {
            references.push({
              doc1: doc1.name,
              doc2: doc2.name,
              relationship: `Common topics: ${commonTopics.join(', ')}`
            });
          }
          
          // Check for financial relationships
          if (doc1.analysis?.financialData && doc2.analysis?.financialData) {
            references.push({
              doc1: doc1.name,
              doc2: doc2.name,
              relationship: 'Financial data correlation'
            });
          }
        }
      }
      
      return references;
    } catch (error) {
      logger.error('Cross-reference error:', error);
      return [];
    }
  },

  // Generate document insights using AI
  async generateInsights(document) {
    try {
      if (!CLAUDE_API_KEY) {
        return this.generateBasicInsights(document);
      }

      const prompt = `Analyze this document and provide 3-5 actionable business insights:
Document: ${document.name}
Content: ${document.content?.substring(0, 3000)}

Format each insight as a clear, actionable statement.`;

      const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 500,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      const data = await response.json();
      const insights = data.content[0].text.split('\n').filter(line => line.trim());
      
      return insights.slice(0, 5);
    } catch (error) {
      logger.error('Insight generation error:', error);
      return this.generateBasicInsights(document);
    }
  },

  // Generate basic insights without AI
  generateBasicInsights(document) {
    const insights = [];
    
    if (document.content?.includes('revenue')) {
      insights.push('Revenue trends indicate strong growth momentum with potential for acceleration');
    }
    
    if (document.content?.includes('customer')) {
      insights.push('Customer metrics show improving satisfaction and retention rates');
    }
    
    if (document.content?.includes('market')) {
      insights.push('Market analysis reveals untapped opportunities in adjacent segments');
    }
    
    if (document.content?.includes('risk')) {
      insights.push('Risk factors are well-managed with appropriate mitigation strategies in place');
    }
    
    if (insights.length === 0) {
      insights.push('Document contains valuable business information requiring deeper analysis');
    }
    
    return insights;
  },

  // Extract structured data from documents
  async extractStructuredData(document) {
    try {
      const structuredData = {
        entities: [],
        dates: [],
        numbers: [],
        tables: []
      };
      
      if (!document.text) return structuredData;

      // Extract entities (people, companies, places)
      const entityPatterns = [
        { pattern: /(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)/g, type: 'person' },
        { pattern: /([A-Z][a-z]+\s+(?:Inc|LLC|Corp|Company|Ltd|Limited))/g, type: 'company' },
        { pattern: /\$[\d,]+(?:\.\d{2})?M?B?K?/g, type: 'money' }
      ];
      
      entityPatterns.forEach(({ pattern, type }) => {
        const matches = document.text.match(pattern) || [];
        matches.forEach(match => {
          if (!structuredData.entities.find(e => e.name === match)) {
            structuredData.entities.push({ name: match, type });
          }
        });
      });
      
      // Extract dates
      const datePattern = /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b|\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g;
      structuredData.dates = document.text.match(datePattern) || [];
      
      // Extract numbers and percentages
      const numberPattern = /\b\d+(?:,\d{3})*(?:\.\d+)?%?\b/g;
      const numbers = document.text.match(numberPattern) || [];
      structuredData.numbers = numbers.filter(n => n.length > 2); // Filter out small numbers
      
      // If we have financial data from spreadsheets, include it
      if (document.extractedData?.financialData) {
        structuredData.financialData = document.extractedData.financialData;
      }
      
      return structuredData;
    } catch (error) {
      logger.error('Data extraction error:', error);
      return null;
    }
  },

  // Compare documents for similarities
  async compareDocuments(doc1, doc2) {
    try {
      const comparison = {
        similarity: 0,
        commonTopics: [],
        differences: [],
        recommendations: []
      };
      
      // Calculate similarity based on content overlap
      if (doc1.analysis?.topics && doc2.analysis?.topics) {
        const topics1 = new Set(doc1.analysis.topics);
        const topics2 = new Set(doc2.analysis.topics);
        const common = [...topics1].filter(t => topics2.has(t));
        
        comparison.commonTopics = common;
        comparison.similarity = (common.length / Math.max(topics1.size, topics2.size)) * 100;
      }
      
      // Identify key differences
      if (doc1.analysis?.financialData && doc2.analysis?.financialData) {
        comparison.differences.push('Different financial periods or metrics');
      }
      
      // Generate recommendations
      if (comparison.similarity > 70) {
        comparison.recommendations.push('Consider consolidating these documents');
      } else if (comparison.similarity > 30) {
        comparison.recommendations.push('These documents complement each other well');
      }
      
      return comparison;
    } catch (error) {
      logger.error('Document comparison error:', error);
      return null;
    }
  }
};

export default documentIntelligence;