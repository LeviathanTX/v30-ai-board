// src/services/documentIntelligenceV2.js - Advanced Document Intelligence for VC Due Diligence
import { createClient } from '@supabase/supabase-js';
import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import * as XLSX from 'xlsx';
import aiService from './aiService';

// Configure PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

class AdvancedDocumentIntelligence {
  constructor() {
    this.documentTypes = {
      // Financial Documents
      FINANCIAL_STATEMENT: 'financial_statement',
      INCOME_STATEMENT: 'income_statement',
      BALANCE_SHEET: 'balance_sheet',
      CASH_FLOW: 'cash_flow',
      BUDGET_PROJECTION: 'budget_projection',
      FINANCIAL_MODEL: 'financial_model',
      AUDIT_REPORT: 'audit_report',
      TAX_RETURN: 'tax_return',
      
      // Legal Documents
      CONTRACTS: 'contracts',
      TERM_SHEET: 'term_sheet',
      SHAREHOLDER_AGREEMENT: 'shareholder_agreement',
      EMPLOYMENT_AGREEMENTS: 'employment_agreements',
      IP_DOCUMENTS: 'ip_documents',
      COMPLIANCE_DOCS: 'compliance_docs',
      REGULATORY_FILINGS: 'regulatory_filings',
      
      // Business Documents
      BUSINESS_PLAN: 'business_plan',
      PITCH_DECK: 'pitch_deck',
      MARKET_RESEARCH: 'market_research',
      CUSTOMER_DATA: 'customer_data',
      PRODUCT_SPECS: 'product_specs',
      OPERATIONAL_METRICS: 'operational_metrics',
      
      // HR/People Documents
      ORG_CHART: 'org_chart',
      COMPENSATION_PLANS: 'compensation_plans',
      EMPLOYEE_HANDBOOK: 'employee_handbook',
      
      // Technical Documents
      TECHNICAL_SPECS: 'technical_specs',
      ARCHITECTURE_DOCS: 'architecture_docs',
      SECURITY_AUDIT: 'security_audit'
    };

    this.dueDiligenceFramework = {
      FINANCIAL: {
        name: 'Financial Analysis',
        weight: 0.35,
        categories: {
          revenue_quality: { weight: 0.25, criteria: ['recurring_revenue', 'customer_concentration', 'revenue_growth', 'pricing_power'] },
          cost_structure: { weight: 0.20, criteria: ['gross_margins', 'unit_costs', 'operational_leverage', 'cost_control'] },
          cash_flow: { weight: 0.25, criteria: ['cash_generation', 'working_capital', 'capex_requirements', 'burn_rate'] },
          unit_economics: { weight: 0.20, criteria: ['ltv_cac_ratio', 'payback_period', 'contribution_margin', 'cohort_analysis'] },
          financial_controls: { weight: 0.10, criteria: ['accounting_quality', 'financial_reporting', 'audit_history', 'governance'] }
        }
      },
      LEGAL: {
        name: 'Legal & Compliance',
        weight: 0.25,
        categories: {
          corporate_structure: { weight: 0.25, criteria: ['entity_structure', 'capitalization', 'board_composition', 'voting_rights'] },
          ip_protection: { weight: 0.30, criteria: ['patent_portfolio', 'trademark_protection', 'trade_secrets', 'ip_strategy'] },
          regulatory_compliance: { weight: 0.25, criteria: ['industry_regulations', 'data_privacy', 'licensing', 'regulatory_risk'] },
          litigation_risk: { weight: 0.15, criteria: ['active_litigation', 'legal_history', 'regulatory_actions', 'dispute_resolution'] },
          contract_terms: { weight: 0.05, criteria: ['key_agreements', 'vendor_contracts', 'employment_terms', 'liability_exposure'] }
        }
      },
      OPERATIONAL: {
        name: 'Operational Excellence',
        weight: 0.20,
        categories: {
          team_strength: { weight: 0.35, criteria: ['leadership_quality', 'key_personnel', 'retention_rates', 'organizational_depth'] },
          product_quality: { weight: 0.25, criteria: ['product_differentiation', 'development_capability', 'quality_metrics', 'innovation_pipeline'] },
          operational_efficiency: { weight: 0.20, criteria: ['process_optimization', 'automation', 'productivity_metrics', 'operational_metrics'] },
          scalability: { weight: 0.15, criteria: ['infrastructure_scalability', 'operational_scalability', 'technology_platform', 'growth_readiness'] },
          customer_satisfaction: { weight: 0.05, criteria: ['nps_scores', 'retention_metrics', 'support_quality', 'customer_feedback'] }
        }
      },
      MARKET: {
        name: 'Market Opportunity',
        weight: 0.20,
        categories: {
          market_size: { weight: 0.30, criteria: ['tam_sam_som', 'market_growth', 'addressable_segments', 'market_maturity'] },
          competitive_position: { weight: 0.25, criteria: ['market_share', 'competitive_advantages', 'barriers_to_entry', 'competitive_response'] },
          growth_potential: { weight: 0.20, criteria: ['growth_drivers', 'expansion_opportunities', 'new_markets', 'product_extensions'] },
          market_dynamics: { weight: 0.15, criteria: ['industry_trends', 'disruption_risk', 'regulatory_changes', 'technology_shifts'] },
          customer_validation: { weight: 0.10, criteria: ['customer_traction', 'product_market_fit', 'customer_testimonials', 'pilot_programs'] }
        }
      }
    };

    this.scoringCriteria = {
      EXCELLENT: { min: 85, description: 'Outstanding performance, minimal risk' },
      GOOD: { min: 70, description: 'Strong performance, manageable risk' },
      ACCEPTABLE: { min: 55, description: 'Adequate performance, moderate risk' },
      CONCERNING: { min: 40, description: 'Weak performance, high risk' },
      POOR: { min: 0, description: 'Poor performance, very high risk' }
    };

    this.riskWeights = {
      CRITICAL: 1.0,   // Immediate deal breakers
      HIGH: 0.8,       // Significant concerns requiring mitigation
      MEDIUM: 0.5,     // Standard business risks
      LOW: 0.2         // Minor considerations
    };
  }

  // Deep document processing with structure preservation
  async processDocumentDeep(file, documentType = null) {
    try {
      const result = {
        metadata: await this.extractMetadata(file),
        structure: null,
        content: {
          text: '',
          tables: [],
          charts: [],
          images: []
        },
        entities: [],
        financialData: null,
        riskFactors: [],
        compliance: null,
        documentType: documentType || await this.classifyDocument(file)
      };

      // Process based on file type
      switch (file.type) {
        case 'application/pdf':
          result.structure = await this.processPDFDeep(file);
          break;
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          result.structure = await this.processDOCXDeep(file);
          break;
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          result.structure = await this.processXLSXDeep(file);
          break;
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          result.structure = await this.processPPTXDeep(file);
          break;
        default:
          throw new Error(`Unsupported file type: ${file.type}`);
      }

      // Extract structured content
      result.content.text = result.structure.text;
      result.content.tables = result.structure.tables || [];

      // Entity extraction
      result.entities = await this.extractEntitiesAdvanced(result.content.text);

      // Financial analysis for financial documents
      if (this.isFinancialDocument(result.documentType)) {
        result.financialData = await this.extractFinancialDataAdvanced(result);
      }

      // Risk factor identification
      result.riskFactors = await this.identifyRiskFactors(result);

      // Compliance analysis
      result.compliance = await this.analyzeCompliance(result);

      return result;
    } catch (error) {
      console.error('Deep document processing error:', error);
      throw error;
    }
  }

  // Advanced PDF processing with structure preservation
  async processPDFDeep(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      const result = {
        text: '',
        pages: [],
        tables: [],
        images: [],
        metadata: {}
      };

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        
        // Extract text with positioning
        const textContent = await page.getTextContent();
        const viewport = page.getViewport({ scale: 1 });
        
        const pageData = {
          pageNumber: pageNum,
          text: '',
          textItems: [],
          tables: [],
          images: []
        };

        // Process text items with positioning
        textContent.items.forEach(item => {
          const text = item.str.trim();
          if (text) {
            pageData.textItems.push({
              text: text,
              x: item.transform[4],
              y: viewport.height - item.transform[5],
              width: item.width,
              height: item.height,
              fontSize: item.height,
              fontName: item.fontName
            });
            pageData.text += text + ' ';
          }
        });

        // Detect tables using positioning heuristics
        pageData.tables = this.detectTablesFromTextItems(pageData.textItems);
        
        result.pages.push(pageData);
        result.text += pageData.text + '\n\n';
      }

      // Extract overall tables
      result.tables = this.consolidateTables(result.pages.map(p => p.tables).flat());

      return result;
    } catch (error) {
      console.error('Advanced PDF processing error:', error);
      throw error;
    }
  }

  // Advanced XLSX processing with financial model detection
  async processXLSXDeep(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellStyles: true, cellDates: true });
      
      const result = {
        text: '',
        sheets: [],
        tables: [],
        financialModels: [],
        formulas: []
      };

      workbook.SheetNames.forEach(sheetName => {
        const sheet = workbook.Sheets[sheetName];
        const sheetData = {
          name: sheetName,
          data: XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }),
          range: sheet['!ref'],
          tables: [],
          formulas: [],
          charts: []
        };

        // Extract formulas
        Object.keys(sheet).forEach(cellRef => {
          if (cellRef.startsWith('!')) return;
          const cell = sheet[cellRef];
          if (cell.f) {
            sheetData.formulas.push({
              cell: cellRef,
              formula: cell.f,
              value: cell.v
            });
          }
        });

        // Detect financial models
        const isFinancialModel = this.detectFinancialModel(sheetData);
        if (isFinancialModel) {
          result.financialModels.push({
            sheet: sheetName,
            model: this.parseFinancialModel(sheetData)
          });
        }

        // Convert to text for analysis
        const csv = XLSX.utils.sheet_to_csv(sheet);
        sheetData.text = csv;
        result.text += `Sheet: ${sheetName}\n${csv}\n\n`;

        result.sheets.push(sheetData);
        result.formulas.push(...sheetData.formulas);
      });

      return result;
    } catch (error) {
      console.error('Advanced XLSX processing error:', error);
      throw error;
    }
  }

  // Advanced entity extraction
  async extractEntitiesAdvanced(text) {
    const entities = {
      people: [],
      companies: [],
      financialTerms: [],
      dates: [],
      locations: [],
      currencies: [],
      legalEntities: [],
      products: []
    };

    try {
      // Enhanced regex patterns for entity extraction
      const patterns = {
        people: [
          /(?:Mr\.|Mrs\.|Ms\.|Dr\.|CEO|CFO|CTO|President|Director)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
          /([A-Z][a-z]+\s+[A-Z][a-z]+)(?:\s*,\s*(?:CEO|CFO|CTO|President|Director|VP|Chairman))/g
        ],
        companies: [
          /([A-Z][A-Za-z\s&]+(?:Inc\.|LLC|Corp\.|Corporation|Company|Ltd\.|Limited|LP|LLP))/g,
          /([A-Z][A-Za-z\s&]+)(?:\s*\((?:NASDAQ|NYSE|private company)\))/g
        ],
        financialTerms: [
          /\$[\d,]+(?:\.\d{2})?(?:[KMB])?/g,
          /(?:revenue|sales|income|profit|loss|EBITDA|margin|ROI|IRR|NPV|valuation|funding|investment)\s*:?\s*\$?[\d,]+(?:\.\d{2})?[KMB%]?/gi,
          /(?:\d+(?:\.\d+)?%)\s*(?:growth|margin|return|yield|rate)/gi
        ],
        dates: [
          /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}/g,
          /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g,
          /Q[1-4]\s+\d{4}/g,
          /FY\s*\d{4}/g
        ],
        legalEntities: [
          /(?:Delaware|Nevada|California|New York)\s+(?:Corporation|LLC|LP)/g,
          /Series\s+[A-Z](?:\s+Preferred)?/g,
          /(?:Common|Preferred)\s+Stock/g
        ]
      };

      // Extract entities using patterns
      Object.keys(patterns).forEach(entityType => {
        patterns[entityType].forEach(pattern => {
          const matches = text.match(pattern) || [];
          matches.forEach(match => {
            const cleanMatch = match.trim();
            if (!entities[entityType].find(e => e.name === cleanMatch)) {
              entities[entityType].push({
                name: cleanMatch,
                confidence: 0.8,
                context: this.extractContext(text, cleanMatch)
              });
            }
          });
        });
      });

      return entities;
    } catch (error) {
      console.error('Entity extraction error:', error);
      return entities;
    }
  }

  // Advanced financial data extraction
  async extractFinancialDataAdvanced(documentData) {
    try {
      const financialData = {
        statements: {
          income: null,
          balance: null,
          cashFlow: null
        },
        metrics: {
          profitability: [],
          liquidity: [],
          efficiency: [],
          leverage: []
        },
        projections: [],
        redFlags: [],
        unitEconomics: null
      };

      // Extract financial statements from tables
      if (documentData.content.tables) {
        for (const table of documentData.content.tables) {
          const statementType = this.identifyFinancialStatement(table);
          if (statementType) {
            financialData.statements[statementType] = this.parseFinancialStatement(table, statementType);
          }
        }
      }

      // Calculate key financial metrics
      financialData.metrics = this.calculateFinancialMetrics(financialData.statements);

      // Identify red flags
      financialData.redFlags = this.identifyFinancialRedFlags(financialData);

      return financialData;
    } catch (error) {
      console.error('Financial data extraction error:', error);
      return null;
    }
  }

  // Cross-document analysis for due diligence
  async performDueDiligenceAnalysis(documents, analysisType = 'comprehensive') {
    try {
      const analysis = {
        overallScore: 0,
        categoryScores: {},
        categoryDetails: {},
        findings: [],
        redFlags: [],
        opportunities: [],
        recommendations: [],
        crossReferences: [],
        missingDocuments: [],
        riskAssessment: {
          overallRiskLevel: 'MEDIUM',
          criticalRisks: [],
          highRisks: [],
          mediumRisks: [],
          lowRisks: []
        },
        investmentReadiness: {
          score: 0,
          grade: 'C',
          readinessFactors: []
        },
        executiveSummary: ''
      };

      // Categorize documents by type
      const categorizedDocs = this.categorizeDocuments(documents);

      // Analyze each due diligence category with detailed scoring
      for (const [category, config] of Object.entries(this.dueDiligenceFramework)) {
        const categoryAnalysis = await this.analyzeDueDiligenceCategoryAdvanced(
          category.toLowerCase(),
          categorizedDocs,
          config,
          analysisType
        );
        
        analysis.categoryScores[category.toLowerCase()] = categoryAnalysis.score;
        analysis.categoryDetails[category.toLowerCase()] = categoryAnalysis;
        analysis.findings.push(...categoryAnalysis.findings);
        analysis.redFlags.push(...categoryAnalysis.redFlags);
        analysis.opportunities.push(...categoryAnalysis.opportunities);
      }

      // Calculate overall score using weighted framework
      analysis.overallScore = this.calculateOverallDDScore(analysis.categoryScores);
      
      // Perform comprehensive risk assessment
      analysis.riskAssessment = this.performRiskAssessment(analysis);
      
      // Calculate investment readiness
      analysis.investmentReadiness = this.calculateInvestmentReadiness(analysis);

      // Find cross-references and inconsistencies
      analysis.crossReferences = await this.findDocumentCrossReferences(documents);

      // Identify missing critical documents
      analysis.missingDocuments = this.identifyMissingDocuments(categorizedDocs);

      // Generate sophisticated recommendations
      analysis.recommendations = this.generateAdvancedDDRecommendations(analysis);
      
      // Generate executive summary
      analysis.executiveSummary = this.generateExecutiveSummary(analysis);
      
      // Add benchmarking data
      analysis.benchmarking = this.performIndustryBenchmarking(analysis);

      return analysis;
    } catch (error) {
      console.error('Due diligence analysis error:', error);
      throw error;
    }
  }

  // Compliance analysis
  async analyzeCompliance(documentData) {
    try {
      const compliance = {
        regulations: [],
        violations: [],
        requirements: [],
        score: 0
      };

      const text = documentData.content.text.toLowerCase();

      // Check for regulatory compliance indicators
      const regulations = [
        { name: 'SOX', keywords: ['sarbanes-oxley', 'sox', 'internal controls', 'financial reporting controls'] },
        { name: 'GDPR', keywords: ['gdpr', 'data protection', 'privacy policy', 'data processing'] },
        { name: 'SEC', keywords: ['sec filing', 'securities', 'disclosure', 'registration'] },
        { name: 'Employment Law', keywords: ['equal employment', 'discrimination', 'harassment', 'wage compliance'] }
      ];

      regulations.forEach(reg => {
        const found = reg.keywords.some(keyword => text.includes(keyword));
        if (found) {
          compliance.regulations.push(reg.name);
        }
      });

      // Check for potential violations or red flags
      const violationFlags = [
        'investigation', 'violation', 'non-compliance', 'penalty', 'fine',
        'lawsuit', 'litigation', 'breach', 'unauthorized', 'illegal'
      ];

      violationFlags.forEach(flag => {
        if (text.includes(flag)) {
          compliance.violations.push({
            type: flag,
            context: this.extractContext(text, flag, 50)
          });
        }
      });

      // Calculate compliance score
      compliance.score = Math.max(0, 100 - (compliance.violations.length * 15));

      return compliance;
    } catch (error) {
      console.error('Compliance analysis error:', error);
      return null;
    }
  }

  // Utility methods
  extractContext(text, term, wordCount = 20) {
    const words = text.split(/\s+/);
    const index = words.findIndex(word => word.toLowerCase().includes(term.toLowerCase()));
    if (index === -1) return '';
    
    const start = Math.max(0, index - wordCount);
    const end = Math.min(words.length, index + wordCount + 1);
    return words.slice(start, end).join(' ');
  }

  isFinancialDocument(documentType) {
    const financialTypes = [
      this.documentTypes.FINANCIAL_STATEMENT,
      this.documentTypes.INCOME_STATEMENT,
      this.documentTypes.BALANCE_SHEET,
      this.documentTypes.CASH_FLOW,
      this.documentTypes.FINANCIAL_MODEL
    ];
    return financialTypes.includes(documentType);
  }

  // Document classification using AI
  async classifyDocument(file) {
    try {
      // Use AI to classify document type based on filename and initial content
      const fileName = file.name.toLowerCase();
      
      // Simple heuristics for common document types
      if (fileName.includes('financial') || fileName.includes('income') || fileName.includes('p&l')) {
        return this.documentTypes.FINANCIAL_STATEMENT;
      }
      if (fileName.includes('balance')) {
        return this.documentTypes.BALANCE_SHEET;
      }
      if (fileName.includes('cash') && fileName.includes('flow')) {
        return this.documentTypes.CASH_FLOW;
      }
      if (fileName.includes('pitch') || fileName.includes('deck')) {
        return this.documentTypes.PITCH_DECK;
      }
      if (fileName.includes('contract') || fileName.includes('agreement')) {
        return this.documentTypes.CONTRACTS;
      }

      // Default classification
      return 'unknown';
    } catch (error) {
      console.error('Document classification error:', error);
      return 'unknown';
    }
  }

  extractMetadata(file) {
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified ? new Date(file.lastModified) : null,
      uploadedAt: new Date()
    };
  }

  // Advanced DOCX processing with structure preservation
  async processDOCXDeep(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      return {
        text: result.value,
        structure: await this.extractDocumentStructure(result.value),
        tables: await this.extractTablesFromText(result.value),
        metadata: await this.extractDocumentMetadata(result.value)
      };
    } catch (error) {
      console.error('Advanced DOCX processing error:', error);
      throw error;
    }
  }

  // PPTX processing (placeholder - would need additional library)
  async processPPTXDeep(file) {
    try {
      // For PPTX, we'd need a library like node-pptx or similar
      // For now, return basic structure
      return {
        text: `PowerPoint presentation: ${file.name}`,
        slides: [],
        tables: [],
        charts: []
      };
    } catch (error) {
      console.error('PPTX processing error:', error);
      throw error;
    }
  }

  // Detect tables from positioned text items
  detectTablesFromTextItems(textItems) {
    const tables = [];
    
    // Group text items by similar Y positions (rows)
    const rows = {};
    const tolerance = 5; // pixel tolerance for same row
    
    textItems.forEach(item => {
      const roundedY = Math.round(item.y / tolerance) * tolerance;
      if (!rows[roundedY]) {
        rows[roundedY] = [];
      }
      rows[roundedY].push(item);
    });

    // Sort rows by Y position and detect table structures
    const sortedRows = Object.entries(rows)
      .sort(([a], [b]) => parseFloat(b) - parseFloat(a))
      .map(([y, items]) => ({
        y: parseFloat(y),
        items: items.sort((a, b) => a.x - b.x)
      }));

    // Simple table detection: look for aligned columns
    if (sortedRows.length >= 2) {
      const potentialTable = this.identifyTableStructure(sortedRows);
      if (potentialTable) {
        tables.push(potentialTable);
      }
    }

    return tables;
  }

  identifyTableStructure(rows) {
    // Basic table detection algorithm
    if (rows.length < 2) return null;

    const columnPositions = new Set();
    rows.forEach(row => {
      row.items.forEach(item => {
        columnPositions.add(Math.round(item.x / 10) * 10); // Round to nearest 10
      });
    });

    if (columnPositions.size >= 2) {
      const headers = rows[0].items.map(item => item.text);
      const data = rows.slice(1).map(row => 
        row.items.map(item => item.text)
      );

      return {
        headers,
        data,
        columnCount: columnPositions.size,
        rowCount: rows.length
      };
    }

    return null;
  }

  consolidateTables(tables) {
    // Merge similar tables and remove duplicates
    const consolidated = [];
    
    tables.forEach(table => {
      const existing = consolidated.find(t => 
        JSON.stringify(t.headers) === JSON.stringify(table.headers)
      );
      
      if (existing) {
        existing.data.push(...table.data);
      } else {
        consolidated.push(table);
      }
    });

    return consolidated;
  }

  detectFinancialModel(sheetData) {
    const text = sheetData.text.toLowerCase();
    const financialIndicators = [
      'revenue', 'expenses', 'profit', 'cash flow', 'balance sheet',
      'income statement', 'ebitda', 'gross margin', 'operating margin',
      'assumptions', 'projections', 'forecast', 'budget'
    ];

    return financialIndicators.some(indicator => text.includes(indicator));
  }

  parseFinancialModel(sheetData) {
    // Parse financial model structure
    const model = {
      assumptions: [],
      revenue: [],
      expenses: [],
      projections: []
    };

    // Look for time series data (years, quarters, months)
    const timeHeaders = sheetData.data[0]?.filter(header => 
      /\d{4}|Q[1-4]|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/.test(header)
    );

    if (timeHeaders && timeHeaders.length > 0) {
      model.timePeriods = timeHeaders;
      
      // Extract financial rows
      sheetData.data.slice(1).forEach(row => {
        const label = row[0]?.toString().toLowerCase();
        if (!label) return;

        if (label.includes('revenue') || label.includes('sales')) {
          model.revenue.push({
            label: row[0],
            values: row.slice(1, timeHeaders.length + 1)
          });
        } else if (label.includes('expense') || label.includes('cost')) {
          model.expenses.push({
            label: row[0],
            values: row.slice(1, timeHeaders.length + 1)
          });
        }
      });
    }

    return model;
  }

  identifyFinancialStatement(table) {
    if (!table.headers || table.headers.length === 0) return null;

    const headerText = table.headers.join(' ').toLowerCase();
    
    if (headerText.includes('income') || headerText.includes('profit') || headerText.includes('loss')) {
      return 'income';
    }
    if (headerText.includes('balance') || headerText.includes('assets') || headerText.includes('liabilities')) {
      return 'balance';
    }
    if (headerText.includes('cash flow') || headerText.includes('cash')) {
      return 'cashFlow';
    }

    return null;
  }

  parseFinancialStatement(table, type) {
    const statement = {
      type,
      periods: [],
      lineItems: []
    };

    // Extract periods from headers (skip first column which is usually labels)
    statement.periods = table.headers.slice(1);

    // Extract line items and values
    table.data.forEach(row => {
      if (row[0]) { // Has a label
        statement.lineItems.push({
          label: row[0],
          values: row.slice(1, statement.periods.length + 1)
        });
      }
    });

    return statement;
  }

  calculateFinancialMetrics(statements) {
    const metrics = {
      profitability: [],
      liquidity: [],
      efficiency: [],
      leverage: []
    };

    // Calculate metrics based on available statements
    if (statements.income && statements.balance) {
      // Example calculations
      try {
        // ROA = Net Income / Total Assets
        const netIncome = this.findLineItem(statements.income, 'net income');
        const totalAssets = this.findLineItem(statements.balance, 'total assets');
        
        if (netIncome && totalAssets) {
          const roa = this.calculateRatio(netIncome.values, totalAssets.values);
          metrics.profitability.push({
            name: 'Return on Assets',
            values: roa,
            benchmark: 0.15 // 15% benchmark
          });
        }
      } catch (error) {
        console.error('Metric calculation error:', error);
      }
    }

    return metrics;
  }

  findLineItem(statement, searchTerm) {
    return statement.lineItems.find(item => 
      item.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  calculateRatio(numerator, denominator) {
    return numerator.map((num, index) => {
      const denom = denominator[index];
      return (denom && denom !== 0) ? (num / denom) : null;
    });
  }

  identifyFinancialRedFlags(financialData) {
    const redFlags = [];

    // Check for declining revenue
    if (financialData.statements.income) {
      const revenue = this.findLineItem(financialData.statements.income, 'revenue');
      if (revenue && this.isDecreasingTrend(revenue.values)) {
        redFlags.push({
          category: 'Revenue',
          severity: 'high',
          description: 'Declining revenue trend identified'
        });
      }
    }

    // Check for high debt levels
    if (financialData.statements.balance) {
      const totalDebt = this.findLineItem(financialData.statements.balance, 'debt');
      const totalEquity = this.findLineItem(financialData.statements.balance, 'equity');
      
      if (totalDebt && totalEquity) {
        const debtToEquity = this.calculateRatio(totalDebt.values, totalEquity.values);
        const highDebt = debtToEquity.some(ratio => ratio > 2); // D/E > 2
        
        if (highDebt) {
          redFlags.push({
            category: 'Leverage',
            severity: 'medium',
            description: 'High debt-to-equity ratio indicates financial risk'
          });
        }
      }
    }

    return redFlags;
  }

  isDecreasingTrend(values) {
    if (values.length < 2) return false;
    let decreasing = 0;
    
    for (let i = 1; i < values.length; i++) {
      if (parseFloat(values[i]) < parseFloat(values[i-1])) {
        decreasing++;
      }
    }
    
    return decreasing >= values.length / 2;
  }

  categorizeDocuments(documents) {
    const categories = {};
    
    documents.forEach(doc => {
      const type = doc.documentType || 'unknown';
      if (!categories[type]) {
        categories[type] = [];
      }
      categories[type].push(doc);
    });

    return categories;
  }

  async analyzeDueDiligenceCategory(category, categorizedDocs, config) {
    const analysis = {
      score: 0,
      findings: [],
      redFlags: [],
      opportunities: []
    };

    // Category-specific analysis logic would go here
    // This is a simplified example
    switch (category) {
      case 'financial':
        analysis.score = this.analyzeFinancialDocuments(categorizedDocs);
        break;
      case 'legal':
        analysis.score = this.analyzeLegalDocuments(categorizedDocs);
        break;
      case 'operational':
        analysis.score = this.analyzeOperationalDocuments(categorizedDocs);
        break;
      case 'market':
        analysis.score = this.analyzeMarketDocuments(categorizedDocs);
        break;
      default:
        analysis.score = 50; // Default neutral score
    }

    return analysis;
  }

  analyzeFinancialDocuments(categorizedDocs) {
    let score = 0;
    const financialDocs = [
      categorizedDocs[this.documentTypes.FINANCIAL_STATEMENT] || [],
      categorizedDocs[this.documentTypes.INCOME_STATEMENT] || [],
      categorizedDocs[this.documentTypes.BALANCE_SHEET] || [],
      categorizedDocs[this.documentTypes.CASH_FLOW] || []
    ].flat();

    // Score based on document completeness and quality
    if (financialDocs.length >= 3) score += 30;
    if (financialDocs.some(doc => doc.riskFactors?.length === 0)) score += 20;
    
    return Math.min(100, score + 50); // Base score of 50
  }

  analyzeLegalDocuments(categorizedDocs) {
    // Simplified legal document analysis
    const legalDocs = [
      categorizedDocs[this.documentTypes.CONTRACTS] || [],
      categorizedDocs[this.documentTypes.IP_DOCUMENTS] || [],
      categorizedDocs[this.documentTypes.COMPLIANCE_DOCS] || []
    ].flat();

    return legalDocs.length > 0 ? 75 : 40;
  }

  analyzeOperationalDocuments(categorizedDocs) {
    // Simplified operational analysis
    const operationalDocs = [
      categorizedDocs[this.documentTypes.BUSINESS_PLAN] || [],
      categorizedDocs[this.documentTypes.OPERATIONAL_METRICS] || []
    ].flat();

    return operationalDocs.length > 0 ? 70 : 45;
  }

  analyzeMarketDocuments(categorizedDocs) {
    // Simplified market analysis
    const marketDocs = [
      categorizedDocs[this.documentTypes.MARKET_RESEARCH] || [],
      categorizedDocs[this.documentTypes.CUSTOMER_DATA] || []
    ].flat();

    return marketDocs.length > 0 ? 65 : 40;
  }

  calculateOverallDDScore(categoryScores) {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(this.dueDiligenceFramework).forEach(([category, config]) => {
      const score = categoryScores[category.toLowerCase()] || 0;
      totalScore += score * config.weight;
      totalWeight += config.weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  }

  async findDocumentCrossReferences(documents) {
    const crossRefs = [];

    for (let i = 0; i < documents.length; i++) {
      for (let j = i + 1; j < documents.length; j++) {
        const doc1 = documents[i];
        const doc2 = documents[j];
        
        // Find common entities
        const commonEntities = this.findCommonEntities(doc1.entities, doc2.entities);
        
        // Find financial correlations
        const financialCorrelations = this.findFinancialCorrelations(doc1, doc2);
        
        // Find date/timeline correlations
        const timelineCorrelations = this.findTimelineCorrelations(doc1, doc2);
        
        // Find thematic connections
        const thematicConnections = this.findThematicConnections(doc1, doc2);
        
        // Find contract/legal relationships
        const legalRelationships = this.findLegalRelationships(doc1, doc2);
        
        if (commonEntities.length > 0 || financialCorrelations.length > 0 || 
            timelineCorrelations.length > 0 || thematicConnections.length > 0 ||
            legalRelationships.length > 0) {
          
          const relationship = this.generateRelationshipDescription(
            commonEntities, financialCorrelations, timelineCorrelations, 
            thematicConnections, legalRelationships
          );
          
          crossRefs.push({
            document1: { 
              name: doc1.metadata.name, 
              type: doc1.documentType,
              id: doc1.metadata.id 
            },
            document2: { 
              name: doc2.metadata.name, 
              type: doc2.documentType,
              id: doc2.metadata.id 
            },
            commonEntities,
            financialCorrelations,
            timelineCorrelations,
            thematicConnections,
            legalRelationships,
            relationship,
            confidence: this.calculateRelationshipConfidence(
              commonEntities, financialCorrelations, timelineCorrelations, 
              thematicConnections, legalRelationships
            ),
            analysisType: this.determineAnalysisType(doc1.documentType, doc2.documentType)
          });
        }
      }
    }

    return crossRefs.sort((a, b) => b.confidence - a.confidence);
  }

  findCommonEntities(entities1, entities2) {
    const common = [];
    
    Object.keys(entities1).forEach(entityType => {
      if (entities2[entityType]) {
        entities1[entityType].forEach(entity1 => {
          const match = entities2[entityType].find(entity2 => 
            entity1.name.toLowerCase() === entity2.name.toLowerCase()
          );
          if (match) {
            common.push({
              type: entityType,
              name: entity1.name
            });
          }
        });
      }
    });

    return common;
  }

  findFinancialCorrelations(doc1, doc2) {
    const correlations = [];
    
    if (doc1.financialData && doc2.financialData) {
      // Check for related financial figures
      const amounts1 = this.extractFinancialAmounts(doc1.content?.text || '');
      const amounts2 = this.extractFinancialAmounts(doc2.content?.text || '');
      
      amounts1.forEach(amount1 => {
        amounts2.forEach(amount2 => {
          const diff = Math.abs(amount1.value - amount2.value);
          const avgValue = (amount1.value + amount2.value) / 2;
          const variance = avgValue > 0 ? (diff / avgValue) : 1;
          
          if (variance < 0.1) { // Within 10% variance
            correlations.push({
              type: 'financial_amount',
              description: `Similar financial amounts: ${amount1.text} ≈ ${amount2.text}`,
              confidence: 1 - variance,
              amount1: amount1,
              amount2: amount2
            });
          }
        });
      });
    }
    
    return correlations;
  }

  findTimelineCorrelations(doc1, doc2) {
    const correlations = [];
    
    if (doc1.entities?.dates && doc2.entities?.dates) {
      doc1.entities.dates.forEach(date1 => {
        doc2.entities.dates.forEach(date2 => {
          const timeDiff = Math.abs(new Date(date1.name) - new Date(date2.name));
          const daysDiff = timeDiff / (1000 * 60 * 60 * 24);
          
          if (daysDiff <= 30) { // Within 30 days
            correlations.push({
              type: 'temporal',
              description: `Related timeframe: ${date1.name} ~ ${date2.name}`,
              confidence: Math.max(0.1, 1 - (daysDiff / 30)),
              date1: date1,
              date2: date2,
              daysDiff: Math.round(daysDiff)
            });
          }
        });
      });
    }
    
    return correlations;
  }

  findThematicConnections(doc1, doc2) {
    const connections = [];
    
    const text1 = (doc1.content?.text || '').toLowerCase();
    const text2 = (doc2.content?.text || '').toLowerCase();
    
    const businessThemes = [
      ['revenue', 'sales', 'income'],
      ['cost', 'expense', 'expenditure'],
      ['market', 'competition', 'competitive'],
      ['technology', 'innovation', 'development'],
      ['risk', 'threat', 'challenge'],
      ['growth', 'expansion', 'scale'],
      ['customer', 'client', 'user'],
      ['investment', 'funding', 'capital']
    ];
    
    businessThemes.forEach(themeGroup => {
      const matches1 = themeGroup.filter(keyword => text1.includes(keyword));
      const matches2 = themeGroup.filter(keyword => text2.includes(keyword));
      
      if (matches1.length > 0 && matches2.length > 0) {
        connections.push({
          type: 'thematic',
          theme: themeGroup[0],
          description: `Common business theme: ${themeGroup[0]}`,
          confidence: (matches1.length + matches2.length) / (themeGroup.length * 2),
          keywords1: matches1,
          keywords2: matches2
        });
      }
    });
    
    return connections;
  }

  findLegalRelationships(doc1, doc2) {
    const relationships = [];
    
    // Check for contract references
    const contractTerms = ['agreement', 'contract', 'party', 'clause', 'term', 'condition'];
    const text1 = (doc1.content?.text || '').toLowerCase();
    const text2 = (doc2.content?.text || '').toLowerCase();
    
    let legalTerms1 = 0;
    let legalTerms2 = 0;
    
    contractTerms.forEach(term => {
      if (text1.includes(term)) legalTerms1++;
      if (text2.includes(term)) legalTerms2++;
    });
    
    if (legalTerms1 > 2 && legalTerms2 > 2) {
      relationships.push({
        type: 'legal_document',
        description: 'Both documents contain legal/contractual language',
        confidence: Math.min(legalTerms1, legalTerms2) / contractTerms.length,
        legalTermsCount1: legalTerms1,
        legalTermsCount2: legalTerms2
      });
    }
    
    return relationships;
  }

  generateRelationshipDescription(entities, financial, timeline, thematic, legal) {
    const descriptions = [];
    
    if (entities.length > 0) {
      descriptions.push(`${entities.length} common entities`);
    }
    if (financial.length > 0) {
      descriptions.push(`${financial.length} financial correlations`);
    }
    if (timeline.length > 0) {
      descriptions.push(`${timeline.length} timeline correlations`);
    }
    if (thematic.length > 0) {
      descriptions.push(`${thematic.length} thematic connections`);
    }
    if (legal.length > 0) {
      descriptions.push(`${legal.length} legal relationships`);
    }
    
    return descriptions.length > 0 ? descriptions.join(', ') : 'Related documents';
  }

  calculateRelationshipConfidence(entities, financial, timeline, thematic, legal) {
    let totalConfidence = 0;
    let totalWeight = 0;
    
    if (entities.length > 0) {
      totalConfidence += entities.length * 0.3; // High weight for entity matches
      totalWeight += 0.3;
    }
    if (financial.length > 0) {
      const avgFinancialConfidence = financial.reduce((sum, f) => sum + f.confidence, 0) / financial.length;
      totalConfidence += avgFinancialConfidence * 0.25;
      totalWeight += 0.25;
    }
    if (timeline.length > 0) {
      const avgTimelineConfidence = timeline.reduce((sum, t) => sum + t.confidence, 0) / timeline.length;
      totalConfidence += avgTimelineConfidence * 0.2;
      totalWeight += 0.2;
    }
    if (thematic.length > 0) {
      const avgThematicConfidence = thematic.reduce((sum, th) => sum + th.confidence, 0) / thematic.length;
      totalConfidence += avgThematicConfidence * 0.15;
      totalWeight += 0.15;
    }
    if (legal.length > 0) {
      const avgLegalConfidence = legal.reduce((sum, l) => sum + l.confidence, 0) / legal.length;
      totalConfidence += avgLegalConfidence * 0.1;
      totalWeight += 0.1;
    }
    
    return totalWeight > 0 ? Math.min(100, Math.round((totalConfidence / totalWeight) * 100)) : 0;
  }

  determineAnalysisType(docType1, docType2) {
    const financialTypes = ['financial_statement', 'income_statement', 'balance_sheet', 'cash_flow'];
    const legalTypes = ['contracts', 'legal_document', 'compliance_document'];
    const strategyTypes = ['business_plan', 'market_research', 'competitive_analysis'];
    
    if (financialTypes.includes(docType1) && financialTypes.includes(docType2)) {
      return 'financial_cross_analysis';
    }
    if (legalTypes.includes(docType1) && legalTypes.includes(docType2)) {
      return 'legal_cross_analysis';
    }
    if (strategyTypes.includes(docType1) && strategyTypes.includes(docType2)) {
      return 'strategic_cross_analysis';
    }
    if (financialTypes.includes(docType1) || financialTypes.includes(docType2)) {
      return 'financial_operational_analysis';
    }
    
    return 'general_cross_analysis';
  }

  extractFinancialAmounts(text) {
    const amounts = [];
    // Regex to find currency amounts (simplified)
    const currencyRegex = /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:million|billion|thousand|k|m|b)/gi;
    
    let match;
    while ((match = currencyRegex.exec(text)) !== null) {
      const amountText = match[0];
      let value = parseFloat(amountText.replace(/[$,]/g, ''));
      
      if (amountText.toLowerCase().includes('thousand') || amountText.toLowerCase().includes('k')) {
        value *= 1000;
      } else if (amountText.toLowerCase().includes('million') || amountText.toLowerCase().includes('m')) {
        value *= 1000000;
      } else if (amountText.toLowerCase().includes('billion') || amountText.toLowerCase().includes('b')) {
        value *= 1000000000;
      }
      
      amounts.push({
        text: amountText,
        value: value,
        position: match.index
      });
    }
    
    return amounts;
  }

  identifyMissingDocuments(categorizedDocs) {
    const required = [
      this.documentTypes.FINANCIAL_STATEMENT,
      this.documentTypes.BUSINESS_PLAN,
      this.documentTypes.CONTRACTS
    ];

    const missing = required.filter(docType => 
      !categorizedDocs[docType] || categorizedDocs[docType].length === 0
    );

    return missing.map(docType => ({
      type: docType,
      importance: 'high',
      reason: 'Required for comprehensive due diligence'
    }));
  }

  generateDDRecommendations(analysis) {
    const recommendations = [];

    if (analysis.overallScore < 60) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        title: 'Address Critical Issues',
        description: 'Overall due diligence score is below acceptable threshold'
      });
    }

    if (analysis.redFlags.length > 5) {
      recommendations.push({
        priority: 'high',
        category: 'risk',
        title: 'Risk Mitigation Required',
        description: 'Multiple red flags identified requiring immediate attention'
      });
    }

    if (analysis.missingDocuments.length > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'documentation',
        title: 'Complete Documentation',
        description: `${analysis.missingDocuments.length} critical documents missing`
      });
    }

    return recommendations;
  }

  identifyRiskFactors(documentData) {
    const risks = [];
    const text = documentData.content.text.toLowerCase();

    const riskKeywords = [
      { keyword: 'litigation', category: 'legal', severity: 'high' },
      { keyword: 'lawsuit', category: 'legal', severity: 'high' },
      { keyword: 'investigation', category: 'compliance', severity: 'medium' },
      { keyword: 'decline', category: 'financial', severity: 'medium' },
      { keyword: 'loss', category: 'financial', severity: 'medium' },
      { keyword: 'debt', category: 'financial', severity: 'low' },
      { keyword: 'competition', category: 'market', severity: 'low' }
    ];

    riskKeywords.forEach(({ keyword, category, severity }) => {
      if (text.includes(keyword)) {
        risks.push({
          keyword,
          category,
          severity,
          context: this.extractContext(documentData.content.text, keyword)
        });
      }
    });

    return risks;
  }

  extractDocumentStructure(text) {
    // Extract document structure like headings, sections
    const structure = {
      headings: [],
      sections: []
    };

    // Simple heading detection
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 100) {
        // Potential heading if short and at start of line
        if (trimmed.match(/^[A-Z][^.]*$/) || trimmed.match(/^\d+\./)) {
          structure.headings.push({
            text: trimmed,
            line: index
          });
        }
      }
    });

    return structure;
  }

  async extractTablesFromText(text) {
    // Simple table extraction from text
    const tables = [];
    const lines = text.split('\n');
    
    // Look for tab-separated or multi-column content
    lines.forEach((line, index) => {
      if (line.includes('\t') && line.split('\t').length >= 3) {
        // Found potential table row
        const columns = line.split('\t').map(col => col.trim());
        
        // Check if this starts a new table
        const existingTable = tables.find(t => t.endLine === index - 1);
        if (existingTable) {
          existingTable.data.push(columns);
          existingTable.endLine = index;
        } else {
          tables.push({
            startLine: index,
            endLine: index,
            headers: columns,
            data: [columns]
          });
        }
      }
    });

    return tables;
  }

  async extractDocumentMetadata(text) {
    // Extract document metadata like title, author, date
    const metadata = {};
    
    const lines = text.split('\n').slice(0, 10); // Check first 10 lines
    
    lines.forEach(line => {
      const trimmed = line.trim();
      
      // Look for date patterns
      const dateMatch = trimmed.match(/(\w+ \d{1,2}, \d{4}|\d{1,2}\/\d{1,2}\/\d{4})/);
      if (dateMatch && !metadata.date) {
        metadata.date = dateMatch[1];
      }
      
      // Look for title (first non-empty line that's not too long)
      if (!metadata.title && trimmed.length > 5 && trimmed.length < 100 && !trimmed.includes('Page')) {
        metadata.title = trimmed;
      }
    });

    return metadata;
  }

  // Advanced Due Diligence Methods
  async analyzeDueDiligenceCategoryAdvanced(category, categorizedDocs, config, analysisType) {
    const analysis = {
      score: 0,
      subcategoryScores: {},
      findings: [],
      redFlags: [],
      opportunities: [],
      evidence: [],
      recommendations: []
    };

    // Analyze each subcategory with weighted scoring
    for (const [subcategory, subConfig] of Object.entries(config.categories || {})) {
      const subcategoryAnalysis = await this.analyzeSubcategory(
        category, subcategory, subConfig, categorizedDocs, analysisType
      );
      
      analysis.subcategoryScores[subcategory] = subcategoryAnalysis.score;
      analysis.findings.push(...subcategoryAnalysis.findings);
      analysis.redFlags.push(...subcategoryAnalysis.redFlags);
      analysis.opportunities.push(...subcategoryAnalysis.opportunities);
      analysis.evidence.push(...subcategoryAnalysis.evidence);
      
      // Weight the subcategory score
      analysis.score += subcategoryAnalysis.score * subConfig.weight;
    }

    return analysis;
  }

  async analyzeSubcategory(category, subcategory, subConfig, categorizedDocs, analysisType) {
    const analysis = {
      score: 50, // Neutral starting point
      findings: [],
      redFlags: [],
      opportunities: [],
      evidence: []
    };

    // Category-specific analysis logic
    switch (category) {
      case 'financial':
        return this.analyzeFinancialSubcategory(subcategory, subConfig, categorizedDocs);
      case 'legal':
        return this.analyzeLegalSubcategory(subcategory, subConfig, categorizedDocs);
      case 'operational':
        return this.analyzeOperationalSubcategory(subcategory, subConfig, categorizedDocs);
      case 'market':
        return this.analyzeMarketSubcategory(subcategory, subConfig, categorizedDocs);
      default:
        return analysis;
    }
  }

  analyzeFinancialSubcategory(subcategory, subConfig, categorizedDocs) {
    const analysis = { score: 50, findings: [], redFlags: [], opportunities: [], evidence: [] };
    
    const financialDocs = [
      ...(categorizedDocs[this.documentTypes.FINANCIAL_STATEMENT] || []),
      ...(categorizedDocs[this.documentTypes.INCOME_STATEMENT] || []),
      ...(categorizedDocs[this.documentTypes.BALANCE_SHEET] || []),
      ...(categorizedDocs[this.documentTypes.CASH_FLOW] || [])
    ];

    switch (subcategory) {
      case 'revenue_quality':
        if (financialDocs.length > 0) {
          const recurringRevenue = financialDocs.some(doc => 
            doc.content?.text?.toLowerCase().includes('recurring') || 
            doc.content?.text?.toLowerCase().includes('subscription')
          );
          if (recurringRevenue) {
            analysis.score = 75;
            analysis.findings.push('Evidence of recurring revenue model found');
          }
        }
        break;
      
      case 'cash_flow':
        const cashFlowDocs = categorizedDocs[this.documentTypes.CASH_FLOW] || [];
        if (cashFlowDocs.length > 0) {
          analysis.score = 70;
          analysis.findings.push('Cash flow statements available for analysis');
        } else {
          analysis.score = 30;
          analysis.redFlags.push({ 
            severity: 'HIGH', 
            description: 'No cash flow statements provided' 
          });
        }
        break;
    }

    return analysis;
  }

  analyzeLegalSubcategory(subcategory, subConfig, categorizedDocs) {
    const analysis = { score: 50, findings: [], redFlags: [], opportunities: [], evidence: [] };
    
    const legalDocs = [
      ...(categorizedDocs[this.documentTypes.CONTRACTS] || []),
      ...(categorizedDocs[this.documentTypes.LEGAL_DOCUMENT] || []),
      ...(categorizedDocs[this.documentTypes.COMPLIANCE_DOCUMENT] || [])
    ];

    switch (subcategory) {
      case 'ip_protection':
        const hasPatents = legalDocs.some(doc => 
          doc.content?.text?.toLowerCase().includes('patent') ||
          doc.content?.text?.toLowerCase().includes('intellectual property')
        );
        if (hasPatents) {
          analysis.score = 80;
          analysis.findings.push('Intellectual property documentation found');
        }
        break;
    }

    return analysis;
  }

  analyzeOperationalSubcategory(subcategory, subConfig, categorizedDocs) {
    const analysis = { score: 50, findings: [], redFlags: [], opportunities: [], evidence: [] };
    
    const operationalDocs = [
      ...(categorizedDocs[this.documentTypes.BUSINESS_PLAN] || []),
      ...(categorizedDocs[this.documentTypes.OPERATIONAL_REPORT] || [])
    ];

    switch (subcategory) {
      case 'team_strength':
        const hasOrgChart = operationalDocs.some(doc => 
          doc.content?.text?.toLowerCase().includes('organizational') ||
          doc.content?.text?.toLowerCase().includes('team structure')
        );
        if (hasOrgChart) {
          analysis.score = 65;
          analysis.findings.push('Team structure documentation available');
        }
        break;
    }

    return analysis;
  }

  analyzeMarketSubcategory(subcategory, subConfig, categorizedDocs) {
    const analysis = { score: 50, findings: [], redFlags: [], opportunities: [], evidence: [] };
    
    const marketDocs = [
      ...(categorizedDocs[this.documentTypes.MARKET_RESEARCH] || []),
      ...(categorizedDocs[this.documentTypes.COMPETITIVE_ANALYSIS] || [])
    ];

    switch (subcategory) {
      case 'market_size':
        const hasTAM = marketDocs.some(doc => 
          doc.content?.text?.toLowerCase().includes('tam') ||
          doc.content?.text?.toLowerCase().includes('total addressable market')
        );
        if (hasTAM) {
          analysis.score = 75;
          analysis.findings.push('Total addressable market analysis found');
        }
        break;
    }

    return analysis;
  }

  performRiskAssessment(analysis) {
    const riskAssessment = {
      overallRiskLevel: 'MEDIUM',
      criticalRisks: [],
      highRisks: [],
      mediumRisks: [],
      lowRisks: []
    };

    // Categorize risks by severity
    analysis.redFlags.forEach(flag => {
      switch (flag.severity?.toUpperCase()) {
        case 'CRITICAL':
          riskAssessment.criticalRisks.push(flag);
          break;
        case 'HIGH':
          riskAssessment.highRisks.push(flag);
          break;
        case 'MEDIUM':
          riskAssessment.mediumRisks.push(flag);
          break;
        default:
          riskAssessment.lowRisks.push(flag);
      }
    });

    // Determine overall risk level
    if (riskAssessment.criticalRisks.length > 0) {
      riskAssessment.overallRiskLevel = 'CRITICAL';
    } else if (riskAssessment.highRisks.length > 3) {
      riskAssessment.overallRiskLevel = 'HIGH';
    } else if (analysis.overallScore < 40) {
      riskAssessment.overallRiskLevel = 'HIGH';
    } else if (analysis.overallScore > 75) {
      riskAssessment.overallRiskLevel = 'LOW';
    }

    return riskAssessment;
  }

  calculateInvestmentReadiness(analysis) {
    const readiness = {
      score: analysis.overallScore,
      grade: 'C',
      readinessFactors: []
    };

    // Calculate investment grade
    if (analysis.overallScore >= 85) {
      readiness.grade = 'A+';
    } else if (analysis.overallScore >= 80) {
      readiness.grade = 'A';
    } else if (analysis.overallScore >= 75) {
      readiness.grade = 'A-';
    } else if (analysis.overallScore >= 70) {
      readiness.grade = 'B+';
    } else if (analysis.overallScore >= 65) {
      readiness.grade = 'B';
    } else if (analysis.overallScore >= 60) {
      readiness.grade = 'B-';
    } else if (analysis.overallScore >= 55) {
      readiness.grade = 'C+';
    } else if (analysis.overallScore >= 50) {
      readiness.grade = 'C';
    } else if (analysis.overallScore >= 40) {
      readiness.grade = 'D';
    } else {
      readiness.grade = 'F';
    }

    // Identify key readiness factors
    Object.entries(analysis.categoryScores).forEach(([category, score]) => {
      if (score > 80) {
        readiness.readinessFactors.push(`Strong ${category} performance`);
      } else if (score < 50) {
        readiness.readinessFactors.push(`${category} needs improvement`);
      }
    });

    return readiness;
  }

  generateAdvancedDDRecommendations(analysis) {
    const recommendations = [];

    // Strategic recommendations based on category scores
    Object.entries(analysis.categoryScores).forEach(([category, score]) => {
      if (score < 50) {
        recommendations.push({
          priority: 'HIGH',
          category: category,
          title: `Address ${category} weaknesses`,
          description: `${category} score is below investment threshold`,
          actionItems: this.getActionItemsForCategory(category, score)
        });
      } else if (score > 80) {
        recommendations.push({
          priority: 'LOW',
          category: category,
          title: `Leverage ${category} strengths`,
          description: `${category} shows strong performance - can be leveraged for growth`,
          actionItems: [`Highlight ${category} strengths in investment materials`]
        });
      }
    });

    // Risk-based recommendations
    if (analysis.riskAssessment.criticalRisks.length > 0) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'risk_management',
        title: 'Address Critical Risks',
        description: 'Critical risks identified that require immediate attention',
        actionItems: analysis.riskAssessment.criticalRisks.map(risk => `Mitigate: ${risk.description}`)
      });
    }

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  getActionItemsForCategory(category, score) {
    const actionItems = {
      financial: [
        'Provide complete financial statements for last 3 years',
        'Engage external auditor for financial review',
        'Develop detailed financial projections'
      ],
      legal: [
        'Complete legal entity structure review',
        'Conduct IP audit and protection review',
        'Update all material contracts'
      ],
      operational: [
        'Document key operational processes',
        'Conduct organizational assessment',
        'Implement performance tracking systems'
      ],
      market: [
        'Conduct comprehensive market analysis',
        'Develop competitive intelligence',
        'Validate product-market fit with customer research'
      ]
    };

    return actionItems[category] || ['Conduct detailed review of category requirements'];
  }

  generateExecutiveSummary(analysis) {
    const gradeDescription = this.getGradeDescription(analysis.investmentReadiness.grade);
    const riskLevel = analysis.riskAssessment.overallRiskLevel;
    
    let summary = `Investment Grade: ${analysis.investmentReadiness.grade} (${analysis.overallScore}/100) - ${gradeDescription}\n\n`;
    
    summary += `Overall Risk Assessment: ${riskLevel}\n\n`;
    
    summary += 'Key Strengths:\n';
    Object.entries(analysis.categoryScores)
      .filter(([_, score]) => score > 70)
      .forEach(([category, score]) => {
        summary += `• ${category.charAt(0).toUpperCase() + category.slice(1)}: ${score}/100\n`;
      });
    
    summary += '\nKey Concerns:\n';
    Object.entries(analysis.categoryScores)
      .filter(([_, score]) => score < 50)
      .forEach(([category, score]) => {
        summary += `• ${category.charAt(0).toUpperCase() + category.slice(1)}: ${score}/100\n`;
      });
    
    if (analysis.redFlags.length > 0) {
      summary += `\n${analysis.redFlags.length} red flags identified requiring attention.`;
    }
    
    return summary;
  }

  getGradeDescription(grade) {
    const descriptions = {
      'A+': 'Exceptional investment opportunity',
      'A': 'Strong investment opportunity',
      'A-': 'Good investment opportunity',
      'B+': 'Solid investment opportunity with minor concerns',
      'B': 'Reasonable investment opportunity',
      'B-': 'Investment opportunity with moderate concerns',
      'C+': 'Investment opportunity with significant concerns',
      'C': 'High-risk investment opportunity',
      'D': 'Poor investment opportunity',
      'F': 'Not suitable for investment'
    };
    return descriptions[grade] || 'Investment requires careful evaluation';
  }

  performIndustryBenchmarking(analysis) {
    // Simplified benchmarking - in practice, this would use external data
    return {
      industryAverageScore: 62,
      percentileRank: this.calculatePercentileRank(analysis.overallScore),
      categoryBenchmarks: {
        financial: { industry: 58, company: analysis.categoryScores.financial || 0 },
        legal: { industry: 65, company: analysis.categoryScores.legal || 0 },
        operational: { industry: 61, company: analysis.categoryScores.operational || 0 },
        market: { industry: 64, company: analysis.categoryScores.market || 0 }
      }
    };
  }

  calculatePercentileRank(score) {
    // Simplified percentile calculation
    if (score >= 85) return 95;
    if (score >= 75) return 80;
    if (score >= 65) return 65;
    if (score >= 55) return 45;
    if (score >= 45) return 25;
    return 10;
  }
}

const advancedDocumentIntelligence = new AdvancedDocumentIntelligence();
export default advancedDocumentIntelligence;