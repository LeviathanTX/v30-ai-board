// src/services/aiService.js
class AIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
    this.apiUrl = 'https://api.anthropic.com/v1/messages';
  }

  async sendMessage(message, advisor, options = {}) {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured. Please check your environment variables.');
    }

    const { documents = [], conversationHistory = [], stream = false } = options;
    const systemPrompt = this.buildAdvisorPrompt(advisor);
    const documentContext = this.buildDocumentContext(documents);
    
    try {
      const messages = this.buildMessageHistory(conversationHistory, message, documentContext);
      
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
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
      console.error('AI Service Error:', error);
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
        console.error(`Error getting response from ${advisor.name}:`, error);
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
            console.error(`Error in round ${round} from ${advisor.name}:`, error);
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

    const basePrompt = `You are ${advisor.name}, ${advisor.role} on an AI Board of Advisors.

Your expertise: ${advisor.expertise?.join(', ') || 'Business strategy and operations'}
Your personality: ${advisor.personality?.traits?.join(', ') || 'Professional, insightful, and action-oriented'}
Communication style: ${advisor.personality?.communication_style || 'Clear and professional'}

Guidelines:
- Provide strategic advice based on your role and expertise
- Be concise but insightful (aim for 2-3 paragraphs)
- Focus on actionable recommendations
- Reference specific data from documents when available
- Consider different perspectives but speak from your expertise
- In board meetings, acknowledge other advisors' points when relevant`;

    // Add role-specific instructions
    const roleSpecificInstructions = {
      'CFO': '\nFocus on financial implications, ROI, budgets, and fiscal responsibility.',
      'CMO': '\nFocus on market positioning, customer experience, and brand strategy.',
      'Chief Strategy Officer': '\nFocus on long-term vision, competitive advantage, and strategic alignment.',
      'CTO': '\nFocus on technology implications, digital transformation, and technical feasibility.',
      'COO': '\nFocus on operational efficiency, process improvement, and execution.',
      'CHRO': '\nFocus on talent, culture, and organizational development.'
    };

    return basePrompt + (roleSpecificInstructions[advisor.role] || '');
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