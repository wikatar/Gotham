import { useEffect, useState } from 'react'
import Card from '../../app/components/ui/Card'
import Button from '../../app/components/ui/Button'
import PipelineExecutionDetail from './PipelineExecutionDetail'
import PipelineResultCard from '@/app/components/pipelines/PipelineResultCard'
import Link from 'next/link'

// Simple skeleton component
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
)

type User = {
  id: string
  name: string
  email: string
}

type PipelineInfo = {
  name: string
  missionId: string
}

type Exec = {
  id: string
  pipelineId: string
  status: string
  startedAt: string
  endedAt?: string
  error?: string
  userId?: string
  user?: User
  pipeline?: PipelineInfo
}

interface PipelineHistoryProps {
  pipelineId?: string;
  accountId?: string;
  missionId?: string;
  limit?: number;
}

export default function PipelineHistory({
  pipelineId,
  accountId = 'demo-account',
  missionId,
  limit = 10
}: PipelineHistoryProps) {
  const [execs, setExecs] = useState<Exec[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null)

  useEffect(() => {
    // Build the query string based on provided props
    let queryParams = new URLSearchParams()
    
    if (pipelineId) {
      queryParams.append('pipelineId', pipelineId)
    }
    
    if (accountId) {
      queryParams.append('accountId', accountId)
    }
    
    if (missionId) {
      queryParams.append('missionId', missionId)
    }
    
    if (limit) {
      queryParams.append('limit', limit.toString())
    }
    
    // Fetch the execution history
    setLoading(true)
    fetch(`/api/pipelines/history?${queryParams.toString()}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch execution history')
        }
        return res.json()
      })
      .then((data) => {
        setExecs(data.executions)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [pipelineId, accountId, missionId, limit])

  // If an execution is selected, show its details
  if (selectedExecution) {
    return (
      <PipelineExecutionDetail 
        executionId={selectedExecution} 
        onBack={() => setSelectedExecution(null)}
      />
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        Error loading pipeline history: {error}
      </div>
    )
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">⏱ Pipeline Execution History</h2>
      
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} title="Loading...">
              <div className="flex justify-between">
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : execs.length > 0 ? (
        <div className="space-y-4">
          {execs.map((e) => {
            // Transform the execution data to match PipelineResultCard interface
            const execution = {
              id: e.id,
              pipelineId: e.pipelineId,
              pipelineName: e.pipeline?.name,
              status: e.status as 'success' | 'error' | 'running' | 'pending',
              startedAt: new Date(e.startedAt),
              endedAt: e.endedAt ? new Date(e.endedAt) : undefined,
              error: e.error,
              user: e.user
            }

            return (
              <PipelineResultCard
                key={e.id}
                execution={execution}
                onViewDetails={(id) => setSelectedExecution(id)}
                onRunAgain={(pipelineId, input) => {
                  console.log('Run again:', pipelineId, input)
                  // TODO: Implement run again functionality
                }}
              />
            )
          })}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <p className="text-gray-500">No execution history found.</p>
        </div>
      )}
    </div>
  )
} 