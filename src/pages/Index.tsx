
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

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

  // Enhanced knowledge base for IT services
  const knowledgeBase: { [key: string]: { response: string; followup?: string[] } } = {
    // Technical Support
    "technical support": {
      response: "I can help with various technical issues:\n\n• Server/network troubleshooting\n• Software installation\n• System diagnostics\n• Emergency support\n\nPlease describe your issue.",
      followup: ["Server down", "Software issue", "Network problem", "Other"]
    },
    "server down": {
      response: "For server issues:\n\n1. Check power and network connections\n2. Verify server status via dashboard\n3. Review recent logs\n\nWould you like to open a priority ticket?"
    },
    "software issue": {
      response: "For software problems:\n\n• What software is affected?\n• Error message received?\n• When did it start occurring?\n\nWe can remote in to diagnose."
    },

    // Service Requests
    "service requests": {
      response: "Available services:\n\n• Network security audit\n• Cloud migration\n• System maintenance\n• Hardware upgrade\n\nWhich service do you need?",
      followup: ["Schedule audit", "Cloud migration", "Maintenance", "Upgrade quote"]
    },
    "schedule audit": {
      response: "Our security audits include:\n\n• Vulnerability assessment\n• Penetration testing\n• Compliance review\n\nI can connect you to our security team."
    },

    // FAQ
    "faq": {
      response: "Frequently asked questions:\n\n• What's your response time? (1-4 hours)\n• Do you offer SLAs? (Yes)\n• What regions do you cover? (Worldwide)\n\nWhat would you like to know?",
      followup: ["Pricing", "Support hours", "Technologies", "Team expertise"]
    },
    "pricing": {
      response: "Our pricing depends on:\n\n• Service level (Basic/Premium)\n• Systems covered\n• Response time\n\nWould you like a custom quote?"
    },

    // Pre-Sales
    "pre-sales": {
      response: "We specialize in:\n\n• Cloud solutions (AWS/Azure)\n• Cybersecurity\n• Managed IT services\n• DevOps consulting\n\nWhat are you interested in?",
      followup: ["Cloud services", "Security packages", "Managed IT", "Consulting"]
    },
    "cloud services": {
      response: "Our cloud offerings include:\n\n• Migration planning\n• Cost optimization\n• Architecture review\n• 24/7 monitoring\n\nLet me connect you to our cloud team."
    },

    // General
    "hi": {
      response: "Hello! How can I assist with your IT needs today?",
      followup: IT_SERVICE_CATEGORIES
    },
    "help": {
      response: "I can help with:",
      followup: IT_SERVICE_CATEGORIES
    },
    "bye": {
      response: "Thank you for contacting XYZ IT Services! Our team is available 24/7 if you need further assistance."
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): Message => {
    const lowerMessage = userMessage.toLowerCase();
    let response: Message = {
      id: Date.now() + 1,
      text: "",
      sender: 'bot',
      timestamp: new Date()
    };

    // Check for direct matches first
    for (const [key, data] of Object.entries(knowledgeBase)) {
      if (lowerMessage.includes(key)) {
        response.text = data.response;
        if (data.followup) {
          response.isButton = true;
          response.buttons = data.followup;
        }
        return response;
      }
    }

    // Fallback response
    response.text = "I specialize in IT services. Please choose an option:";
    response.isButton = true;
    response.buttons = IT_SERVICE_CATEGORIES;
    return response;
  };

  const sendMessage = (text: string, isButtonClick = false) => {
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

    setTimeout(() => {
      const botResponse = getBotResponse(text);
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay for natural feel
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
            <div>
              <h1 className="text-lg font-semibold">XYZ IT Services</h1>
              <p className="text-blue-100 text-xs">
                {isTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
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
