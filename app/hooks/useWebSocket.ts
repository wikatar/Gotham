'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface WebSocketMessage {
  type: 'comment_added' | 'comment_updated' | 'comment_deleted' | 'activity_logged' | 'user_typing' | 'user_joined' | 'user_left'
  payload: any
  entityType?: string
  entityId?: string
  userId?: string
  timestamp?: string
}

interface UseWebSocketOptions {
  entityType: string
  entityId: string
  userId: string
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Event) => void
}

export function useWebSocket({
  entityType,
  entityId,
  userId,
  onMessage,
  onConnect,
  onDisconnect,
  onError
}: UseWebSocketOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected')
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return
    }

    setConnectionState('connecting')
    
    // In a real app, this would be your WebSocket server URL
    // For now, we'll simulate with a mock WebSocket-like interface
    const wsUrl = process.env.NODE_ENV === 'development' 
      ? `ws://localhost:3001/collaboration/${entityType}/${entityId}`
      : `wss://your-production-domain.com/collaboration/${entityType}/${entityId}`

    try {
      // For demo purposes, we'll create a mock WebSocket that simulates real behavior
      const ws = new MockWebSocket(wsUrl, { entityType, entityId, userId })
      
      ws.onopen = () => {
        console.log(`WebSocket connected for ${entityType}:${entityId}`)
        setIsConnected(true)
        setConnectionState('connected')
        reconnectAttempts.current = 0
        
        // Join room for this entity
        ws.send(JSON.stringify({
          type: 'join_room',
          payload: { entityType, entityId, userId }
        }))
        
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          // Handle system messages
          switch (message.type) {
            case 'user_joined':
              setOnlineUsers(prev => [...prev.filter(id => id !== message.payload.userId), message.payload.userId])
              break
            case 'user_left':
              setOnlineUsers(prev => prev.filter(id => id !== message.payload.userId))
              break
            case 'online_users':
              setOnlineUsers(message.payload.users || [])
              break
            default:
              onMessage?.(message)
              break
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        setIsConnected(false)
        setConnectionState('disconnected')
        setOnlineUsers([])
        wsRef.current = null
        onDisconnect?.()

        // Auto-reconnect logic
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
          console.log(`Reconnecting in ${delay}ms... (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`)
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnectionState('error')
        onError?.(error)
      }

      wsRef.current = ws as any
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionState('error')
    }
  }, [entityType, entityId, userId, onMessage, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'User initiated disconnect')
      wsRef.current = null
    }
    
    setIsConnected(false)
    setConnectionState('disconnected')
    setOnlineUsers([])
  }, [])

  const sendMessage = useCallback((message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString()
      }))
      return true
    }
    return false
  }, [])

  const sendTypingIndicator = useCallback(() => {
    sendMessage({
      type: 'user_typing',
      payload: { userId, entityType, entityId }
    })
  }, [sendMessage, userId, entityType, entityId])

  // Connect on mount
  useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
    }
  }, [])

  return {
    isConnected,
    connectionState,
    onlineUsers,
    sendMessage,
    sendTypingIndicator,
    connect,
    disconnect
  }
}

// Mock WebSocket for development/demo purposes
class MockWebSocket {
  private url: string
  private options: any
  private readyState: number = WebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null

  constructor(url: string, options: any) {
    this.url = url
    this.options = options
    
    // Simulate connection delay
    setTimeout(() => {
      this.readyState = WebSocket.OPEN
      this.onopen?.(new Event('open'))
      
      // Simulate receiving online users
      setTimeout(() => {
        this.onmessage?.(new MessageEvent('message', {
          data: JSON.stringify({
            type: 'online_users',
            payload: { users: ['user-1', 'user-2', options.userId] }
          })
        }))
      }, 500)
    }, 1000)
  }

  send(data: string) {
    if (this.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not open')
    }
    
    // In development, we can simulate server responses
    if (process.env.NODE_ENV === 'development') {
      const message = JSON.parse(data)
      console.log('Mock WebSocket sending:', message)
      
      // Simulate server acknowledgment for certain message types
      if (message.type === 'join_room') {
        setTimeout(() => {
          this.onmessage?.(new MessageEvent('message', {
            data: JSON.stringify({
              type: 'user_joined',
              payload: { userId: message.payload.userId }
            })
          }))
        }, 100)
      }
    }
  }

  close(code?: number, reason?: string) {
    this.readyState = WebSocket.CLOSED
    setTimeout(() => {
      this.onclose?.(new CloseEvent('close', { code: code || 1000, reason: reason || '' }))
    }, 100)
  }

  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3
} 