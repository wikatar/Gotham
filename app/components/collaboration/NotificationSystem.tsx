'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { useWebSocket } from '../../hooks/useWebSocket'

interface Notification {
  id: string
  type: 'comment' | 'activity' | 'mention' | 'system'
  title: string
  message: string
  entityType?: string
  entityId?: string
  actionUrl?: string
  timestamp: Date
  read: boolean
  priority: 'low' | 'normal' | 'high'
  avatar?: string
  authorName?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
  currentUser: {
    id: string
    name: string
    email: string
  }
}

export function NotificationProvider({ children, currentUser }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev].slice(0, 50)) // Keep max 50 notifications
    
    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      })
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter(n => !n.read).length

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

interface NotificationBellProps {
  className?: string
}

export function NotificationBell({ className = '' }: NotificationBellProps) {
  const { unreadCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9a5 5 0 00-10 0v3l-5 5h5m10 0v1a3 3 0 01-6 0v-1m6 0H9" />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationDropdown onClose={() => setIsOpen(false)} />}
    </div>
  )
}

interface NotificationDropdownProps {
  onClose: () => void
}

function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead, markAllAsRead, removeNotification, clearAll } = useNotifications()
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('[data-notification-dropdown]')) {
        onClose()
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'comment': return '💬'
      case 'activity': return '📋'
      case 'mention': return '👤'
      case 'system': return '🔔'
      default: return '📋'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'normal': return 'border-l-blue-500'
      case 'low': return 'border-l-gray-400'
      default: return 'border-l-gray-400'
    }
  }

  return (
    <div 
      data-notification-dropdown
      className="absolute right-0 top-full mt-2 w-96 bg-background-paper border border-secondary/20 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden"
    >
      {/* Header */}
      <div className="p-4 border-b border-secondary/20 flex justify-between items-center">
        <h3 className="font-medium">Notifications</h3>
        <div className="flex gap-2">
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary/80"
            >
              Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="text-xs text-text-secondary hover:text-text-primary"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-5-5V9a5 5 0 00-10 0v3l-5 5h5m10 0v1a3 3 0 01-6 0v-1m6 0H9" />
              </svg>
            </div>
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} hover:bg-secondary/5 cursor-pointer ${!notification.read ? 'bg-primary/5' : ''}`}
              onClick={() => {
                if (!notification.read) {
                  markAsRead(notification.id)
                }
                if (notification.actionUrl) {
                  // Navigate to URL
                  window.location.href = notification.actionUrl
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-lg">
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium truncate">{notification.title}</h4>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                      className="text-text-secondary hover:text-text-primary text-xs"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <p className="text-sm text-text-secondary line-clamp-2 mb-2">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-secondary">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-primary rounded-full" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Hook for integrating with collaboration events
export function useCollaborationNotifications(currentUser: { id: string; name: string; email: string }) {
  const { addNotification } = useNotifications()

  const notifyNewComment = (comment: any, entityType: string, entityTitle: string) => {
    if (comment.authorEmail !== currentUser.email) {
      addNotification({
        type: 'comment',
        priority: 'normal',
        title: 'New Comment',
        message: `${comment.authorName} commented on ${entityType} "${entityTitle}"`,
        entityType,
        entityId: comment.entityId,
        authorName: comment.authorName,
        actionUrl: `/collaboration/${entityType}/${comment.entityId}#comment-${comment.id}`
      })
    }
  }

  const notifyActivity = (activity: any, entityType: string, entityTitle: string) => {
    if (activity.actor !== currentUser.email) {
      addNotification({
        type: 'activity',
        priority: activity.action === 'resolved' ? 'high' : 'normal',
        title: 'Activity Update',
        message: `${activity.actorName} ${activity.description} in ${entityType} "${entityTitle}"`,
        entityType,
        entityId: activity.entityId,
        authorName: activity.actorName,
        actionUrl: `/collaboration/${entityType}/${activity.entityId}`
      })
    }
  }

  const notifyMention = (mentioner: string, entityType: string, entityTitle: string, entityId: string) => {
    addNotification({
      type: 'mention',
      priority: 'high',
      title: 'You were mentioned',
      message: `${mentioner} mentioned you in ${entityType} "${entityTitle}"`,
      entityType,
      entityId,
      authorName: mentioner,
      actionUrl: `/collaboration/${entityType}/${entityId}`
    })
  }

  return {
    notifyNewComment,
    notifyActivity,
    notifyMention
  }
} 