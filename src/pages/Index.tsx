
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import Anthropic from '@anthropic-ai/sdk';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isButton?: boolean;
  buttons?: string[];
}

const IT_SERVICE_CATEGORIES = [
  "🔧 Technical Support",
  "🎯 Service Requests",
  "❓ FAQ",
  "💼 Pre-Sales"
];

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

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello, welcome to XYZ IT Services! How can I help you today?",
      sender: 'bot',
      timestamp: new Date(),
      isButton: true,
      buttons: IT_SERVICE_CATEGORIES
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Anthropic client
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  const anthropic = apiKey && apiKey !== 'your-actual-anthropic-api-key-here'
    ? new Anthropic({
        apiKey: apiKey,
        dangerouslyAllowBrowser: true
      })
    : null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = async (userMessage: string): Promise<Message> => {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    console.log('API Key configured:', !!apiKey, 'Key starts with:', apiKey?.substring(0, 20) + '...');

    // Check if API is configured
    if (!anthropic) {
      console.log('No anthropic client - using demo mode');
      return {
        id: Date.now() + 1,
        text: "🤖 Claude AI integration is not configured yet.\n\nTo enable AI-powered responses:\n\n1. Get an API key from https://console.anthropic.com/\n2. Update the VITE_ANTHROPIC_API_KEY in your .env file\n3. Refresh the page\n\nFor now, I'm operating in demo mode with basic responses.",
        sender: 'bot',
        timestamp: new Date(),
        isButton: true,
        buttons: IT_SERVICE_CATEGORIES
      };
    }

    try {
      console.log('Making Claude API call...');
      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      });

      console.log('Claude API response received');
      const botResponse: Message = {
        id: Date.now() + 1,
        text: response.content[0].type === 'text' ? response.content[0].text : 'I apologize, but I encountered an error processing your request.',
        sender: 'bot',
        timestamp: new Date()
      };

      // Add contextual buttons for certain topics
      const lowerMessage = userMessage.toLowerCase();
      if (lowerMessage.includes('technical') || lowerMessage.includes('support')) {
        botResponse.isButton = true;
        botResponse.buttons = ["Server down", "Software issue", "Network problem", "Hardware issue"];
      } else if (lowerMessage.includes('service') || lowerMessage.includes('request')) {
        botResponse.isButton = true;
        botResponse.buttons = ["Schedule audit", "Cloud migration", "Maintenance", "Upgrade quote"];
      } else if (lowerMessage.includes('faq') || lowerMessage.includes('question')) {
        botResponse.isButton = true;
        botResponse.buttons = ["Pricing", "Support hours", "Technologies", "Team expertise"];
      } else if (lowerMessage.includes('pre-sales') || lowerMessage.includes('sales')) {
        botResponse.isButton = true;
        botResponse.buttons = ["Cloud services", "Security packages", "Managed IT", "Consulting"];
      }

      return botResponse;
    } catch (error) {
      console.error('Claude API error:', error);
      // Fallback to basic responses when API fails
      return getFallbackResponse(userMessage);
    }
  };

  const getFallbackResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let response: Message = {
      id: Date.now() + 1,
      text: "",
      sender: 'bot',
      timestamp: new Date()
    };

    // Basic fallback responses
    if (lowerMessage.includes('technical') || lowerMessage.includes('support')) {
      response.text = "I can help with various technical issues including server troubleshooting, software installation, and system diagnostics. What specific issue are you experiencing?";
      response.isButton = true;
      response.buttons = ["Server down", "Software issue", "Network problem"];
    } else if (lowerMessage.includes('service') || lowerMessage.includes('request')) {
      response.text = "We offer network security audits, cloud migration, system maintenance, and hardware upgrades. Which service interests you?";
      response.isButton = true;
      response.buttons = ["Security audit", "Cloud migration", "Maintenance"];
    } else if (lowerMessage.includes('faq') || lowerMessage.includes('pricing')) {
      response.text = "Our response time is typically 1-4 hours. We offer SLA options and serve clients worldwide. Would you like a custom quote?";
    } else {
      response.text = "I'm here to help with your IT service needs. How can I assist you today?";
      response.isButton = true;
      response.buttons = IT_SERVICE_CATEGORIES;
    }

    return response;
  };

  const sendMessage = async (text: string, isButtonClick = false) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: isButtonClick ? text.replace(/[🔧🎯❓💼]/g, '').trim() : text,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    if (!isButtonClick) setInputValue('');
    setIsTyping(true);

    try {
      const botResponse = await getBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isTyping) {
      sendMessage(inputValue);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-800 p-4 text-white">
          <div className="flex items-center justify-center space-x-2">
            <div className="p-2 bg-blue-600 rounded-full">
              <Bot size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">XYZ IT Services</h1>
              <p className="text-blue-100 text-xs">
                {isTyping ? 'Typing...' : anthropic ? 'AI Powered' : 'Demo Mode'}
              </p>
            </div>
            <button
              onClick={() => {
                const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
                alert(`API Status:\n- Key configured: ${!!apiKey}\n- Client initialized: ${!!anthropic}\n- Key preview: ${apiKey?.substring(0, 20)}...\n\nCheck browser console for detailed logs.`);
              }}
              className="text-blue-200 hover:text-white text-xs underline"
              title="Check API status"
            >
              Debug
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                <div className={`mt-1 flex-shrink-0 rounded-full p-1.5 ${message.sender === 'user' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                  {message.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                </div>
                <div>
                  <div
                    className={`px-3 py-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.text}</p>
                  </div>
                  {message.isButton && message.buttons && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {message.buttons.map((button, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(button, true)}
                          className="text-xs px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full transition-colors"
                        >
                          {button}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg rounded-bl-none">
                <Loader2 size={16} className="animate-spin text-gray-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your IT question..."
              className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              disabled={isTyping}
            />
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-xl transition-colors disabled:transition-none"
            >
              {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            XYZ IT Services • 24/7 Support • ISO 27001 Certified
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
