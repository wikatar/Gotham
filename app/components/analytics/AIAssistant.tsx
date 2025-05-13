'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Button from '../ui/Button'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [currentContext, setCurrentContext] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Add welcome message when the component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: 'Hello! I\'m your Monolith Analytics assistant. How can I help you with your data analysis today?',
          timestamp: new Date()
        }
      ])
    }
  }, [messages])

  // Update context based on current page
  useEffect(() => {
    let context = 'Monolith Analytics platform'
    
    if (pathname === '/') {
      setCurrentContext('Dashboard')
      context = 'Dashboard showing key metrics, stats cards, and interactive charts'
    } else if (pathname === '/globe') {
      setCurrentContext('Global Visualization')
      context = 'World map showing geographic data points, connections between locations, and category filtering'
    } else if (pathname === '/database') {
      setCurrentContext('Database Explorer')
      context = 'Database explorer showing tables, schemas, and data records with filtering capabilities'
    } else if (pathname === '/ai-insights') {
      setCurrentContext('AI Insights')
      context = 'AI-generated insights panel showing analysis of business data with confidence scores'
    } else {
      setCurrentContext('Monolith Analytics')
    }

    // Add a context message if new context and not first message
    if (messages.length > 0 && messages[messages.length - 1].role === 'user' && currentContext !== context) {
      handleAIResponse(`I see you're looking at the ${context}. I can help you understand the data here.`);
    }
  }, [pathname])

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim()) return
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prevMessages => [...prevMessages, userMessage])
    setInputValue('')
    setIsLoading(true)
    
    // Simulate AI processing
    setTimeout(() => {
      generateAIResponse(inputValue, currentContext)
    }, 1000)
  }
  
  const generateAIResponse = (query: string, context: string) => {
    let response = ''
    
    // Simple response generation based on keywords and context
    if (query.toLowerCase().includes('dashboard') || context === 'Dashboard') {
      response = 'The dashboard shows key performance metrics for your business. The charts are interactive - you can toggle between different visualization types by clicking the buttons above each chart.'
    } else if (query.toLowerCase().includes('globe') || query.toLowerCase().includes('map') || context === 'Global Visualization') {
      response = 'The global visualization shows your data points across different geographical locations. You can filter by category, zoom in/out, and see connections between different locations.'
    } else if (query.toLowerCase().includes('database') || context === 'Database Explorer') {
      response = 'The database explorer allows you to browse your data tables, view schemas, and filter records. This gives you deeper insight into the structure of your data.'
    } else if (query.toLowerCase().includes('insight') || query.toLowerCase().includes('ai') || context === 'AI Insights') {
      response = 'The AI Insights section shows automatically generated analysis of your data. Each insight has a confidence score and relevant tags to help you understand its significance.'
    } else if (query.toLowerCase().includes('help') || query.toLowerCase().includes('how')) {
      response = 'I can help you navigate Monolith Analytics, understand the data visualizations, explain metrics, or answer questions about the platform. Just let me know what you\'re looking for!'
    } else {
      response = 'I understand you\'re asking about ' + query + '. While I\'m a simplified demonstration of what an AI assistant could do in this platform, in a full implementation I would analyze your data and provide specific insights.'
    }
    
    handleAIResponse(response)
  }
  
  const handleAIResponse = (response: string) => {
    const aiMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }
    
    setMessages(prevMessages => [...prevMessages, aiMessage])
    setIsLoading(false)
  }

  // If not open, don't render
  if (!isOpen) return null

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-background-paper rounded-lg shadow-lg border border-secondary/20 flex flex-col z-50 animate-fade-in">
      <div className="flex justify-between items-center p-4 border-b border-secondary/20">
        <div className="font-medium">AI Assistant</div>
        <div className="text-xs text-text-secondary">Context: {currentContext}</div>
        <button 
          onClick={onClose} 
          className="text-text-secondary hover:text-text-primary"
        >
          ✕
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`max-w-[80%] rounded-lg p-3 ${
              message.role === 'user' 
                ? 'bg-primary ml-auto' 
                : 'bg-secondary/20 mr-auto'
            }`}
          >
            <div className="text-sm">{message.content}</div>
            <div className="text-xs text-text-secondary mt-1">
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="bg-secondary/20 rounded-lg p-3 max-w-[80%] mr-auto">
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse"></div>
              <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-100"></div>
              <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-200"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form 
        onSubmit={handleSendMessage}
        className="p-4 border-t border-secondary/20 flex items-center space-x-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask me anything about your data..."
          className="flex-1 px-4 py-2 bg-background rounded-md border border-secondary/40 focus:border-accent focus:outline-none"
          disabled={isLoading}
        />
        <Button 
          type="submit" 
          disabled={isLoading || !inputValue.trim()}
        >
          Send
        </Button>
      </form>
    </div>
  )
} 