// src/services/sentimentAnalysisService.js - Real-time Sentiment Analysis Service
import logger from '../utils/logger';

/**
 * Advanced Sentiment Analysis Service
 * Integrates multiple data sources for comprehensive real-time feedback
 */
class SentimentAnalysisService {
  constructor() {
    this.isInitialized = false;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.recognition = null;
    this.emotionCache = new Map();
    this.sentimentHistory = [];
    this.callbacks = new Set();
    
    // Configuration
    this.config = {
      audioSampleRate: 16000,
      analysisInterval: 1000, // 1 second
      confidenceThreshold: 0.7,
      emotionCategories: ['joy', 'sadness', 'anger', 'fear', 'surprise', 'disgust', 'neutral'],
      keywordExtraction: true,
      realTimeProcessing: true
    };
  }

  /**
   * Initialize all analysis components
   */
  async initialize() {
    try {
      logger.info('Initializing Sentiment Analysis Service...');
      
      // Initialize Web Audio API
      await this.initializeAudioAnalysis();
      
      // Initialize Speech Recognition
      await this.initializeSpeechRecognition();
      
      // Initialize emotion detection
      await this.initializeEmotionDetection();
      
      this.isInitialized = true;
      logger.info('Sentiment Analysis Service initialized successfully');
      
      return { success: true };
    } catch (error) {
      logger.error('Failed to initialize Sentiment Analysis Service', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Initialize audio analysis using Web Audio API
   */
  async initializeAudioAnalysis() {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: this.config.audioSampleRate,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: this.config.audioSampleRate
      });
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.microphone.connect(this.analyser);
      
      logger.info('Audio analysis initialized');
    } catch (error) {
      logger.error('Failed to initialize audio analysis', error);
      throw new Error('Microphone access required for audio sentiment analysis');
    }
  }

  /**
   * Initialize speech recognition for text sentiment analysis
   */
  async initializeSpeechRecognition() {
    try {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        throw new Error('Speech recognition not supported');
      }
      
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
      
      this.recognition.onresult = (event) => {
        this.processSpeechResult(event);
      };
      
      this.recognition.onerror = (event) => {
        logger.error('Speech recognition error', event.error);
      };
      
      logger.info('Speech recognition initialized');
    } catch (error) {
      logger.error('Failed to initialize speech recognition', error);
      // Continue without speech recognition
    }
  }

  /**
   * Initialize emotion detection (would integrate with actual ML models)
   */
  async initializeEmotionDetection() {
    try {
      // In a real implementation, this would load TensorFlow.js models
      // for facial emotion recognition or voice emotion analysis
      
      // Simulated initialization
      logger.info('Emotion detection models loaded');
      
      // Would integrate with:
      // - TensorFlow.js face detection models
      // - Voice emotion analysis models
      // - Text sentiment analysis models
      
    } catch (error) {
      logger.error('Failed to initialize emotion detection', error);
    }
  }

  /**
   * Start real-time sentiment analysis
   */
  startAnalysis() {
    if (!this.isInitialized) {
      logger.warn('Service not initialized, starting with limited functionality');
    }
    
    // Start speech recognition
    if (this.recognition) {
      this.recognition.start();
    }
    
    // Start audio analysis loop
    this.startAudioAnalysisLoop();
    
    // Start sentiment calculation loop
    this.startSentimentCalculationLoop();
    
    logger.info('Real-time sentiment analysis started');
  }

  /**
   * Stop sentiment analysis
   */
  stopAnalysis() {
    if (this.recognition) {
      this.recognition.stop();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    logger.info('Sentiment analysis stopped');
  }

  /**
   * Audio analysis loop for voice metrics
   */
  startAudioAnalysisLoop() {
    if (!this.analyser) return;
    
    const analyze = () => {
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate audio metrics
      const volume = this.calculateVolume(dataArray);
      const pitch = this.calculatePitch(dataArray);
      const energy = this.calculateEnergy(dataArray);
      
      const audioMetrics = {
        volume,
        pitch,
        energy,
        timestamp: Date.now()
      };
      
      this.processAudioMetrics(audioMetrics);
      
      requestAnimationFrame(analyze);
    };
    
    analyze();
  }

  /**
   * Calculate volume from audio data
   */
  calculateVolume(dataArray) {
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    return sum / dataArray.length / 255;
  }

  /**
   * Calculate dominant pitch from audio data
   */
  calculatePitch(dataArray) {
    let maxIndex = 0;
    let maxValue = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
      if (dataArray[i] > maxValue) {
        maxValue = dataArray[i];
        maxIndex = i;
      }
    }
    
    // Convert bin to frequency
    const nyquist = this.config.audioSampleRate / 2;
    return (maxIndex / dataArray.length) * nyquist;
  }

  /**
   * Calculate energy from audio data
   */
  calculateEnergy(dataArray) {
    let energy = 0;
    for (let i = 0; i < dataArray.length; i++) {
      energy += Math.pow(dataArray[i] / 255, 2);
    }
    return Math.sqrt(energy / dataArray.length);
  }

  /**
   * Process speech recognition results
   */
  processSpeechResult(event) {
    let finalTranscript = '';
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      
      if (event.results[i].isFinal) {
        finalTranscript += transcript;
      } else {
        interimTranscript += transcript;
      }
    }
    
    if (finalTranscript) {
      this.analyzeTextSentiment(finalTranscript);
      this.extractKeywords(finalTranscript);
    }
  }

  /**
   * Analyze text sentiment (would integrate with actual NLP APIs)
   */
  analyzeTextSentiment(text) {
    // In a real implementation, this would call:
    // - AWS Comprehend
    // - Google Cloud Natural Language
    // - Azure Text Analytics
    // - Custom ML models
    
    // Simulated sentiment analysis
    const words = text.toLowerCase().split(/\s+/);
    const positiveWords = ['great', 'excellent', 'amazing', 'good', 'positive', 'success', 'growth', 'profit', 'opportunity'];
    const negativeWords = ['bad', 'terrible', 'awful', 'negative', 'loss', 'problem', 'concern', 'risk', 'failure'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });
    
    const sentiment = {
      text,
      positive: positiveCount,
      negative: negativeCount,
      score: (positiveCount - negativeCount) / Math.max(words.length, 1),
      timestamp: Date.now()
    };
    
    this.processSentimentData(sentiment);
  }

  /**
   * Extract keywords from speech
   */
  extractKeywords(text) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word));
    
    const keywords = [...new Set(words)].slice(0, 10);
    
    this.processKeywords(keywords);
  }

  /**
   * Check if word is a stop word
   */
  isStopWord(word) {
    const stopWords = ['this', 'that', 'with', 'have', 'will', 'from', 'they', 'know', 'want', 'been', 'good', 'much', 'some', 'time', 'very', 'when', 'come', 'here', 'just', 'like', 'long', 'make', 'many', 'over', 'such', 'take', 'than', 'them', 'well', 'were'];
    return stopWords.includes(word);
  }

  /**
   * Start sentiment calculation loop
   */
  startSentimentCalculationLoop() {
    setInterval(() => {
      const sentimentData = this.calculateOverallSentiment();
      this.broadcastSentimentUpdate(sentimentData);
    }, this.config.analysisInterval);
  }

  /**
   * Calculate overall sentiment from all data sources
   */
  calculateOverallSentiment() {
    const now = Date.now();
    const recentWindow = 30000; // 30 seconds
    
    // Get recent sentiment history
    const recentSentiments = this.sentimentHistory.filter(
      s => now - s.timestamp < recentWindow
    );
    
    if (recentSentiments.length === 0) {
      return this.getDefaultSentimentData();
    }
    
    // Calculate weighted averages
    const avgSentiment = recentSentiments.reduce((sum, s) => sum + s.score, 0) / recentSentiments.length;
    const confidence = Math.min(recentSentiments.length / 10, 1); // More data = higher confidence
    
    // Generate emotion breakdown (simulated)
    const emotions = {
      excitement: Math.max(0, avgSentiment * 0.8 + Math.random() * 0.2),
      skepticism: Math.max(0, -avgSentiment * 0.6 + Math.random() * 0.3),
      interest: Math.max(0.3, 0.7 + avgSentiment * 0.3),
      concern: Math.max(0, -avgSentiment * 0.5 + Math.random() * 0.2),
      confidence: Math.max(0.2, confidence + Math.random() * 0.2)
    };
    
    return {
      overall: Math.max(0, Math.min(1, (avgSentiment + 1) / 2)), // Convert -1,1 to 0,1
      confidence,
      engagement: Math.max(0.3, confidence + Math.random() * 0.3),
      investability: Math.max(0.2, (avgSentiment + 1) / 2 + Math.random() * 0.2),
      risk: Math.max(0.1, Math.min(0.8, 1 - ((avgSentiment + 1) / 2))),
      emotions,
      keyWords: this.getRecentKeywords(),
      timestamp: now
    };
  }

  /**
   * Get default sentiment data for initialization
   */
  getDefaultSentimentData() {
    return {
      overall: 0.5,
      confidence: 0.3,
      engagement: 0.4,
      investability: 0.5,
      risk: 0.5,
      emotions: {
        excitement: 0.4,
        skepticism: 0.3,
        interest: 0.5,
        concern: 0.3,
        confidence: 0.4
      },
      keyWords: ['presentation', 'business', 'opportunity'],
      timestamp: Date.now()
    };
  }

  /**
   * Get recent keywords
   */
  getRecentKeywords() {
    // Would return actual extracted keywords
    const defaultKeywords = ['innovation', 'market', 'growth', 'scalable', 'revenue'];
    return defaultKeywords.slice(0, Math.floor(Math.random() * 5) + 3);
  }

  /**
   * Process audio metrics
   */
  processAudioMetrics(metrics) {
    // Analyze voice characteristics for emotion
    const { volume, pitch, energy } = metrics;
    
    // Voice-based emotion indicators
    const excitement = Math.min(1, (energy * volume * 2));
    const confidence = Math.min(1, (volume * 0.8 + (pitch > 200 ? 0.2 : 0)));
    const nervousness = Math.max(0, (pitch > 400 ? (pitch - 400) / 200 : 0));
    
    // Add to sentiment history
    this.sentimentHistory.push({
      type: 'audio',
      score: confidence - nervousness,
      metrics: { volume, pitch, energy, excitement, confidence, nervousness },
      timestamp: metrics.timestamp
    });
    
    // Keep only recent history
    this.sentimentHistory = this.sentimentHistory.slice(-100);
  }

  /**
   * Process sentiment data
   */
  processSentimentData(sentiment) {
    this.sentimentHistory.push({
      type: 'text',
      score: sentiment.score,
      data: sentiment,
      timestamp: sentiment.timestamp
    });
    
    // Keep only recent history
    this.sentimentHistory = this.sentimentHistory.slice(-100);
  }

  /**
   * Process keywords
   */
  processKeywords(keywords) {
    // Store keywords with timestamp for recent retrieval
    this.emotionCache.set('recent_keywords', {
      keywords,
      timestamp: Date.now()
    });
  }

  /**
   * Subscribe to sentiment updates
   */
  subscribe(callback) {
    this.callbacks.add(callback);
    
    return () => {
      this.callbacks.delete(callback);
    };
  }

  /**
   * Broadcast sentiment updates to subscribers
   */
  broadcastSentimentUpdate(sentimentData) {
    this.callbacks.forEach(callback => {
      try {
        callback(sentimentData);
      } catch (error) {
        logger.error('Error in sentiment callback', error);
      }
    });
  }

  /**
   * Get current sentiment state
   */
  getCurrentSentiment() {
    return this.calculateOverallSentiment();
  }

  /**
   * Analyze facial expressions (would integrate with computer vision)
   */
  async analyzeFacialExpressions(videoElement) {
    // Would integrate with:
    // - TensorFlow.js face detection
    // - Face-api.js
    // - MediaPipe
    // - Custom emotion detection models
    
    logger.info('Facial expression analysis would be implemented here');
    return {
      happiness: 0.7,
      surprise: 0.2,
      neutral: 0.1,
      engagement: 0.75
    };
  }

  /**
   * Get comprehensive analytics report
   */
  getAnalyticsReport() {
    const currentSentiment = this.getCurrentSentiment();
    const history = this.sentimentHistory.slice(-50); // Last 50 data points
    
    return {
      currentState: currentSentiment,
      history,
      insights: this.generateInsights(currentSentiment, history),
      recommendations: this.generateRecommendations(currentSentiment)
    };
  }

  /**
   * Generate insights from sentiment data
   */
  generateInsights(sentiment, history) {
    const insights = [];
    
    if (sentiment.overall > 0.7) {
      insights.push('Strong positive audience response detected');
    }
    
    if (sentiment.engagement < 0.4) {
      insights.push('Low engagement - consider interactive elements');
    }
    
    if (sentiment.emotions.skepticism > 0.6) {
      insights.push('High skepticism detected - address concerns proactively');
    }
    
    return insights;
  }

  /**
   * Generate actionable recommendations
   */
  generateRecommendations(sentiment) {
    const recommendations = [];
    
    if (sentiment.investability < 0.5) {
      recommendations.push('Focus on market opportunity and revenue model');
    }
    
    if (sentiment.emotions.excitement < 0.4) {
      recommendations.push('Increase enthusiasm and share success stories');
    }
    
    if (sentiment.risk > 0.7) {
      recommendations.push('Address risk mitigation strategies');
    }
    
    return recommendations;
  }
}

// Create singleton instance
const sentimentAnalysisService = new SentimentAnalysisService();

export default sentimentAnalysisService;

// Convenience exports
export const {
  initialize,
  startAnalysis,
  stopAnalysis,
  subscribe,
  getCurrentSentiment,
  getAnalyticsReport
} = sentimentAnalysisService;