'use client'

import { useState, useEffect, useCallback } from 'react'

interface LineageStep {
  id: string
  entityId: string | null
  pipelineId: string | null
  agentId: string | null
  input: string
  output: string
  step: string
  source: string | null
  createdAt: Date
  entity?: {
    id: string
    name: string | null
    type: string
  }
}

interface UseLineageOptions {
  entityId?: string
  pipelineId?: string
  autoRefresh?: boolean
  refreshInterval?: number
  limit?: number
}

interface UseLineageReturn {
  steps: LineageStep[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  hasMore: boolean
  loadMore: () => Promise<void>
}

export function useLineage({
  entityId,
  pipelineId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  limit = 50
}: UseLineageOptions = {}): UseLineageReturn {
  const [steps, setSteps] = useState<LineageStep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchLineage = useCallback(async (reset = false) => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (entityId) params.append('entityId', entityId)
      if (pipelineId) params.append('pipelineId', pipelineId)
      params.append('limit', limit.toString())
      params.append('offset', reset ? '0' : offset.toString())

      const response = await fetch(`/api/lineage?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch lineage: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (reset) {
        setSteps(data.steps)
        setOffset(data.steps.length)
      } else {
        setSteps(prev => [...prev, ...data.steps])
        setOffset(prev => prev + data.steps.length)
      }
      
      setHasMore(data.hasMore)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [entityId, pipelineId, limit, offset])

  const refresh = useCallback(async () => {
    setOffset(0)
    await fetchLineage(true)
  }, [fetchLineage])

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return
    await fetchLineage(false)
  }, [fetchLineage, hasMore, loading])

  // Initial load
  useEffect(() => {
    fetchLineage(true)
  }, [entityId, pipelineId, limit])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(refresh, refreshInterval)
    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refresh])

  return {
    steps,
    loading,
    error,
    refresh,
    hasMore,
    loadMore
  }
}

// Hook for getting lineage statistics
export function useLineageStats(entityId?: string, pipelineId?: string) {
  const [stats, setStats] = useState({
    totalSteps: 0,
    pipelineCount: 0,
    sourceCount: 0,
    agentCount: 0,
    successRate: 0,
    lastActivity: null as Date | null
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (entityId) params.append('entityId', entityId)
        if (pipelineId) params.append('pipelineId', pipelineId)

        const response = await fetch(`/api/lineage/stats?${params}`)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch lineage stats: ${response.statusText}`)
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [entityId, pipelineId])

  return { stats, loading, error }
}

// Hook for real-time lineage updates
export function useLineageRealtime(entityId?: string, pipelineId?: string) {
  const [realtimeSteps, setRealtimeSteps] = useState<LineageStep[]>([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Mock WebSocket connection for real-time updates
    // In a real implementation, this would connect to a WebSocket server
    const mockConnection = () => {
      setConnected(true)
      
      // Simulate real-time updates every 10 seconds
      const interval = setInterval(() => {
        const mockStep: LineageStep = {
          id: `realtime-${Date.now()}`,
          entityId: entityId || null,
          pipelineId: pipelineId || `pipeline-${Date.now()}`,
          agentId: 'realtime-agent',
          input: JSON.stringify({ timestamp: new Date().toISOString() }),
          output: JSON.stringify({ status: 'processed', timestamp: new Date().toISOString() }),
          step: 'realtime_update',
          source: 'Real-time Monitor',
          createdAt: new Date()
        }
        
        setRealtimeSteps(prev => [mockStep, ...prev.slice(0, 9)]) // Keep last 10
      }, 10000)

      return () => {
        clearInterval(interval)
        setConnected(false)
      }
    }

    const cleanup = mockConnection()
    return cleanup
  }, [entityId, pipelineId])

  return { realtimeSteps, connected }
} 