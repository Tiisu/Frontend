import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles, Send, X, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import { callGeminiAPI } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';
import { ProjectData } from '@/lib/blockchain';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface AIChatProps {
  project?: ProjectData;
}

const AIChat: React.FC<AIChatProps> = ({ project }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = project 
        ? `👋 Hi there! I'm your AI assistant. I can help answer questions about "${project.title}" or any other academic projects. What would you like to know?`
        : "👋 Hi there! I'm your AI assistant. I can help you navigate the University Project Vault, find projects, or answer questions about academic research. How can I assist you today?";
      
      setMessages([
        {
          id: 'welcome',
          content: welcomeMessage,
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length, project]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Generate prompt based on context
      let prompt = '';
      
      if (project) {
        // If we have a project context, include it in the prompt
        prompt = `
          You are an AI assistant helping a user with questions about an academic project.
          
          Project Information:
          Title: ${project.title}
          Description: ${project.description}
          Year: ${project.year}
          
          Chat History:
          ${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}
          
          User's Question: ${inputValue}
          
          Please provide a helpful, accurate, and concise response. Format your answer using markdown for better readability.
          If you don't know the answer based on the provided information, acknowledge that and suggest what might be relevant.
        `;
      } else {
        // General assistance prompt
        prompt = `
          You are an AI assistant helping a user navigate the University Project Vault platform.
          
          About University Project Vault:
          - A platform for storing and sharing academic projects
          - Users can upload their projects, browse others' work, and get AI-powered insights
          - Projects can be filtered by department, year, and other criteria
          - The platform uses blockchain technology for secure project registration
          
          Chat History:
          ${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}
          
          User's Question: ${inputValue}
          
          Please provide a helpful, accurate, and concise response. Format your answer using markdown for better readability.
          Focus on being helpful for navigating the platform and understanding academic projects.
        `;
      }
      
      // Call Gemini API
      const response = await callGeminiAPI(prompt);
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
    if (isExpanded && !isOpen) {
      setIsExpanded(false);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(prev => !prev);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg bg-university-blue hover:bg-university-navy flex items-center justify-center"
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-[90vw] h-[80vh] max-w-4xl bottom-[10vh] right-[5vw]' : 'w-80 h-[500px]'}`}
    >
      <Card className="h-full flex flex-col shadow-xl border-university-blue/20">
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b">
          <CardTitle className="text-md font-medium flex items-center">
            <Sparkles className="h-4 w-4 text-university-gold mr-2" />
            AI Assistant
          </CardTitle>
          <div className="flex items-center space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={toggleExpand}
              aria-label={isExpanded ? "Minimize chat" : "Maximize chat"}
            >
              {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={toggleChat}
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-grow overflow-auto p-4 space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/ai-avatar.png" alt="AI" />
                  <AvatarFallback className="bg-university-gold text-white">AI</AvatarFallback>
                </Avatar>
              )}
              
              <div 
                className={`rounded-lg px-3 py-2 max-w-[80%] ${
                  message.role === 'user' 
                    ? 'bg-university-blue text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="prose prose-sm max-w-none">
                  {message.role === 'assistant' ? (
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                <div 
                  className={`text-xs mt-1 ${
                    message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
              
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-university-navy text-white">
                    {/* Use first letter of user name or default to 'U' */}
                    U
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-university-gold text-white">AI</AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-3 py-2 bg-gray-100 text-gray-800">
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>
        
        <CardFooter className="p-3 border-t">
          <form onSubmit={handleSendMessage} className="flex w-full gap-2">
            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !inputValue.trim()}
              className="bg-university-blue hover:bg-university-navy"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AIChat;
