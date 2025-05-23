'use client'

import { useState } from 'react'
import { useComments } from './hooks/useComments'
import { useActivityLog } from './hooks/useActivityLog'
import { formatDistanceToNow } from 'date-fns'
import { sv } from 'date-fns/locale'

interface CollaborationSidebarProps {
  entityType: 'mission' | 'agent' | 'incident' | 'anomaly' | 'execution'
  entityId: string
  currentUser: {
    id: string
    name: string
    email: string
  }
  className?: string
}

export default function CollaborationSidebar({
  entityType,
  entityId,
  currentUser,
  className = ''
}: CollaborationSidebarProps) {
  const [activeView, setActiveView] = useState<'comments' | 'activity'>('comments')
  const { comments, loading: commentsLoading } = useComments(entityType, entityId)
  const { activities, loading: activitiesLoading } = useActivityLog(entityType, entityId)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500'
    ]
    const hash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0)
      return a & a
    }, 0)
    return colors[Math.abs(hash) % colors.length]
  }

  const getActivityIcon = (action: string) => {
    switch (action) {
      case 'created': return '✨'
      case 'updated': return '📝'
      case 'status_changed': return '🔄'
      case 'severity_changed': return '⚠️'
      case 'resolved': return '✅'
      case 'assigned': return '👤'
      case 'comment_added': return '💬'
      default: return '📋'
    }
  }

  return (
    <div className={`bg-background-paper border border-secondary/20 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-secondary/20">
        <h3 className="font-medium text-sm mb-3">Collaboration</h3>
        <div className="flex bg-secondary/10 rounded-lg p-1">
          <button
            onClick={() => setActiveView('comments')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeView === 'comments'
                ? 'bg-background-paper text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            💬 Comments
          </button>
          <button
            onClick={() => setActiveView('activity')}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeView === 'activity'
                ? 'bg-background-paper text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            📋 Activity
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {activeView === 'comments' && (
          <div className="space-y-3">
            {commentsLoading ? (
              <div className="text-center py-4">
                <div className="text-xs text-text-secondary">Loading comments...</div>
              </div>
            ) : comments.length > 0 ? (
              comments.slice(0, 5).map((comment) => (
                <div key={comment.id} className="flex gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium ${getAvatarColor(comment.authorEmail)}`}>
                    {getInitials(comment.authorName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="text-xs font-medium truncate">{comment.authorName}</span>
                      <span className="text-xs text-text-secondary">
                        {formatDistanceToNow(new Date(comment.createdAt), { 
                          addSuffix: true, 
                          locale: sv 
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-xs text-text-secondary">Inga kommentarer än</div>
              </div>
            )}
            
            {comments.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-xs text-primary hover:text-primary/80">
                  Visa alla {comments.length} kommentarer
                </button>
              </div>
            )}
          </div>
        )}

        {activeView === 'activity' && (
          <div className="space-y-3">
            {activitiesLoading ? (
              <div className="text-center py-4">
                <div className="text-xs text-text-secondary">Loading activity...</div>
              </div>
            ) : activities.length > 0 ? (
              activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center text-xs">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-text-secondary mb-1">
                      <span className="font-medium text-text-primary">{activity.actorName}</span>
                      {' '}
                      {activity.description}
                    </div>
                    <div className="text-xs text-text-secondary">
                      {formatDistanceToNow(new Date(activity.createdAt), { 
                        addSuffix: true, 
                        locale: sv 
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <div className="text-xs text-text-secondary">Ingen aktivitet än</div>
              </div>
            )}
            
            {activities.length > 5 && (
              <div className="text-center pt-2">
                <button className="text-xs text-primary hover:text-primary/80">
                  Visa alla {activities.length} aktiviteter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 