'use client'

import { useState, useEffect } from 'react'

interface ActivityLogEntry {
  id: string
  type: 'comment' | 'edit' | 'status_change' | 'assignment' | 'creation'
  description: string
  timestamp: Date
  user: {
    id: string
    name: string
    email: string
  }
  entityType: string
  entityId: string
  metadata?: any
}

interface UseActivityLogOptions {
  entityType: string
  entityId: string
  limit?: number
  autoRefresh?: boolean
}

interface UseActivityLogReturn {
  activities: ActivityLogEntry[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  hasMore: boolean
  loadMore: () => Promise<void>
}

export function useActivityLog({
  entityType,
  entityId,
  limit = 20,
  autoRefresh = false
}: UseActivityLogOptions): UseActivityLogReturn {
  const [activities, setActivities] = useState<ActivityLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchActivities = async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        entityType,
        entityId,
        limit: limit.toString(),
        offset: reset ? '0' : offset.toString()
      })

      const response = await fetch(`/api/activity-log?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch activity log: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (reset) {
        setActivities(data.activities)
        setOffset(data.activities.length)
      } else {
        setActivities(prev => [...prev, ...data.activities])
        setOffset(prev => prev + data.activities.length)
      }
      
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setOffset(0)
    await fetchActivities(true)
  }

  const loadMore = async () => {
    if (!hasMore || loading) return
    await fetchActivities(false)
  }

  // Initial load
  useEffect(() => {
    fetchActivities(true)
  }, [entityType, entityId, limit])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(refresh, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [autoRefresh])

  return {
    activities,
    loading,
    error,
    refresh,
    hasMore,
    loadMore
  }
} 