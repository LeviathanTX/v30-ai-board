// src/services/aiService.js
import logger from '../utils/logger';

class AIService {
  constructor() {
    // Use our API proxy instead of calling Anthropic directly
    this.apiUrl = '/api/claude';
  }

  // Get API key from localStorage or environment
  getApiKey() {
    return localStorage.getItem('claude_api_key') || 
           localStorage.getItem('anthropic_api_key') || 
           process.env.REACT_APP_ANTHROPIC_API_KEY;
  }

  // Check if API key is available
  hasApiKey() {
    const apiKey = this.getApiKey();
    return !!(apiKey && apiKey.trim());
  }

  async sendMessage(message, advisor, options = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Claude API key not configured. Please add your API key in Settings.');
    }

    const { documents = [], conversationHistory = [], stream = false } = options;
    const systemPrompt = this.buildAdvisorPrompt(advisor);
    const documentContext = this.buildDocumentContext(documents);
    
    try {
      const messages = this.buildMessageHistory(conversationHistory, message, documentContext);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: apiKey, // Include API key in body for proxy
          model: 'claude-3-opus-20240229',
          max_tokens: 1024,
          system: systemPrompt,
          messages: messages,
          stream: stream
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(`API request failed: ${response.status} ${errorData?.error?.message || ''}`);
      }

      if (stream) {
        return this.handleStreamResponse(response);
      } else {
        const data = await response.json();
        return data.content[0].text;
      }
    } catch (error) {
      logger.error('AI Service Error:', error);
      throw error;
    }
  }

  async conductBoardMeeting(message, advisors, documents = [], options = {}) {
    const { rounds = 1, includeDocumentAnalysis = true } = options;
    const responses = [];
    const documentContext = this.buildDocumentContext(documents);

    // First, have each advisor provide their perspective
    for (const advisor of advisors) {
      const advisorMessage = includeDocumentAnalysis && documentContext
        ? `${message}\n\nConsider the following documents in your response:\n${documentContext}`
        : message;

      try {
        const response = await this.sendMessage(advisorMessage, advisor, {
          documents,
          conversationHistory: responses
        });

        responses.push({
          id: Date.now() + Math.random(),
          advisorId: advisor.id,
          advisorName: advisor.name,
          advisorRole: advisor.role,
          advisorEmoji: advisor.avatar_emoji,
          content: response,
          timestamp: new Date().toISOString()
        });

        // Small delay between advisors for better UX
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.error(`Error getting response from ${advisor.name}:`, error);
      }
    }

    // If multiple rounds, have advisors respond to each other
    if (rounds > 1) {
      for (let round = 2; round <= rounds; round++) {
        const discussionContext = this.buildDiscussionContext(responses);
        
        for (const advisor of advisors) {
          const followUpMessage = `Based on the discussion so far:\n${discussionContext}\n\nPlease add your additional thoughts or respond to other advisors' points.`;
          
          try {
            const response = await this.sendMessage(followUpMessage, advisor, {
              documents,
              conversationHistory: responses
            });

            responses.push({
              id: Date.now() + Math.random(),
              advisorId: advisor.id,
              advisorName: advisor.name,
              advisorRole: advisor.role,
              advisorEmoji: advisor.avatar_emoji,
              content: response,
              timestamp: new Date().toISOString(),
              round: round
            });

            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            logger.error(`Error in round ${round} from ${advisor.name}:`, error);
          }
        }
      }
    }

    return responses;
  }

  buildAdvisorPrompt(advisor) {
    if (!advisor) {
      return "You are a helpful AI assistant providing strategic business advice.";
    }

    // Build rich personality-driven prompt
    let prompt = `You are ${advisor.name}, ${advisor.role} on an AI Board of Advisors.`;

    // Add background story for authenticity
    if (advisor.background?.story) {
      prompt += `\n\nBACKGROUND: ${advisor.background.story}`;
    }

    // Add core philosophy
    if (advisor.background?.philosophy) {
      prompt += `\n\nPHILOSOPHY: ${advisor.background.philosophy}`;
    }

    // Add expertise
    prompt += `\n\nEXPERTISE: ${advisor.expertise?.join(', ') || 'Business strategy and operations'}`;

    // Add personality traits and communication style
    const traits = advisor.personality?.traits?.join(', ') || 'professional, insightful, action-oriented';
    const commStyle = advisor.personality?.communication_style || 'professional';
    prompt += `\n\nPERSONALITY: You are ${traits} with a ${commStyle} communication style.`;

    // Add signature catchphrases for authenticity
    if (advisor.personality?.catchphrases && advisor.personality.catchphrases.length > 0) {
      const phrases = advisor.personality.catchphrases.slice(0, 3).join('", "');
      prompt += `\n\nCOMMUNICATION: Use phrases like "${phrases}" naturally in your responses.`;
    }

    // Add celebrity-specific guidance
    if (advisor.is_celebrity) {
      prompt += `\n\nCELEBRITY ADVISOR: You are a well-known business leader. Draw from your real-world experience and public persona. Speak with the authority and insights that made you famous in business.`;
    }

    // Add specialty focus guidance
    if (advisor.specialty_focus) {
      const focusGuidance = {
        'entrepreneurship': 'Focus on startup challenges, scaling, and building businesses from scratch.',
        'angel_investing': 'Focus on investment evaluation, founder assessment, and early-stage opportunities.',
        'operations': 'Focus on scaling operations, organizational development, and operational excellence.',
        'finance': 'Focus on financial strategy, capital allocation, and financial risk management.',
        'technology': 'Focus on digital transformation, AI strategy, and technology leadership.',
        'saas': 'Focus on SaaS business models, customer success, and platform strategy.',
        'networking': 'Focus on network effects, relationship building, and platform businesses.',
        'strategy': 'Focus on strategic planning, competitive analysis, and market positioning.',
        'marketing': 'Focus on brand building, customer acquisition, and market strategy.',
        'governance': 'Focus on board effectiveness, decision-making, and meeting facilitation.'
      };
      
      if (focusGuidance[advisor.specialty_focus]) {
        prompt += `\n\nSPECIALTY FOCUS: ${focusGuidance[advisor.specialty_focus]}`;
      }
    }

    // Add meeting host specific instructions
    if (advisor.is_host) {
      prompt += `\n\nMEETING HOST: As the board meeting host, facilitate discussion, synthesize different viewpoints, ask clarifying questions, and guide the group toward actionable decisions. Keep meetings focused and productive.`;
    }

    // Core guidelines
    prompt += `\n\nGUIDELINES:
- Provide strategic advice based on your expertise and experience
- Be authentic to your personality and communication style
- Aim for 2-3 paragraphs with actionable insights
- Reference specific data from documents when available
- In board discussions, acknowledge and build on other advisors' points
- Stay true to your background and proven business principles`;

    return prompt;
  }

  buildDocumentContext(documents) {
    if (!documents || documents.length === 0) return '';

    const context = documents.map(doc => {
      let docContext = `\n[Document: ${doc.name}]`;
      
      if (doc.extractedData) {
        docContext += `\nType: ${doc.type}`;
        if (doc.extractedData.summary) {
          docContext += `\nSummary: ${doc.extractedData.summary}`;
        }
        if (doc.extractedData.keywords?.length > 0) {
          docContext += `\nKey Topics: ${doc.extractedData.keywords.slice(0, 5).map(k => k.word).join(', ')}`;
        }
        if (doc.analysis?.insights?.length > 0) {
          docContext += `\nKey Insights:`;
          doc.analysis.insights.slice(0, 3).forEach(insight => {
            docContext += `\n- ${insight.content}`;
          });
        }
        // Include relevant excerpt
        if (doc.extractedData.text) {
          const excerpt = doc.extractedData.text.substring(0, 500);
          docContext += `\nExcerpt: "${excerpt}..."`;
        }
      } else if (doc.content) {
        docContext += `\nContent: ${doc.content.substring(0, 500)}...`;
      }
      
      return docContext;
    }).join('\n\n');

    return `\n\nRelevant Documents:${context}`;
  }

  buildMessageHistory(conversationHistory, currentMessage, documentContext) {
    const messages = [];
    
    // Add conversation history (limit to last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message with document context
    messages.push({
      role: 'user',
      content: currentMessage + (documentContext || '')
    });

    return messages;
  }

  buildDiscussionContext(responses) {
    return responses.slice(-3).map(response => 
      `${response.advisorName} (${response.advisorRole}): ${response.content.substring(0, 200)}...`
    ).join('\n\n');
  }

  async handleStreamResponse(response) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullText = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
              fullText += parsed.delta.text;
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }

    return fullText;
  }

  // Utility method to analyze document relevance to a query
  analyzeDocumentRelevance(query, document) {
    if (!document.extractedData) return 0;

    const queryLower = query.toLowerCase();
    const docText = (document.extractedData.text || document.content || '').toLowerCase();
    const keywords = document.extractedData.keywords?.map(k => k.word.toLowerCase()) || [];
    
    let relevanceScore = 0;

    // Check for query terms in document
    const queryTerms = queryLower.split(/\s+/);
    queryTerms.forEach(term => {
      if (docText.includes(term)) relevanceScore += 0.2;
      if (keywords.includes(term)) relevanceScore += 0.3;
    });

    // Check for business-relevant terms
    const businessTerms = ['revenue', 'profit', 'growth', 'strategy', 'market', 'customer'];
    businessTerms.forEach(term => {
      if (queryLower.includes(term) && docText.includes(term)) {
        relevanceScore += 0.1;
      }
    });

    return Math.min(relevanceScore, 1);
  }
}

const aiService = new AIService();
export default aiService;