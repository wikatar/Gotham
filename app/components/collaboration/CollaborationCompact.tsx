'use client'

import { useState } from 'react'
import { useComments } from '@/app/hooks/useComments'
import { useActivityLog } from '@/app/hooks/useActivityLog'

interface CollaborationCompactProps {
  entityType: 'mission' | 'agent' | 'incident' | 'anomaly' | 'execution'
  entityId: string
  currentUser: {
    id: string
    name: string
    email: string
  }
  onExpand?: () => void
  className?: string
}

export default function CollaborationCompact({
  entityType,
  entityId,
  currentUser,
  onExpand,
  className = ''
}: CollaborationCompactProps) {
  const { comments } = useComments(entityType, entityId)
  const { activities } = useActivityLog(entityType, entityId)

  const totalComments = comments.length
  const recentActivity = activities.length > 0 ? activities[0] : null

  return (
    <div 
      className={`bg-background-paper border border-secondary/20 rounded-lg p-3 cursor-pointer hover:border-primary/30 transition-colors ${className}`}
      onClick={onExpand}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium">Collaboration</h4>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="flex items-center gap-1">
            💬 {totalComments}
          </span>
          <span className="flex items-center gap-1">
            📋 {activities.length}
          </span>
        </div>
      </div>
      
      {recentActivity ? (
        <div className="text-xs text-text-secondary">
          <span className="font-medium text-text-primary">{recentActivity.actorName}</span>
          {' '}
          {recentActivity.description}
        </div>
      ) : (
        <div className="text-xs text-text-secondary">
          Ingen aktivitet än
        </div>
      )}
      
      {onExpand && (
        <div className="mt-2 text-xs text-primary">
          Klicka för att visa detaljer →
        </div>
      )}
    </div>
  )
} 