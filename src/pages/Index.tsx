import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! How can I help you today? Please choose from the following options:\n\n🔧 **Technical Support**\n(e.g., \"My website is down—can you fix it?\", \"How do I recover my data?\")\n\n🎯 **Service Requests & Ticketing**\n(e.g., \"I need cybersecurity consulting\", \"Schedule a network audit\")\n\n❓ **FAQ Automation**\n(e.g., \"What's your pricing?\", \"Do you offer 24/7 support?\")\n\n💼 **Pre-Sales**\n(e.g., \"What services do you offer?\", \"Can you help with cloud migration?\")",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Enhanced bot responses for different service categories
  const botResponses: { [key: string]: string } = {
    // Technical Support responses
    "technical support": "I'm here to help with technical issues! Please describe your problem and I'll assist you with troubleshooting.",
    "website down": "I understand your website is experiencing issues. Let me help you troubleshoot this problem step by step.",
    "data recovery": "Data recovery is critical. I'll guide you through the recovery process and preventive measures.",
    "fix it": "I'm ready to help fix your technical issue. Can you provide more details about what's not working?",
    
    // Service Requests & Ticketing
    "service request": "I can help you with service requests. What specific service do you need assistance with?",
    "cybersecurity": "Cybersecurity is essential for your business. I can connect you with our security experts for a consultation.",
    "network audit": "A network audit is a great way to ensure your infrastructure is secure and optimized. Let me schedule this for you.",
    "ticketing": "I'll help you create a service ticket. What issue would you like to report?",
    
    // FAQ Automation
    "pricing": "Our pricing varies based on your specific needs. Would you like me to connect you with our sales team for a custom quote?",
    "24/7 support": "Yes, we offer 24/7 support for critical issues. Our response time varies by service level agreement.",
    "faq": "I'm here to answer your frequently asked questions. What would you like to know?",
    
    // Pre-Sales
    "services": "We offer a comprehensive range of IT services including cloud solutions, cybersecurity, technical support, and consulting.",
    "cloud migration": "Absolutely! We specialize in cloud migration services. I can connect you with our cloud experts to discuss your requirements.",
    "pre-sales": "I'm here to help with any pre-sales questions. What would you like to know about our services?",
    
    // General responses
    "hi": "Hello! Please let me know which service category I can help you with today.",
    "hello": "Hi there! How can I assist you? Please choose from Technical Support, Service Requests, FAQ, or Pre-Sales.",
    "help": "I'm here to help! Please specify which area you need assistance with: Technical Support, Service Requests, FAQ, or Pre-Sales.",
    "bye": "Goodbye! Feel free to reach out anytime you need assistance with our services.",
    "thank you": "You're welcome! Is there anything else I can help you with today?"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase().trim();
    
    // Check for partial matches in the message
    for (const [key, response] of Object.entries(botResponses)) {
      if (lowerMessage.includes(key)) {
        return response;
      }
    }
    
    return "I'd be happy to help! Please let me know if you need Technical Support, Service Requests & Ticketing, FAQ information, or Pre-Sales assistance.";
  };

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: Date.now() + 1,
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white">
          <h1 className="text-xl font-semibold text-center">Chat Bot</h1>
          <p className="text-blue-100 text-sm text-center mt-1">Always here to help!</p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl transition-all duration-200 ${
                  message.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-gray-200 text-gray-800 rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-line">{message.text}</p>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-bl-md">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              disabled={isTyping}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isTyping}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:transform-none"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
