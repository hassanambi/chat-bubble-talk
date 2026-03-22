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

// System prompt for IT services
const SYSTEM_PROMPT = `You are a helpful IT services chatbot for XYZ IT Services. You provide professional, knowledgeable assistance for:

TECHNICAL SUPPORT:
- Server/network troubleshooting
- Software installation and configuration
- System diagnostics
- Emergency support
- Hardware issues

SERVICE REQUESTS:
- Network security audits
- Cloud migration (AWS/Azure)
- System maintenance
- Hardware upgrades
- Backup solutions

FAQ & GENERAL INFO:
- Response times (1-4 hours standard)
- SLA offerings
- Global coverage
- Pricing information
- Team expertise

PRE-SALES CONSULTING:
- Cloud solutions assessment
- Cybersecurity packages
- Managed IT services
- DevOps consulting
- Technology recommendations

Guidelines:
- Be professional, helpful, and concise
- Use bullet points for lists when appropriate
- Offer specific next steps when relevant
- If you don't know something, admit it and offer to connect to a specialist
- Keep responses under 200 words unless detailed explanation is needed
- Always maintain a friendly, customer-service oriented tone

The company is ISO 27001 certified and offers 24/7 support.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    if (!anthropic) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    });

    const botResponse = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I encountered an error processing your request.';

    res.json({
      response: botResponse,
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