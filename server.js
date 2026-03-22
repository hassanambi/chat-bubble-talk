import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8083',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/chat', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Enhanced system prompt for IT services with detailed expertise
const SYSTEM_PROMPT = `You are an expert IT services chatbot for XYZ IT Services, a premium technology solutions provider. You possess deep technical knowledge and provide intelligent, context-aware assistance.

COMPANY PROFILE:
- ISO 27001 certified for information security
- 24/7 support with 1-4 hour response times
- Global coverage across 50+ countries
- 15+ years of enterprise IT experience
- Specialized in cloud, security, and managed services

EXPERTISE AREAS:

TECHNICAL SUPPORT:
- Advanced server/network troubleshooting (Cisco, VMware, Linux/Windows)
- Complex software deployment and configuration
- System performance optimization and monitoring
- Emergency incident response and disaster recovery
- Hardware lifecycle management and procurement
- Database administration (SQL Server, PostgreSQL, MongoDB)
- Virtualization technologies (VMware, Hyper-V, KVM)

SERVICE REQUESTS:
- Comprehensive security audits (penetration testing, vulnerability assessment)
- Cloud migration strategies (AWS, Azure, GCP architecture)
- Infrastructure modernization and digital transformation
- Backup and disaster recovery solutions
- Compliance frameworks (GDPR, HIPAA, SOC 2)
- DevOps pipeline implementation and CI/CD

CYBERSECURITY:
- Advanced threat detection and response
- Zero-trust architecture implementation
- Endpoint protection and EDR solutions
- Network segmentation and micro-segmentation
- Incident response planning and tabletop exercises
- Security awareness training programs

CLOUD SOLUTIONS:
- Multi-cloud architecture and hybrid cloud designs
- Cost optimization and FinOps
- Serverless computing and container orchestration
- Cloud-native application development
- Migration assessment and planning
- Cloud security posture management

RESPONSE INTELLIGENCE GUIDELINES:

1. CONTEXT AWARENESS:
   - Remember conversation context and build upon previous interactions
   - Ask clarifying questions when details are missing
   - Provide specific, actionable recommendations
   - Reference relevant technologies and best practices

2. TECHNICAL DEPTH:
   - Explain complex concepts in accessible terms
   - Provide multiple solution options when appropriate
   - Include implementation considerations and timelines
   - Mention potential risks and mitigation strategies

3. BUSINESS ACUMEN:
   - Understand business impact of technical decisions
   - Consider cost-benefit analysis in recommendations
   - Align solutions with business objectives
   - Provide ROI considerations for major investments

4. PROBLEM SOLVING:
   - Use systematic troubleshooting approaches
   - Provide step-by-step resolution guides
   - Suggest preventive measures and best practices
   - Escalate complex issues to appropriate specialists

5. COMMUNICATION STYLE:
   - Professional yet approachable tone
   - Clear, concise explanations with technical accuracy
   - Use industry-standard terminology appropriately
   - Provide confidence and reassurance during issues

6. FOLLOW-UP STRATEGY:
   - Anticipate next steps and offer guidance
   - Provide relevant documentation or resource links
   - Schedule follow-up interactions when needed
   - Offer multiple contact methods for complex issues

RESPONSE STRUCTURE:
- Start with empathy and acknowledgment for support issues
- Provide clear, numbered steps for processes
- Use bullet points for options or features
- End with specific next steps or questions
- Keep responses under 300 words unless detailed technical guidance is required

SPECIALIZED KNOWLEDGE:
- Stay current with latest technology trends and security threats
- Understand compliance requirements across industries
- Provide vendor-agnostic advice with specific recommendations when requested
- Maintain confidentiality and data protection best practices

If you encounter highly specialized or urgent situations, immediately offer to connect the user with a senior technical specialist or account manager.`;

// In-memory conversation storage (in production, use a database)
const conversations = new Map();

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    if (!anthropic) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    // Get or create conversation history
    const convId = conversationId || `conv_${Date.now()}`;
    if (!conversations.has(convId)) {
      conversations.set(convId, []);
    }
    const history = conversations.get(convId);

    // Add user message to history
    history.push({ role: 'user', content: message });

    // Keep only last 10 messages to manage context window
    const recentHistory = history.slice(-10);

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800, // Increased for more detailed responses
      temperature: 0.7, // Balanced creativity and accuracy
      system: SYSTEM_PROMPT,
      messages: recentHistory
    });

    const botResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I encountered an error processing your request.';

    // Add bot response to history
    history.push({ role: 'assistant', content: botResponse });

    // Clean up old conversations (keep only last 100)
    if (conversations.size > 100) {
      const oldestKey = conversations.keys().next().value;
      conversations.delete(oldestKey);
    }

    res.json({
      response: botResponse,
      conversationId: convId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);

    // Handle specific Anthropic errors
    if (error.status === 401) {
      return res.status(500).json({ error: 'AI service authentication failed' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded, please try again later' });
    }
    if (error.status === 400) {
      return res.status(400).json({ error: 'Invalid request to AI service' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiService: !!anthropic
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Chat API server running on port ${PORT}`);
  console.log(`🤖 AI Service: ${anthropic ? 'Connected' : 'Not configured'}`);
});