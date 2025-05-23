'use client'

import { useState, useEffect, useRef } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'

interface OnlineUsersProps {
  entityType: string
  entityId: string
  currentUser: {
    id: string
    name: string
    email: string
  }
  className?: string
}

export function OnlineUsers({ entityType, entityId, currentUser, className = '' }: OnlineUsersProps) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const typingTimeouts = new Map<string, NodeJS.Timeout>()
  
  const { isConnected, connectionState, onlineUsers, sendMessage } = useWebSocket({
    entityType,
    entityId,
    userId: currentUser.id,
    onMessage: (message) => {
      if (message.type === 'user_typing' && message.payload.userId !== currentUser.id) {
        setTypingUsers(prev => new Set([...prev, message.payload.userId]))
        
        // Clear existing timeout for this user
        if (typingTimeouts.has(message.payload.userId)) {
          clearTimeout(typingTimeouts.get(message.payload.userId)!)
        }
        
        // Set new timeout to remove typing indicator after 3 seconds
        const timeout = setTimeout(() => {
          setTypingUsers(prev => {
            const newSet = new Set(prev)
            newSet.delete(message.payload.userId)
            return newSet
          })
          typingTimeouts.delete(message.payload.userId)
        }, 3000)
        
        typingTimeouts.set(message.payload.userId, timeout)
      }
    }
  })

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      typingTimeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  const getInitials = (userId: string) => {
    // In a real app, you'd fetch user data by ID
    // For demo, we'll generate initials from user ID
    return userId.slice(0, 2).toUpperCase()
  }

  const getAvatarColor = (userId: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ]
    const hash = userId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'error': return 'text-red-500'
      default: return 'text-gray-400'
    }
  }

  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected': return '🟢'
      case 'connecting': return '🟡'
      case 'error': return '🔴'
      default: return '⚫'
    }
  }

  const otherUsers = onlineUsers.filter(userId => userId !== currentUser.id)

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Connection Status */}
      <div className="flex items-center gap-1">
        <span className="text-xs">{getConnectionIcon()}</span>
        <span className={`text-xs font-medium ${getConnectionStatusColor()}`}>
          {connectionState === 'connected' && 'Live'}
          {connectionState === 'connecting' && 'Connecting...'}
          {connectionState === 'error' && 'Offline'}
          {connectionState === 'disconnected' && 'Disconnected'}
        </span>
      </div>

      {/* Online Users */}
      {otherUsers.length > 0 && (
        <>
          <div className="w-px h-4 bg-secondary/30" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-secondary">Online:</span>
            <div className="flex -space-x-1">
              {otherUsers.slice(0, 5).map((userId) => (
                <div
                  key={userId}
                  className={`relative w-6 h-6 rounded-full border-2 border-background-paper flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(userId)}`}
                  title={`User ${userId}`}
                >
                  {getInitials(userId)}
                  {typingUsers.has(userId) && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-background-paper">
                      <div className="w-full h-full rounded-full bg-green-400 animate-pulse" />
                    </div>
                  )}
                </div>
              ))}
              {otherUsers.length > 5 && (
                <div className="w-6 h-6 rounded-full bg-secondary/30 border-2 border-background-paper flex items-center justify-center text-xs text-text-secondary">
                  +{otherUsers.length - 5}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Typing Indicators */}
      {typingUsers.size > 0 && (
        <>
          <div className="w-px h-4 bg-secondary/30" />
          <div className="flex items-center gap-1">
            <TypingIndicator />
            <span className="text-xs text-text-secondary">
              {typingUsers.size === 1 
                ? '1 person typing...'
                : `${typingUsers.size} people typing...`
              }
            </span>
          </div>
        </>
      )}
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-1 h-1 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  )
}

interface RealTimeCommentInputProps {
  entityType: string
  entityId: string
  currentUser: {
    id: string
    name: string
    email: string
  }
  onSubmit: (content: string) => void
  placeholder?: string
  className?: string
}

export function RealTimeCommentInput({
  entityType,
  entityId,
  currentUser,
  onSubmit,
  placeholder = "Skriv en kommentar...",
  className = ''
}: RealTimeCommentInputProps) {
  const [content, setContent] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeoutRef = new useRef<NodeJS.Timeout>()

  const { sendMessage, sendTypingIndicator } = useWebSocket({
    entityType,
    entityId,
    userId: currentUser.id
  })

  const handleInputChange = (value: string) => {
    setContent(value)
    
    // Send typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true)
      sendTypingIndicator()
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
    }, 1000)
  }

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim())
      setContent('')
      setIsTyping(false)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`}>
      <textarea
        value={content}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full p-3 border border-secondary/30 rounded-lg resize-none focus:outline-none focus:border-primary"
        rows={3}
      />
      
      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isTyping && (
            <div className="flex items-center gap-1">
              <TypingIndicator />
              <span>Typing...</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={!content.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
} 