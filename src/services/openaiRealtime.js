// src/services/openaiRealtime.js
import { EventEmitter } from 'events';

class OpenAIRealtimeService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.isConnected = false;
    this.isRecording = false;
    this.apiKey = null;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.audioContext = null;
    this.microphone = null;
    this.processor = null;
    this.conversationId = null;
    this.currentAdvisor = null;
    this.pendingVoiceCommands = [];
    
    // Voice command patterns for advisor management
    this.commandPatterns = {
      // Create advisor commands
      create: {
        patterns: [
          /create (?:a )?new advisor (?:named )?(.+)/i,
          /add (?:a )?new advisor (?:called )?(.+)/i,
          /make (?:a )?new advisor (?:named )?(.+)/i
        ],
        action: 'CREATE_ADVISOR'
      },
      
      // Edit advisor commands
      edit: {
        patterns: [
          /edit (?:the )?advisor (.+)/i,
          /modify (?:the )?advisor (.+)/i,
          /update (?:the )?advisor (.+)/i,
          /change (?:the )?advisor (.+)/i
        ],
        action: 'EDIT_ADVISOR'
      },
      
      // Delete advisor commands
      delete: {
        patterns: [
          /delete (?:the )?advisor (.+)/i,
          /remove (?:the )?advisor (.+)/i,
          /get rid of (?:the )?advisor (.+)/i
        ],
        action: 'DELETE_ADVISOR'
      },
      
      // Field-specific updates
      updateName: {
        patterns: [
          /(?:change|set|update) (?:the )?name to (.+)/i,
          /rename (?:this|the advisor) to (.+)/i,
          /call (?:this|the advisor) (.+)/i
        ],
        action: 'UPDATE_FIELD',
        field: 'name'
      },
      
      updateRole: {
        patterns: [
          /(?:change|set|update) (?:the )?role to (.+)/i,
          /(?:change|set|update) (?:the )?title to (.+)/i,
          /make (?:this|the advisor) (?:a |an )?(.+)/i
        ],
        action: 'UPDATE_FIELD',
        field: 'role'
      },
      
      addExpertise: {
        patterns: [
          /add (?:the )?expertise (.+)/i,
          /add (?:the )?skill (?:of )?(.+)/i,
          /include (?:the )?expertise (?:in )?(.+)/i,
          /expert in (.+)/i
        ],
        action: 'ADD_EXPERTISE'
      },
      
      addTrait: {
        patterns: [
          /add (?:the )?trait (.+)/i,
          /add (?:the )?personality (?:trait )?(.+)/i,
          /(?:is|make them) (.+)/i
        ],
        action: 'ADD_TRAIT'
      },
      
      // Communication style
      setCommunicationStyle: {
        patterns: [
          /(?:change|set|update) (?:the )?communication style to (.+)/i,
          /make (?:them|the advisor) (?:more )?(.+)/i,
          /speak (?:in a )?(.+) (?:way|manner|style)/i
        ],
        action: 'UPDATE_FIELD',
        field: 'communication_style'
      },
      
      // General commands
      save: {
        patterns: [
          /save (?:the )?(?:advisor|changes)/i,
          /(?:that's|that is) (?:good|correct|right|perfect)/i,
          /(?:done|finished)/i
        ],
        action: 'SAVE_ADVISOR'
      },
      
      cancel: {
        patterns: [
          /cancel/i,
          /(?:never mind|nevermind)/i,
          /(?:go back|back)/i,
          /(?:abort|stop)/i
        ],
        action: 'CANCEL'
      },
      
      // Navigation commands
      selectAdvisor: {
        patterns: [
          /select (?:the )?advisor (.+)/i,
          /choose (?:the )?advisor (.+)/i,
          /work (?:on|with) (?:the )?advisor (.+)/i
        ],
        action: 'SELECT_ADVISOR'
      }
    };
  }

  // Initialize with API key
  async initialize(apiKey) {
    this.apiKey = apiKey;
    
    // Initialize audio context
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      await this.audioContext.resume();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
      throw new Error('Audio context initialization failed');
    }
  }

  // Connect to OpenAI Realtime API
  async connect() {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not provided');
    }

    try {
      // Get ephemeral token from our server endpoint
      console.log('Getting ephemeral token...');
      const tokenResponse = await fetch('/api/realtime-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apiKey: this.apiKey
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(`Failed to get ephemeral token: ${errorData.error || tokenResponse.statusText}`);
      }

      const tokenData = await tokenResponse.json();
      console.log('Got ephemeral token:', tokenData);

      if (!tokenData.client_secret) {
        throw new Error('No client_secret received from token endpoint');
      }

      // Connect using the ephemeral token
      const url = `wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-10-01`;
      
      this.ws = new WebSocket(url);
      this.ephemeralToken = tokenData.client_secret.value;

      this.ws.onopen = () => {
        console.log('OpenAI Realtime connected');
        this.isConnected = true;
        this.emit('connected');
        
        // Send session configuration with ephemeral token
        this.send({
          type: 'session.update',
          session: {
            modalities: ['text', 'audio'],
            instructions: `You are an AI assistant helping to manage AI advisors. 
              You can help create, edit, and manage advisor profiles through voice commands.
              When the user gives voice commands about advisor management, extract the relevant information and respond with structured data.
              Be conversational and helpful in guiding the user through advisor management tasks.`,
            voice: 'alloy',
            input_audio_format: 'pcm16',
            output_audio_format: 'pcm16',
            input_audio_transcription: {
              model: 'whisper-1'
            },
            turn_detection: {
              type: 'server_vad',
              threshold: 0.5,
              prefix_padding_ms: 300,
              silence_duration_ms: 200
            }
          }
        });
      };

      this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      };

      this.ws.onclose = () => {
        console.log('OpenAI Realtime disconnected');
        this.isConnected = false;
        this.emit('disconnected');
      };

      this.ws.onerror = (error) => {
        console.error('OpenAI Realtime error:', error);
        this.emit('error', error);
      };

    } catch (error) {
      console.error('Failed to connect to OpenAI Realtime:', error);
      throw error;
    }
  }

  // Disconnect from the service
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this.stopRecording();
    this.cleanup();
  }

  // Handle incoming messages
  handleMessage(message) {
    switch (message.type) {
      case 'session.created':
        console.log('Session created:', message.session);
        this.emit('sessionCreated', message.session);
        break;

      case 'input_audio_buffer.speech_started':
        this.emit('speechStarted');
        break;

      case 'input_audio_buffer.speech_stopped':
        this.emit('speechStopped');
        break;

      case 'conversation.item.input_audio_transcription.completed':
        const transcript = message.transcript;
        console.log('Transcript:', transcript);
        this.emit('transcript', transcript);
        this.processVoiceCommand(transcript);
        break;

      case 'response.audio.delta':
        // Handle audio response
        const audioDelta = message.delta;
        this.emit('audioResponse', audioDelta);
        break;

      case 'response.text.delta':
        const textDelta = message.delta;
        this.emit('textResponse', textDelta);
        break;

      case 'response.done':
        this.emit('responseComplete', message.response);
        break;

      case 'error':
        console.error('OpenAI Realtime API error:', message.error);
        this.emit('error', message.error);
        break;

      default:
        console.log('Unhandled message type:', message.type, message);
    }
  }

  // Process voice commands for advisor management
  processVoiceCommand(transcript) {
    const command = this.parseVoiceCommand(transcript);
    if (command) {
      console.log('Voice command detected:', command);
      this.emit('voiceCommand', command);
    }
  }

  // Parse voice command using patterns
  parseVoiceCommand(transcript) {
    const text = transcript.toLowerCase().trim();
    
    for (const [commandName, commandData] of Object.entries(this.commandPatterns)) {
      for (const pattern of commandData.patterns) {
        const match = text.match(pattern);
        if (match) {
          return {
            action: commandData.action,
            field: commandData.field,
            value: match[1]?.trim(),
            originalText: transcript,
            commandName
          };
        }
      }
    }
    
    return null;
  }

  // Start voice recording
  async startRecording() {
    if (this.isRecording) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      this.microphone = this.audioContext.createMediaStreamSource(stream);
      
      // Create audio processor for real-time streaming
      this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);
      
      this.processor.onaudioprocess = (event) => {
        if (!this.isRecording || !this.isConnected) return;
        
        const inputBuffer = event.inputBuffer;
        const inputData = inputBuffer.getChannelData(0);
        
        // Convert float32 to int16
        const pcmData = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          pcmData[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        
        // Send audio data to OpenAI
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
          this.send({
            type: 'input_audio_buffer.append',
            audio: base64Audio
          });
        }
      };

      this.microphone.connect(this.processor);
      this.processor.connect(this.audioContext.destination);
      
      this.isRecording = true;
      this.emit('recordingStarted');
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  // Stop voice recording
  stopRecording() {
    if (!this.isRecording) return;

    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }

    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }

    this.isRecording = false;
    this.emit('recordingStopped');

    // Commit audio buffer
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.send({
        type: 'input_audio_buffer.commit'
      });
    }
  }

  // Send message to OpenAI
  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Set current advisor context for voice commands
  setAdvisorContext(advisor) {
    this.currentAdvisor = advisor;
    this.emit('advisorContextSet', advisor);
  }

  // Get advisor context
  getAdvisorContext() {
    return this.currentAdvisor;
  }

  // Generate response for advisor management
  generateAdvisorResponse(prompt) {
    if (!this.isConnected) {
      throw new Error('Not connected to OpenAI Realtime API');
    }

    this.send({
      type: 'response.create',
      response: {
        modalities: ['text', 'audio'],
        instructions: `Help the user with advisor management. ${prompt}`,
      }
    });
  }

  // Cleanup resources
  cleanup() {
    this.stopRecording();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.currentAdvisor = null;
    this.pendingVoiceCommands = [];
  }
}

export const openaiRealtimeService = new OpenAIRealtimeService();
export default openaiRealtimeService;