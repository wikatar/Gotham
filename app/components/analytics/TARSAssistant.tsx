'use client'

import { useState, useEffect, useRef } from 'react'
import Button from '../ui/Button'
import { useTARS } from '../../lib/tarsContext'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function TARSAssistant() {
  const { 
    isExpanded, 
    toggleTARS, 
    currentContext,
    trustLevel 
  } = useTARS()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [animateRing, setAnimateRing] = useState(false)
  const [lastContextSeen, setLastContextSeen] = useState(currentContext)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  // Add welcome message when the component mounts
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: 'Hello, I\'m TARS. How can I assist with your data analysis today?',
          timestamp: new Date()
        }
      ])
    }
  }, [messages.length])

  // Send context message when context changes
  useEffect(() => {
    if (messages.length > 0 && currentContext !== lastContextSeen) {
      // Only send context message if the user has interacted 
      if (messages.some(m => m.role === 'user')) {
        handleAIResponse(`I notice you're viewing the ${currentContext}. I've updated my context awareness to better assist you with this view.`);
      }
      setLastContextSeen(currentContext);
    }
  }, [currentContext, messages, lastContextSeen])

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

    // Animate the ring (visual feedback)
    setAnimateRing(true)
    setTimeout(() => setAnimateRing(false), 2000)
    
    // Simulate AI processing with variable response time
    setTimeout(() => {
      generateAIResponse(inputValue)
    }, Math.random() * 500 + 800) // 800-1300ms
  }
  
  const generateAIResponse = (query: string) => {
    let response = ''
    
    // Enhanced response generation based on keywords and context
    if (query.toLowerCase().includes('dashboard') || currentContext === 'Dashboard') {
      response = 'The dashboard displays your organization\'s key performance metrics. The interactive visualizations allow you to drill down into specific time periods and data segments. I can help you analyze any anomalies or trends you observe.'
    } else if (query.toLowerCase().includes('globe') || query.toLowerCase().includes('map') || currentContext === 'Global Intelligence') {
      response = 'The global intelligence map visualizes your data across geographic regions. You can identify patterns by toggling between different data layers, zoom to specific regions, or filter by various attributes. Each connection represents a relationship worth investigating.'
    } else if (query.toLowerCase().includes('database') || currentContext === 'Database Explorer') {
      response = 'The database explorer provides access to your structured data sources. You can examine schemas, view relationships between entities, and query specific datasets. I can help you construct queries or identify data quality issues.'
    } else if (query.toLowerCase().includes('insight') || query.toLowerCase().includes('ai') || currentContext === 'AI Insights') {
      response = 'The AI Insights section leverages advanced algorithms to extract meaning from your data. Each insight is calculated with a specific confidence level and categorized by business impact. I can explain the methodology behind any insight or suggest further areas to investigate.'
    } else if (query.toLowerCase().includes('help') || query.toLowerCase().includes('how')) {
      response = 'I\'m TARS, your analytical assistant powered by advanced machine learning. I provide contextual guidance, data interpretation, and actionable recommendations. How can I assist with your current analysis needs?'
    } else if (query.toLowerCase().includes('tars') || query.toLowerCase().includes('your name')) {
      response = 'I\'m TARS, named after the adaptive AI from Interstellar. I\'m designed to assist with data analysis, visualization interpretation, and insight generation across the Gotham Analytics platform. My purpose is to augment your analytical capabilities and help extract meaningful insights from complex data.'
    } else {
      response = `Based on your query about "${query}", I can provide several analytical perspectives. In a full implementation, I would connect to your live data sources to deliver real-time insights. Would you like me to focus on specific metrics or patterns related to this topic?`;
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

  // Function to suggest questions based on current context
  const getSuggestedQuestions = () => {
    switch(currentContext) {
      case 'Dashboard':
        return ['What insights can you provide from the dashboard metrics?', 'How do these trends compare to last quarter?'];
      case 'Global Intelligence':
        return ['What regions show the highest activity?', 'Can you explain the connection patterns I\'m seeing?'];
      case 'Database Explorer':
        return ['What schema relationships should I be aware of?', 'Can you help me understand this data model?'];
      case 'AI Insights':
        return ['What\'s the confidence level of these insights?', 'How were these predictions generated?'];
      default:
        return ['What capabilities does Gotham Analytics offer?', 'How can you help me analyze my data?'];
    }
  }

  return (
    <div className={`fixed ${isExpanded ? 'bottom-0 right-0 lg:right-0 h-[600px] w-full sm:w-[400px]' : 'bottom-20 right-6 w-[300px] h-[60px]'} bg-background-paper rounded-lg shadow-lg border border-secondary/30 flex flex-col z-50 transition-all duration-300 overflow-hidden`}>
      {/* Header with expandable UI */}
      <div 
        className={`flex justify-between items-center p-4 border-b border-secondary/20 ${!isExpanded ? 'cursor-pointer' : ''} bg-background-paper`}
        onClick={!isExpanded ? toggleTARS : undefined}
      >
        <div className="flex items-center gap-3">
          {/* TARS visual indicator - circular ring that animates when processing */}
          <div className="relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-primary ${animateRing ? 'animate-ping opacity-30 absolute inset-0' : ''}`}>
              <span className="text-lg font-bold">T</span>
            </div>
            {!animateRing && (
              <svg className="absolute top-0 left-0 w-8 h-8" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" 
                  strokeWidth="2" strokeDasharray={`${trustLevel} 100`}
                  className="text-accent transform -rotate-90 origin-center" />
              </svg>
            )}
          </div>
          <div>
            <div className="font-medium">TARS</div>
            {isExpanded && (
              <div className="text-xs text-text-secondary">Context: {currentContext}</div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!isExpanded && (
            <div className="text-xs text-text-secondary px-2 py-1 bg-secondary/10 rounded-md">
              {currentContext}
            </div>
          )}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              toggleTARS();
            }} 
            className="text-text-secondary hover:text-text-primary"
          >
            {isExpanded ? '✕' : '↗'}
          </button>
        </div>
      </div>
      
      {/* Collapsed view shows last message */}
      {!isExpanded && messages.length > 0 && (
        <div className="p-2 text-xs text-text-secondary truncate">
          {messages[messages.length - 1].content.slice(0, 50)}
          {messages[messages.length - 1].content.length > 50 ? '...' : ''}
        </div>
      )}
      
      {/* Expanded view shows full chat interface */}
      {isExpanded && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div 
                key={message.id} 
                className={`max-w-[85%] rounded-lg p-3 ${
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
              <div className="bg-secondary/20 rounded-lg p-3 max-w-[85%] mr-auto">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-100"></div>
                  <div className="w-2 h-2 rounded-full bg-text-secondary animate-pulse delay-200"></div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Suggested questions UI */}
          {messages.length < 3 && (
            <div className="px-4 py-2 space-y-2">
              <div className="text-xs text-text-secondary">Suggested questions:</div>
              <div className="flex flex-wrap gap-2">
                {getSuggestedQuestions().map((question, index) => (
                  <button
                    key={index}
                    className="text-xs bg-secondary/10 hover:bg-secondary/20 rounded-full px-3 py-1 text-text-secondary transition-colors"
                    onClick={() => {
                      setInputValue(question);
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <form 
            onSubmit={handleSendMessage}
            className="p-4 border-t border-secondary/20 flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask TARS anything about your data..."
              className="flex-1 px-4 py-2 bg-background rounded-md border border-secondary/40 focus:border-accent focus:outline-none"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()}
              className="bg-primary hover:bg-primary-light"
            >
              Send
            </Button>
          </form>
        </>
      )}
    </div>
  )
} 