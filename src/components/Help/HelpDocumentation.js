// src/components/Help/HelpDocumentation.js
import React, { useState, useEffect } from 'react';
import { 
  X, Search, Book, MessageSquare, Users, Building, Waves, 
  Trophy, FileText, Settings, Timer, Volume2, Mic, Shield,
  ChevronRight, HelpCircle, Lightbulb, Zap
} from 'lucide-react';
import { useHelp } from './HelpProvider';

export default function HelpDocumentation() {
  const { isHelpOpen, helpSection, closeHelp } = useHelp();
  const [activeSection, setActiveSection] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (helpSection) {
      setActiveSection(helpSection);
    }
  }, [helpSection]);

  if (!isHelpOpen) return null;

  const helpSections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: Lightbulb,
      content: `
        # Welcome to V30 AI Board of Advisors! 🚀

        Your AI Board of Advisors is designed to help you make better business decisions by providing expert insights from world-class advisors including Mark Cuban, Jason Calacanis, and other industry leaders.

        ## Quick Start Guide

        ### 1. First Steps
        - **Upload Documents**: Use the document panel to upload business plans, financial statements, or any relevant documents
        - **Select Advisors**: Choose from our celebrity and expert advisors based on your needs
        - **Choose Environment**: Pick the right meeting environment for your discussion

        ### 2. Meeting Environments
        Our platform offers 4 unique meeting experiences:

        **📱 Standard Chat**: Perfect for casual conversations and quick questions
        - Best for: General advice, brainstorming, quick consultations
        - Default advisors: Your last selected advisors

        **🏢 Board Room**: Professional, formal meeting atmosphere
        - Best for: Strategic planning, major decisions, quarterly reviews
        - Includes: Meeting minutes, formal discussion structure
        - Default advisors: Your last board room selection

        **🦈 Shark Tank**: High-pressure investor pitch environment
        - Best for: Pitch practice, investment discussions, deal negotiations
        - Features: Configurable timer (1-20 minutes), tension meter, entrepreneur perspective
        - Default advisors: All 7 shark advisors (Mark Cuban, Jason Calacanis, etc.)

        **⭐ Enhanced Meeting**: Advanced features from previous versions
        - Best for: Complex analysis, recorded sessions, custom workflows
        - Includes: Advanced analytics, recording features, custom workflows

        ### 3. Your First Meeting
        1. Click on "AI Board Meeting" in the sidebar
        2. Select your preferred meeting environment
        3. Choose your advisors using the "Advisors" button in the environment selector
        4. Upload any relevant documents
        5. Start your conversation!

        ## Privacy & Security 🛡️
        - **Your data is yours**: We don't store, access, or peek at your documents or conversations
        - **Local processing**: Documents are processed locally when possible
        - **No training**: Your conversations are never used to train AI models
        - **Immediate deletion**: Server-processed documents are deleted immediately after analysis
      `
    },
    {
      id: 'environments',
      title: 'Meeting Environments',
      icon: Building,
      content: `
        # Meeting Environments Guide 🎭

        Each environment is designed to create the perfect atmosphere for different types of business discussions.

        ## 📱 Standard Chat
        **When to use**: Casual conversations, quick questions, brainstorming

        **Features**:
        - Clean, distraction-free interface
        - Voice input and output controls
        - Document upload and reference
        - Real-time conversation

        **Best Practices**:
        - Ask specific questions for better responses
        - Reference uploaded documents for context
        - Use follow-up questions to dive deeper

        ## 🏢 Board Room Environment
        **When to use**: Strategic planning, formal presentations, major decisions

        **Features**:
        - Professional board table visualization
        - Advisors positioned around the table
        - Meeting duration tracking
        - Formal atmosphere with wood paneling and professional lighting
        - Meeting protocol hints

        **Advisor Positioning**: Advisors are arranged around a virtual board table with the CEO position (you) at the head.

        **Best Practices**:
        - Prepare an agenda before starting
        - Present information systematically
        - Ask for formal recommendations
        - Take notes on key decisions

        ## 🦈 Shark Tank Environment
        **When to use**: Pitch practice, investment discussions, deal negotiations

        **Features**:
        - **Timer System**: Configurable 1-20 minute countdown
        - **Tension Meter**: Visual pressure indicator that increases over time
        - **Shark Positioning**: Semi-circle arrangement facing your stage position
        - **Dynamic Personalities**: 
          - Mark Cuban: Aggressive, direct feedback
          - Jason Calacanis: Educational, detailed analysis
          - Other sharks with unique personalities
        - **Stage Lighting**: Dramatic spotlight on entrepreneur position
        - **Entrepreneur Perspective**: You're on stage looking at the sharks

        **Default Advisors**: Automatically includes all 7 shark advisors who specialize in entrepreneurship and investing.

        **Best Practices**:
        - Start with a strong hook in the first 30 seconds
        - Know your numbers cold
        - Be prepared for tough questions
        - Practice your pitch multiple times
        - Handle objections confidently

        **Timer Tips**:
        - 2-3 minutes: Elevator pitch
        - 5-7 minutes: Full pitch presentation
        - 10-15 minutes: Detailed discussion
        - 20 minutes: Full due diligence conversation

        ## ⭐ Enhanced Meeting
        **When to use**: Complex analysis, recorded sessions, advanced workflows

        **Features**:
        - Advanced analytics and insights
        - Session recording capabilities
        - Custom workflow integration
        - Enhanced document analysis
        - Cross-reference capabilities

        **Best Practices**:
        - Use for quarterly reviews
        - Complex strategic planning
        - Multi-document analysis
        - Long-term planning sessions

        ## Switching Environments Mid-Conversation
        You can change environments at any time during a conversation. Your chat history will be preserved, but the atmosphere and available features will change to match your new environment.
      `
    },
    {
      id: 'advisors',
      title: 'AI Advisors',
      icon: Users,
      content: `
        # Your AI Advisory Board 👥

        Our AI advisors are based on real-world experts and celebrities, each with unique personalities, expertise areas, and communication styles.

        ## Celebrity Advisors ⭐

        ### Mark Cuban
        - **Specialty**: Entrepreneurship, Deal-making, Technology
        - **Style**: Direct, aggressive, numbers-focused
        - **Catchphrases**: "Here's the deal...", "Sales cure everything"
        - **Best for**: Startup advice, investment decisions, sales strategy

        ### Jason Calacanis
        - **Specialty**: Angel investing, Startups, Media
        - **Style**: Educational, detailed, analytical
        - **Best for**: Early-stage advice, fundraising, product development

        ### Sheryl Sandberg
        - **Specialty**: Leadership, Operations, Growth
        - **Style**: Strategic, empowering, systematic
        - **Best for**: Leadership development, operational excellence, scaling teams

        ### Satya Nadella
        - **Specialty**: Technology, Digital transformation, Leadership
        - **Style**: Thoughtful, inclusive, innovation-focused
        - **Best for**: Tech strategy, digital transformation, organizational culture

        ### Marc Benioff
        - **Specialty**: SaaS, Customer success, Corporate social responsibility
        - **Style**: Visionary, customer-centric, values-driven
        - **Best for**: SaaS business models, customer success, company culture

        ### Reid Hoffman
        - **Specialty**: Network effects, Platform businesses, Venture capital
        - **Style**: Strategic, network-thinking, long-term focused
        - **Best for**: Platform strategies, networking, long-term planning

        ### Ruth Porat
        - **Specialty**: Finance, Investment banking, Corporate strategy
        - **Style**: Analytical, precise, risk-aware
        - **Best for**: Financial planning, risk assessment, corporate strategy

        ## Advisor Selection Tips

        ### For Shark Tank Mode
        **Auto-Selected**: All shark advisors are included by default
        **Why**: Creates authentic pitch environment with multiple investor perspectives
        **Customization**: You can add/remove specific sharks based on your industry

        ### For Board Room Mode  
        **Default**: Your last used board room advisors
        **Recommendation**: 3-5 advisors for focused discussion
        **Mix**: Combine different expertise areas (finance, operations, marketing, etc.)

        ### For Standard Chat
        **Default**: Your last used chat advisors  
        **Recommendation**: 1-3 advisors for intimate conversation
        **Focus**: Choose advisors most relevant to your current challenge

        ### For Enhanced Meeting
        **Default**: Broader selection of advisors
        **Best Practice**: Include diverse perspectives for comprehensive analysis

        ## Advisor Interaction Tips

        ### Getting the Best Advice
        1. **Be Specific**: "How should I price my SaaS product?" vs "Help with pricing"
        2. **Provide Context**: Share relevant documents and background
        3. **Ask Follow-ups**: Dig deeper into responses
        4. **Challenge Assumptions**: Ask "What if..." questions

        ### Working with Different Personalities
        - **Mark Cuban**: Be prepared with hard numbers and revenue projections
        - **Jason Calacanis**: Ask about market analysis and competitive positioning  
        - **Sheryl Sandberg**: Discuss team dynamics and operational challenges
        - **Satya Nadella**: Focus on innovation and technology strategy

        ## Managing Your Advisory Board
        - **All/None Toggle**: Quickly select or deselect all advisors
        - **Environment Persistence**: Each environment remembers your advisor preferences
        - **Celebrity Indicators**: ⭐ marks celebrity advisors in selection lists
        - **Expertise Tags**: Advisors are tagged with their specialty areas
      `
    },
    {
      id: 'documents',
      title: 'Document Management',
      icon: FileText,
      content: `
        # Document Management 📄

        Upload and analyze your business documents to get contextual advice from your AI advisors.

        ## Supported File Types
        - **PDF**: Business plans, reports, contracts
        - **Word Documents**: (.doc, .docx) Proposals, memos, documentation
        - **Excel/Sheets**: (.xls, .xlsx, .csv) Financial models, data analysis
        - **PowerPoint**: (.ppt, .pptx) Pitch decks, presentations
        - **Text Files**: (.txt) Notes, transcripts, simple documents
        - **Images**: (.jpg, .png) Charts, diagrams, screenshots

        ## Document Processing

        ### Local First Approach 🏠
        - Most documents are processed right in your browser
        - No upload to servers means maximum privacy
        - Instant analysis and insights
        - Your documents never leave your computer

        ### Server Processing (When Needed) ☁️
        - Complex documents may require server processing
        - Documents are processed and **immediately deleted**
        - No storage, no copies, no backups
        - Secure, encrypted transmission

        ## Document Analysis Features

        ### Automatic Analysis
        When you upload a document, the system automatically:
        - Extracts key information and themes
        - Identifies important metrics and data points
        - Generates summary and insights
        - Tags documents by content type
        - Creates cross-references between documents

        ### AI Advisor Integration
        - Advisors can reference your documents during conversations
        - Ask specific questions about document content
        - Get analysis from multiple advisor perspectives
        - Compare recommendations across documents

        ## Best Practices

        ### Before Uploading
        1. **Remove Sensitive Info**: While we don't store documents, remove unnecessary personal data
        2. **Check File Size**: Larger files take longer to process
        3. **Organize by Topic**: Group related documents together
        4. **Update Regularly**: Keep documents current for best advice

        ### During Meetings
        1. **Reference Specific Documents**: "Based on my financial projections..."
        2. **Ask Comparative Questions**: "Compare my pitch deck to industry standards"
        3. **Seek Document-Specific Advice**: "What would you change in my business plan?"
        4. **Cross-Reference**: "How do these numbers align with my market research?"

        ### Document Management Tips
        - **Meeting Context**: Documents added to meetings are available to all advisors
        - **Document Status**: Green checkmark means processed and ready
        - **Quick Access**: Click documents in the sidebar to add/remove from current meeting
        - **Privacy Indicator**: Red "processing" means temporary server analysis

        ## Document Security & Privacy 🔒

        ### What We Do
        - Process documents to extract insights
        - Provide analysis to your AI advisors
        - Enable contextual conversations
        - Respect your intellectual property

        ### What We Don't Do
        - Store your documents permanently
        - Share with third parties
        - Use for AI model training
        - Keep copies or backups
        - Access outside of processing

        ### You Control Everything
        - Choose which documents to include in meetings
        - Remove documents anytime
        - Clear document cache when needed
        - Export or download anytime

        ## Troubleshooting

        ### Upload Issues
        - **File too large**: Compress or split large files
        - **Unsupported format**: Convert to supported format
        - **Upload stuck**: Refresh browser and try again

        ### Processing Issues
        - **Taking too long**: Large or complex documents need more time
        - **Failed processing**: Try re-uploading or contact support
        - **Missing content**: Some file formats may not extract all content perfectly

        ### Privacy Concerns
        - All processing is secure and temporary
        - Documents are never permanently stored
        - You can verify deletion through browser developer tools
        - Contact support for any privacy questions
      `
    },
    {
      id: 'features',
      title: 'Features & Tools',
      icon: Zap,
      content: `
        # Features & Tools ⚡

        Discover all the powerful features that make your AI Advisory Board experience exceptional.

        ## Voice & Audio Features 🎤

        ### Voice Input
        - **Location**: Microphone icon in chat input area
        - **How to Use**: Click mic icon, speak your question, click again to stop
        - **Languages**: Supports multiple languages and accents
        - **Best Practices**: 
          - Speak clearly and at normal pace
          - Minimize background noise
          - Use for hands-free operation

        ### Voice Output 🔊
        - **Location**: Speaker icon next to microphone in chat
        - **Settings**: Control through main Settings panel
        - **Customization**: Choose voice types and speeds
        - **Auto-read**: AI responses can be read aloud automatically

        ## Meeting Environment Features

        ### Shark Tank Timer ⏱️
        - **Duration Options**: 1-20 minutes configurable
        - **Visual Indicators**: 
          - Green: Plenty of time
          - Yellow: Time running low (last minute)  
          - Red: Critical time (last 30 seconds)
        - **Tension Meter**: Increases pressure as time runs out
        - **Auto-alerts**: Sharks become more aggressive near time limit

        ### Board Room Atmosphere
        - **Professional Setting**: Wood-paneled conference room
        - **Advisor Positioning**: Strategic seating around board table
        - **Meeting Duration**: Automatic time tracking
        - **Formal Protocols**: Built-in meeting etiquette hints

        ### Environment Controls
        - **Atmosphere Toggle**: Hide/show environmental elements
        - **Spotlight Control**: Adjust stage lighting in Shark Tank
        - **Audio Controls**: Ambient sound management

        ## Document Intelligence 🧠

        ### Advanced Analysis
        - **Cross-Document**: Find connections between multiple documents
        - **Trend Analysis**: Identify patterns in financial data
        - **Risk Assessment**: Automatic risk identification
        - **Opportunity Mapping**: Spot business opportunities

        ### Smart Summaries
        - **Key Points**: Automatic extraction of important information
        - **Action Items**: Identify next steps and recommendations
        - **Question Generation**: Suggest questions to ask advisors
        - **Insight Highlighting**: Mark critical business insights

        ## Conversation Management 💬

        ### Auto-Save
        - **Real-time Backup**: Conversations saved as you chat
        - **Browser Storage**: Secure local storage
        - **Export Options**: Download as text, JSON, or formatted report
        - **Privacy**: Never stored on servers

        ### Conversation History
        - **Search**: Find past conversations by topic or advisor
        - **Categorization**: Automatically organize by business area
        - **Favorites**: Mark important conversations for quick access
        - **Archive**: Organize old conversations

        ### Export & Sharing
        - **Multiple Formats**: Text, PDF, structured data
        - **Custom Reports**: Generate business-ready summaries
        - **Privacy-Safe**: Remove sensitive data before sharing
        - **Team Access**: Share insights without revealing documents

        ## Personalization & Settings ⚙️

        ### App Preferences
        - **Default Page**: Choose your startup screen
        - **Theme Options**: Light, dark, or system preference
        - **Notification Settings**: Control app alerts and updates
        - **Auto-save**: Configure conversation backup behavior

        ### Advisor Preferences  
        - **Environment Memory**: Each environment remembers your advisor choices
        - **Quick Selection**: All/none toggles for fast advisor management
        - **Personality Settings**: Adjust advisor response styles
        - **Expertise Filtering**: Show only advisors relevant to your industry

        ### Privacy Controls
        - **Data Management**: View, export, or delete your data
        - **Processing Options**: Choose local vs server processing when available
        - **Conversation Privacy**: Control what gets saved and shared
        - **Document Security**: Manage document processing preferences

        ## Keyboard Shortcuts ⌨️

        ### Global Shortcuts
        - **⌘/Ctrl + K**: Open command palette
        - **⌘/Ctrl + /**: Toggle help documentation  
        - **⌘/Ctrl + E**: Switch between environments
        - **⌘/Ctrl + U**: Upload document
        - **⌘/Ctrl + Enter**: Send message

        ### Environment Shortcuts
        - **1**: Switch to Standard Chat
        - **2**: Switch to Board Room
        - **3**: Switch to Shark Tank  
        - **4**: Switch to Enhanced Meeting
        - **Space**: Start/stop Shark Tank timer
        - **A**: Toggle advisor selection panel

        ## Tips & Best Practices 💡

        ### Getting Better Advice
        1. **Be Specific**: Ask targeted questions rather than broad ones
        2. **Provide Context**: Share relevant background and constraints
        3. **Upload Documents**: Give advisors material to work with
        4. **Ask Follow-ups**: Dig deeper into interesting responses
        5. **Challenge Ideas**: Play devil's advocate with suggestions

        ### Optimizing Performance
        1. **Use Local Processing**: Keep sensitive documents on your device
        2. **Manage Document Size**: Compress large files for faster processing
        3. **Clear Cache**: Regularly clear conversation history for performance
        4. **Update Browser**: Keep your browser current for best experience

        ### Privacy Best Practices
        1. **Review Documents**: Remove unnecessary sensitive data before upload
        2. **Use Settings**: Configure privacy preferences in Settings panel
        3. **Regular Cleanup**: Periodically clear old conversations and documents
        4. **Understand Processing**: Know when documents stay local vs server processing
      `
    },
    {
      id: 'privacy',
      title: 'Privacy & Security',
      icon: Shield,
      content: `
        # Privacy & Security 🛡️

        Your privacy and data security are our top priorities. Here's everything you need to know about how we protect your information.

        ## Our Privacy Promise

        ### What We DON'T Do ❌
        - **Don't Store Your Documents**: Files are processed and immediately deleted
        - **Don't Keep Conversations**: Chat history stays in your browser only
        - **Don't Sell Data**: We're not in the advertising business
        - **Don't Train on Your Data**: Your information never improves our models
        - **Don't Share**: Your data never goes to third parties
        - **Don't Snoop**: We can't and don't read your private conversations

        ### What We DO ✅
        - **Process Temporarily**: Analyze documents only as long as needed
        - **Encrypt Everything**: All data transmission is encrypted
        - **Local First**: Process documents in your browser when possible
        - **Immediate Deletion**: Server-processed files deleted within seconds
        - **Transparent**: Clear about what happens to your data
        - **User Control**: You decide what to share and when

        ## Data Processing Explained

        ### Local Processing (Preferred) 🏠
        **What Happens**:
        - Documents processed entirely in your browser
        - No upload to servers
        - No network transmission of content
        - Instant analysis and results

        **When Used**:
        - Simple text documents
        - PDF files under 10MB
        - Basic spreadsheets
        - Most images and presentations

        **Benefits**:
        - Maximum privacy
        - Fastest processing
        - No internet required after initial load
        - Your data never leaves your device

        ### Server Processing (When Necessary) ☁️
        **What Happens**:
        - Document temporarily sent to secure servers
        - Processed using enterprise-grade security
        - Results returned to your browser
        - Original document immediately deleted

        **When Used**:
        - Complex financial models
        - Large presentations
        - Scanned documents requiring OCR
        - Multi-format document packages

        **Security Measures**:
        - End-to-end encryption
        - Immediate deletion after processing
        - No logging of document content
        - Secure data centers with SOC 2 compliance

        ## Your Data Rights

        ### Right to Know 📋
        - **What we have**: Email address and subscription status
        - **What we process**: Documents you choose to upload
        - **How long**: Documents processed and deleted within minutes
        - **Where**: Secure cloud infrastructure in your region

        ### Right to Control ⚙️
        - **Delete Account**: Remove all data instantly
        - **Export Data**: Download your conversation history
        - **Clear Cache**: Remove local browser data anytime
        - **Privacy Settings**: Control processing preferences

        ### Right to Portability 📤
        - **Export Conversations**: JSON, text, or formatted reports
        - **Download Insights**: Keep the value we've provided
        - **Data Format**: Standard formats for easy import elsewhere
        - **No Lock-in**: Your data belongs to you

        ## Security Measures

        ### Technical Security 🔧
        - **Encryption**: AES-256 encryption for all data
        - **Secure Transmission**: TLS 1.3 for all communications
        - **Access Controls**: Zero-knowledge architecture where possible
        - **Audit Trails**: Security monitoring without content access
        - **Regular Updates**: Continuous security improvements

        ### Infrastructure Security 🏗️
        - **SOC 2 Compliance**: Annual third-party security audits
        - **Data Centers**: Tier 1 facilities with physical security
        - **Backup Systems**: Secure, encrypted backups (metadata only)
        - **Incident Response**: Rapid response to any security events

        ### Privacy by Design 🎯
        - **Minimal Collection**: Only collect what's absolutely necessary
        - **Purpose Limitation**: Data used only for stated purposes
        - **Data Minimization**: Process and delete as quickly as possible
        - **User Control**: You decide what to share at each step

        ## AI Provider Privacy

        ### OpenAI Integration 🤖
        - **Data Usage**: Your queries may be processed by OpenAI
        - **Training**: OpenAI does not train on your data (as of API usage)
        - **Retention**: Queries deleted by OpenAI within 30 days
        - **Privacy Policy**: Subject to OpenAI's privacy terms

        ### Anthropic Integration 🤖
        - **Data Usage**: Your queries processed by Anthropic Claude
        - **Training**: Anthropic does not train on API customer data
        - **Retention**: Queries not stored permanently
        - **Privacy Policy**: Subject to Anthropic's privacy terms

        ## Best Practices for You

        ### Before Uploading Documents 📄
        1. **Remove Unnecessary Data**: Delete irrelevant personal information
        2. **Check File Contents**: Ensure no unintended sensitive data
        3. **Use Test Data**: Consider using sample data for initial testing
        4. **Understand Processing**: Know if your file will be processed locally or on servers

        ### During Conversations 💬
        1. **Be Mindful**: Remember AI conversations are not privileged communication
        2. **Avoid Sharing**: Don't include Social Security numbers, passwords, etc.
        3. **Context Only**: Share what's needed for good advice
        4. **Regular Cleanup**: Clear old conversations periodically

        ### General Privacy Tips 🔒
        1. **Strong Passwords**: Use unique, strong passwords for your account
        2. **Browser Security**: Keep your browser updated and secure
        3. **Network Safety**: Use secure networks, avoid public WiFi for sensitive work
        4. **Account Monitoring**: Monitor your account for any unusual activity

        ## Compliance & Standards

        ### Industry Standards 📋
        - **SOC 2 Type II**: Annual compliance audits
        - **GDPR**: European privacy regulation compliance
        - **CCPA**: California Consumer Privacy Act compliance
        - **HIPAA**: Healthcare privacy standards (where applicable)

        ### Transparency Reports 📊
        - **Zero**: Data requests fulfilled (we don't have data to share)
        - **Zero**: Documents permanently stored
        - **100%**: User control over their data
        - **<5 minutes**: Average document processing time

        ## Contact & Support

        ### Privacy Questions 📧
        - **General Privacy**: Review our Privacy Policy in Settings
        - **Data Requests**: Contact support for data access or deletion
        - **Security Concerns**: Immediate escalation for security issues
        - **Compliance Questions**: Legal team available for enterprise customers

        ### Incident Reporting 🚨
        If you believe there's been a security or privacy incident:
        1. Contact support immediately
        2. Provide details of the concern
        3. We'll investigate within 24 hours
        4. Full transparency on any confirmed issues

        ## Regular Updates

        We update our privacy practices regularly. Major changes will be communicated with reasonable notice, not sneaky 3 AM policy updates. Your trust is earned, not assumed.
      `
    }
  ];

  const filteredSections = helpSections.filter(section => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    const title = section.title.toLowerCase();
    const content = section.content.toLowerCase();
    
    // Split search query into individual words, filtering out common stop words
    const stopWords = ['and', 'or', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    const searchWords = query.split(/\s+/)
      .filter(word => word.length > 2) // Filter out very short words
      .filter(word => !stopWords.includes(word)); // Filter out stop words
    
    if (searchWords.length === 0) return true;
    
    // Check if any search words are found in either title or content
    return searchWords.some(word => 
      title.includes(word) || content.includes(word)
    );
  });

  const currentSection = helpSections.find(s => s.id === activeSection) || helpSections[0];

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={closeHelp}
    >
      <div 
        className="bg-white rounded-xl max-w-7xl w-full h-[90vh] flex overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Help & Support</h2>
              <button
                onClick={closeHelp}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search help topics..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Reset to first filtered section when searching
                  if (e.target.value.trim()) {
                    const filtered = helpSections.filter(section => {
                      const query = e.target.value.toLowerCase();
                      const title = section.title.toLowerCase();
                      const content = section.content.toLowerCase();
                      
                      const stopWords = ['and', 'or', 'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
                      const searchWords = query.split(/\s+/)
                        .filter(word => word.length > 2)
                        .filter(word => !stopWords.includes(word));
                      
                      if (searchWords.length === 0) return true;
                      
                      return searchWords.some(word => 
                        title.includes(word) || content.includes(word)
                      );
                    });
                    
                    if (filtered.length > 0) {
                      setActiveSection(filtered[0].id);
                    }
                  }
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Search Results Indicator */}
            {searchQuery.trim() && (
              <div className="mt-2 text-xs text-gray-600">
                {filteredSections.length} section{filteredSections.length !== 1 ? 's' : ''} found
                {searchQuery.length > 0 && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-blue-600 hover:text-blue-700 underline"
                  >
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto p-2">
            {filteredSections.map(section => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg mb-1 text-left transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-medium">{section.title}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <currentSection.icon className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">{currentSection.title}</h1>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="prose prose-blue max-w-none">
              {currentSection.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return (
                    <h1 key={index} className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                      {line.substring(2)}
                    </h1>
                  );
                }
                if (line.startsWith('## ')) {
                  return (
                    <h2 key={index} className="text-2xl font-semibold text-gray-800 mt-8 mb-4">
                      {line.substring(3)}
                    </h2>
                  );
                }
                if (line.startsWith('### ')) {
                  return (
                    <h3 key={index} className="text-xl font-semibold text-gray-700 mt-6 mb-3">
                      {line.substring(4)}
                    </h3>
                  );
                }
                if (line.startsWith('#### ')) {
                  return (
                    <h4 key={index} className="text-lg font-semibold text-gray-600 mt-4 mb-2">
                      {line.substring(5)}
                    </h4>
                  );
                }
                if (line.startsWith('- ') || line.startsWith('* ')) {
                  return (
                    <li key={index} className="text-gray-700 mb-1">
                      {line.substring(2)}
                    </li>
                  );
                }
                if (line.match(/^\d+\. /)) {
                  return (
                    <li key={index} className="text-gray-700 mb-1">
                      {line.replace(/^\d+\. /, '')}
                    </li>
                  );
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <p key={index} className="font-semibold text-gray-800 mt-4 mb-2">
                      {line.substring(2, line.length - 2)}
                    </p>
                  );
                }
                if (line.trim() === '') {
                  return <br key={index} />;
                }
                return (
                  <p key={index} className="text-gray-700 mb-3 leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}