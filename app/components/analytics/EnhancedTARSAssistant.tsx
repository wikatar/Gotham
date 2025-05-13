'use client'

import { useState, useEffect, useRef } from 'react'
import Button from '../ui/Button'
import { useTARS } from '../../lib/tarsContext'
import TARSDraggable from './TARSDraggable'
import { TARSMessage, TARSConversation, getOrCreateCurrentConversation, createConversation, addMessageToConversation, getAllConversations } from '../../lib/tarsChatHistory'

export default function EnhancedTARSAssistant() {
  const { 
    isExpanded, 
    toggleTARS, 
    collapseTARS,
    currentContext,
    trustLevel 
  } = useTARS()
  
  const [conversations, setConversations] = useState<TARSConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<TARSConversation | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [animateRing, setAnimateRing] = useState(false)
  const [showConversationList, setShowConversationList] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Load conversations and set current conversation
  useEffect(() => {
    const allConversations = getAllConversations()
    setConversations(allConversations)
    
    const current = getOrCreateCurrentConversation()
    setCurrentConversation(current)
    
    // Prevent closing when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        // Don't collapse TARS when clicking outside
        // This prevents the behavior of closing when clicking elsewhere
        event.stopPropagation()
      }
    };
    
    // Handle the keydown event for Escape key
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isExpanded) {
        collapseTARS()
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isExpanded, collapseTARS])

  // Add welcome message if needed
  useEffect(() => {
    if (currentConversation && currentConversation.messages.length === 0) {
      const welcomeMessage: Omit<TARSMessage, 'id'> = {
        role: 'assistant',
        content: 'Hello, I\'m TARS. How can I assist with your data analysis today?',
        timestamp: new Date()
      }
      
      const updatedConversation = addMessageToConversation(
        currentConversation.id, 
        welcomeMessage
      )
      
      if (updatedConversation) {
        setCurrentConversation(updatedConversation)
        setConversations(getAllConversations())
      }
    }
  }, [currentConversation])

  // Auto-scroll to the bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inputValue.trim() || !currentConversation) return
    
    // Add user message
    const userMessage: Omit<TARSMessage, 'id'> = {
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    const updatedConversation = addMessageToConversation(
      currentConversation.id,
      userMessage
    )
    
    if (updatedConversation) {
      setCurrentConversation(updatedConversation)
      setConversations(getAllConversations())
    }
    
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
    if (!currentConversation) return
    
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
    if (!currentConversation) return
    
    const aiMessage: Omit<TARSMessage, 'id'> = {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }
    
    const updatedConversation = addMessageToConversation(
      currentConversation.id,
      aiMessage
    )
    
    if (updatedConversation) {
      setCurrentConversation(updatedConversation)
      setConversations(getAllConversations())
    }
    
    setIsLoading(false)
  }
  
  const startNewConversation = () => {
    const newConversation = createConversation()
    setCurrentConversation(newConversation)
    setConversations(getAllConversations())
    setShowConversationList(false)
  }
  
  const switchToConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id)
    if (conversation) {
      setCurrentConversation(conversation)
      setShowConversationList(false)
    }
  }

  // Using TARSDraggable to make TARS movable
  return (
    <TARSDraggable isExpanded={isExpanded}>
      <div ref={containerRef} className="w-full h-full flex flex-col overflow-hidden">
        {/* Header section */}
        <div className="flex justify-between items-center p-4 border-b border-secondary/20 no-drag bg-background-paper">
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
            <div className="flex-1 min-w-0">
              <div className="font-medium flex items-center gap-2">
                <span>TARS</span>
                {isExpanded && (
                  <button 
                    onClick={() => setShowConversationList(!showConversationList)}
                    className="text-xs bg-secondary/10 hover:bg-secondary/20 px-2 py-1 rounded-md no-drag"
                    title="View conversation history"
                  >
                    {currentConversation?.title || 'Current conversation'} ▾
                  </button>
                )}
              </div>
              {isExpanded && (
                <div className="text-xs text-text-secondary">Context: {currentContext}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isExpanded && (
              <button 
                onClick={startNewConversation}
                className="text-text-secondary hover:text-text-primary no-drag p-1"
                title="New conversation"
              >
                +
              </button>
            )}
            <button 
              onClick={toggleTARS} 
              className="text-text-secondary hover:text-text-primary no-drag"
            >
              {isExpanded ? '✕' : '↗'}
            </button>
          </div>
        </div>
        
        {/* Conversation list dropdown */}
        {isExpanded && showConversationList && (
          <div className="absolute top-16 left-0 right-0 bg-background-elevated z-10 max-h-[200px] overflow-y-auto shadow-lg border border-secondary/20 no-drag">
            <div className="p-2 text-xs text-text-secondary border-b border-secondary/20">
              Conversation History
            </div>
            <div>
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => switchToConversation(conv.id)}
                  className={`block w-full text-left px-3 py-2 text-sm hover:bg-secondary/10 truncate ${
                    currentConversation?.id === conv.id ? 'bg-secondary/20' : ''
                  }`}
                >
                  {conv.title}
                </button>
              ))}
              {conversations.length === 0 && (
                <div className="px-3 py-2 text-sm text-text-secondary">
                  No conversations yet
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Chat content area - only shown when expanded */}
        {isExpanded && currentConversation && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentConversation.messages.map(message => (
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
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
            
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t border-secondary/20 flex items-center space-x-2 no-drag"
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
    </TARSDraggable>
  )
}
